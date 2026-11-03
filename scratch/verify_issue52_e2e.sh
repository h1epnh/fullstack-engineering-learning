#!/bin/bash
# End-to-end validation of issue #52 (TD-03): IPN signature verification, amount matching,
# replay defence, and the real top-up -> IPN -> wallet credit path.
#
# Runs against the live minikube cluster (topup-service + mock-bank-gateway deployed with the
# new images). Usage: ./scratch/verify_issue52_e2e.sh
set -u

NS=ewallet-lab
USER_ID=ab19c8ce-4ec8-455d-a894-35fc044d849e   # K8s Test User (VERIFIED, has a wallet)
AMOUNT=50000
SECRET=$(kubectl -n $NS get secret bank-gateway-credentials -o jsonpath='{.data.BANK_GATEWAY_SECRET_KEY}' | base64 -d)
ACCESS_KEY=$(kubectl -n $NS get secret bank-gateway-credentials -o jsonpath='{.data.BANK_GATEWAY_ACCESS_KEY}' | base64 -d)

PASS=0
FAIL=0

ok()  { echo "  PASS: $1"; PASS=$((PASS+1)); }
bad() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

balance() {
  kubectl exec -n $NS deploy/postgres -- psql -U postgres -d ewallet_wallet -t -A \
    -c "select coalesce(balance,0) from wallets where user_id='$USER_ID';" 2>/dev/null | tr -d '[:space:]'
}

topup_status() {
  kubectl exec -n $NS deploy/topup-service -- curl -s "http://localhost:8092/topups/$1" 2>/dev/null
}

# Signs an IPN exactly the way MoMo documents it (13 fields, sorted, "k=v" joined by "&").
sign_ipn() {
  python3 - "$ACCESS_KEY" "$SECRET" "$1" "$2" "$3" "$4" "$5" <<'PY'
import hmac, hashlib, sys
ak, sec, order_id, amount, ts, result, trans = sys.argv[1:8]
raw = (f"accessKey={ak}&amount={amount}&extraData=&message=msg&orderId={order_id}"
       f"&orderInfo=info&orderType=topup&partnerCode=EWALLET_LAB_PARTNER&payType=bankcard"
       f"&requestId=req-1&responseTime={ts}&resultCode={result}&transId={trans}")
print(hmac.new(sec.encode(), raw.encode(), hashlib.sha256).hexdigest())
PY
}

ipn_body() {
  # $1=orderId $2=amount $3=responseTime $4=resultCode $5=transId $6=signature
  printf '{"partnerCode":"EWALLET_LAB_PARTNER","orderId":"%s","requestId":"req-1","amount":%s,"orderInfo":"info","orderType":"topup","transId":%s,"resultCode":%s,"message":"msg","payType":"bankcard","responseTime":%s,"extraData":"","signature":"%s"}' \
    "$1" "$2" "$5" "$4" "$3" "$6"
}

post_ipn() {
  kubectl exec -n $NS deploy/topup-service -- curl -s -o /dev/null -w '%{http_code}' \
    -X POST http://localhost:8092/ipn/topup -H 'Content-Type: application/json' -d "$1" 2>/dev/null
}

echo "=== Issue #52 end-to-end validation (namespace $NS) ==="
echo

# ---------------------------------------------------------------- 1. happy path
echo "[1] Real top-up: POST /topups -> gateway ACK -> IPN -> wallet credit"
BEFORE=$(balance)
echo "    wallet balance before: $BEFORE"

INIT=$(kubectl exec -n $NS deploy/topup-service -- curl -s -X POST http://localhost:8092/topups \
  -H 'Content-Type: application/json' \
  -d "{\"userId\":\"$USER_ID\",\"amount\":$AMOUNT}" 2>/dev/null)
echo "    POST /topups -> $INIT"

ORDER_ID=$(echo "$INIT" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("orderId",""))' 2>/dev/null)
if [ -z "$ORDER_ID" ]; then
  bad "could not start a top-up (no orderId in response)"
else
  ok "top-up accepted, orderId=$ORDER_ID"
  sleep 3
  ST=$(topup_status "$ORDER_ID")
  echo "    GET /topups/$ORDER_ID -> $ST"
  echo "$ST" | grep -q 'CONFIRMED' && ok "order CONFIRMED (IPN accepted)" \
    || bad "order not CONFIRMED: $ST"
  sleep 4
  AFTER=$(balance)
  echo "    wallet balance after: $AFTER"
  EXPECT=$(python3 -c "from decimal import Decimal; print(Decimal('$BEFORE') + Decimal('$AMOUNT'))")
  if [ "$AFTER" = "$EXPECT" ]; then
    ok "wallet credited exactly once (+$AMOUNT, $BEFORE -> $AFTER)"
  else
    bad "wallet balance wrong: expected $EXPECT, got $AFTER"
  fi
fi
echo

# ---------------------------------------------------------------- 2. forged signature
echo "[2] Forged IPN (wrong signature) -> 401, no credit"
BEFORE_FORGE=$(balance)
FORGE_ORDER="topup-forged-$(date +%s)"
RESP=$(post_ipn "$(ipn_body "$FORGE_ORDER" "$AMOUNT" "$(date +%s000)" 0 1 deadbeefdeadbeef)")
echo "    POST /ipn/topup (forged signature) -> HTTP $RESP"
[ "$RESP" = "401" ] && ok "forged IPN rejected with 401" || bad "expected 401, got $RESP"
AFTER_FORGE=$(balance)
[ "$BEFORE_FORGE" = "$AFTER_FORGE" ] && ok "no credit from forged IPN" || bad "forged IPN credited the wallet"
echo

# ---------------------------------------------------------------- 3. missing signature
echo "[3] Missing signature -> 401"
RESP=$(post_ipn "$(printf '{"partnerCode":"P","orderId":"topup-nosig","requestId":"r","amount":1,"orderInfo":"x","orderType":"t","transId":1,"resultCode":0,"message":"m","payType":"p","responseTime":%s000,"extraData":""}' "$(date +%s)")")
echo "    POST /ipn/topup (no signature) -> HTTP $RESP"
[ "$RESP" = "401" ] && ok "missing signature rejected with 401" || bad "expected 401, got $RESP"
echo

# ---------------------------------------------------------------- 4. stale IPN (replay window)
echo "[4] Stale IPN (responseTime 1h old, valid signature) -> 401"
STALE_TS=$(( ($(date +%s) - 3600) * 1000 ))
STALE_SIG=$(sign_ipn "topup-stale" 1 "$STALE_TS" 0 1)
RESP=$(post_ipn "$(ipn_body "topup-stale" 1 "$STALE_TS" 0 1 "$STALE_SIG")")
echo "    POST /ipn/topup (stale responseTime) -> HTTP $RESP"
[ "$RESP" = "401" ] && ok "stale IPN rejected with 401" || bad "expected 401, got $RESP"
echo

# ---------------------------------------------------------------- 5. replay of a valid IPN
echo "[5] Replay of a VALID IPN for an already-CONFIRMED order -> no second credit"
if [ -n "${ORDER_ID:-}" ]; then
  BEFORE_REPLAY=$(balance)
  TS=$(date +%s000)
  SIG=$(sign_ipn "$ORDER_ID" "$AMOUNT" "$TS" 0 1)
  RESP=$(post_ipn "$(ipn_body "$ORDER_ID" "$AMOUNT" "$TS" 0 1 "$SIG")")
  echo "    POST /ipn/topup (valid signature, already-CONFIRMED order) -> HTTP $RESP"
  sleep 2
  AFTER_REPLAY=$(balance)
  echo "    wallet balance: $BEFORE_REPLAY -> $AFTER_REPLAY"
  [ "$BEFORE_REPLAY" = "$AFTER_REPLAY" ] && ok "replay did not credit a second time" \
    || bad "replay credited the wallet again"
fi
echo

echo "=== RESULT: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ]
