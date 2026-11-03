#!/usr/bin/env bash
#
# init-aws-infra.sh — ADR-06 (DESIGN.md, "ADR-06. SNS + SQS thật trên AWS...") infrastructure
# bootstrap for the ewallet-lab payment-completed notification fan-out.
#
# WHO RUNS THIS: the operator, on their own machine, using their own AWS CLI admin profile
# (DESIGN.md: account 456021728709, profile `default` = IAM user `admin`). No agent runs this
# script or ever holds the admin credentials it uses — this is the exact point of ADR-06's
# 2nd open question's resolution ("Give me exact AWS CLI commands to run").
#
# WHAT IT CREATES (region ap-southeast-1):
#   1. SNS topic              ewallet-lab-payment-completed
#   2. SQS DLQ                ewallet-lab-payment-completed-notify-dlq
#   3. SQS main queue         ewallet-lab-payment-completed-notify (redrive -> DLQ, maxReceiveCount=5)
#   4. Queue access policy allowing the SNS topic above to SendMessage to the main queue, then an
#      SNS subscription (protocol sqs, RawMessageDelivery=true) wiring topic -> main queue.
#   5. A least-privilege IAM policy (`ewallet-lab-notify-policy`): sns:Publish on EXACTLY the topic
#      ARN above; sqs:ReceiveMessage/DeleteMessage/GetQueueAttributes on EXACTLY the main queue +
#      DLQ ARNs (no wildcards) — attached to a NEW IAM user (`ewallet-lab-notify-svc`), with a
#      fresh access key created for it. This user/key is what wallet-service (publisher) and
#      notification-service (consumer) both use — NEVER the admin profile's own key.
#
# IDEMPOTENCY: safe to re-run. SNS create-topic / SQS create-queue (called with no special
# attributes, then set-queue-attributes separately) / IAM attach-user-policy are all naturally
# idempotent. IAM create-policy/create-user are skipped (not re-created) if the policy/user already
# exists. IAM create-access-key is explicitly NOT re-run if the user already has an access key
# (AWS caps a user at 2 keys, and a 2nd run creating a 2nd key silently would be confusing) — see
# the access-key step below for what to do if you need to rotate.
#
# WHAT IT DELIBERATELY DOES NOT DO: create/modify the k8s Secret `ewallet-lab-aws-notify`. This
# script only prints the exact `kubectl create secret` command at the end — running it is a
# separate, deliberate step so the access key never ends up in this script's own stdout log file
# by accident becoming "the" record of it (the operator copies it once, right then).
#
# USAGE:
#   AWS_PROFILE=default ./init-aws-infra.sh
#   ./init-aws-infra.sh -y          # skip the confirmation prompt
#
set -euo pipefail

REGION="ap-southeast-1"
TOPIC_NAME="ewallet-lab-payment-completed"
DLQ_NAME="ewallet-lab-payment-completed-notify-dlq"
QUEUE_NAME="ewallet-lab-payment-completed-notify"
MAX_RECEIVE_COUNT=5
IAM_POLICY_NAME="ewallet-lab-notify-policy"
IAM_USER_NAME="ewallet-lab-notify-svc"

SKIP_CONFIRM=0
if [[ "${1:-}" == "-y" || "${1:-}" == "--yes" ]]; then
  SKIP_CONFIRM=1
fi

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "ERROR: required command '$1' not found on PATH." >&2; exit 1; }
}
need_cmd aws
need_cmd python3

aws_cli() {
  aws --region "$REGION" "$@"
}

# Safely JSON-encode a string for embedding as a JSON string VALUE (e.g. an SQS attribute whose
# own value must itself be a JSON-encoded string per the SQS/SNS API's string-only attribute
# model). Using python3's json.dumps rather than hand-rolled sed/quoting — the latter is exactly
# the kind of thing that silently mis-escapes once a value contains a character you didn't test.
json_string() {
  python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$1"
}

echo "=== ewallet-lab ADR-06 AWS infra bootstrap ==="
echo "Region: $REGION"
IDENTITY_JSON=$(aws sts get-caller-identity --output json)
ACCOUNT_ID=$(echo "$IDENTITY_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["Account"])')
CALLER_ARN=$(echo "$IDENTITY_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["Arn"])')
echo "Caller identity: $CALLER_ARN (account $ACCOUNT_ID)"
echo "This will create/update: SNS topic '$TOPIC_NAME', SQS queues '$QUEUE_NAME' + '$DLQ_NAME',"
echo "IAM policy '$IAM_POLICY_NAME', IAM user '$IAM_USER_NAME', and (if the user has no key yet) a"
echo "new access key for that user."

if [[ "$SKIP_CONFIRM" -ne 1 ]]; then
  read -r -p "Proceed? [y/N] " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted — nothing created."
    exit 1
  fi
fi

# --- 1. SNS topic -----------------------------------------------------------------------------
echo
echo "--- 1/5: SNS topic ---"
TOPIC_ARN=$(aws_cli sns create-topic --name "$TOPIC_NAME" --output text --query 'TopicArn')
echo "Topic ARN: $TOPIC_ARN"

# --- 2. SQS DLQ + main queue (bare create, idempotent; attributes set separately below) -------
echo
echo "--- 2/5: SQS DLQ + main queue ---"

get_or_create_queue_url() {
  local name="$1"
  local url
  url=$(aws_cli sqs get-queue-url --queue-name "$name" --output text --query 'QueueUrl' 2>/dev/null) || true
  if [[ -z "$url" ]]; then
    url=$(aws_cli sqs create-queue --queue-name "$name" --output text --query 'QueueUrl')
  fi
  echo "$url"
}

get_queue_arn() {
  local url="$1"
  aws_cli sqs get-queue-attributes --queue-url "$url" --attribute-names QueueArn \
    --output text --query 'Attributes.QueueArn'
}

DLQ_URL=$(get_or_create_queue_url "$DLQ_NAME")
DLQ_ARN=$(get_queue_arn "$DLQ_URL")
echo "DLQ URL: $DLQ_URL"
echo "DLQ ARN: $DLQ_ARN"

QUEUE_URL=$(get_or_create_queue_url "$QUEUE_NAME")
QUEUE_ARN=$(get_queue_arn "$QUEUE_URL")
echo "Main queue URL: $QUEUE_URL"
echo "Main queue ARN: $QUEUE_ARN"

# --- 3. Main queue attributes: redrive policy (-> DLQ, maxReceiveCount=5) + access policy ------
echo
echo "--- 3/5: redrive policy + SNS-can-SendMessage access policy on the main queue ---"

REDRIVE_POLICY_RAW=$(printf '{"deadLetterTargetArn":"%s","maxReceiveCount":"%s"}' "$DLQ_ARN" "$MAX_RECEIVE_COUNT")
REDRIVE_POLICY_ENCODED=$(json_string "$REDRIVE_POLICY_RAW")

ACCESS_POLICY_RAW=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Id": "ewallet-lab-payment-completed-notify-access-policy",
  "Statement": [
    {
      "Sid": "AllowSNSPublishFromPaymentCompletedTopic",
      "Effect": "Allow",
      "Principal": { "Service": "sns.amazonaws.com" },
      "Action": "sqs:SendMessage",
      "Resource": "$QUEUE_ARN",
      "Condition": { "ArnEquals": { "aws:SourceArn": "$TOPIC_ARN" } }
    }
  ]
}
EOF
)
ACCESS_POLICY_ENCODED=$(json_string "$ACCESS_POLICY_RAW")

ATTRS_FILE=$(mktemp)
trap 'rm -f "$ATTRS_FILE"' EXIT
printf '{"RedrivePolicy": %s, "Policy": %s}' "$REDRIVE_POLICY_ENCODED" "$ACCESS_POLICY_ENCODED" > "$ATTRS_FILE"
aws_cli sqs set-queue-attributes --queue-url "$QUEUE_URL" --attributes "file://$ATTRS_FILE"
echo "Set RedrivePolicy (-> DLQ, maxReceiveCount=$MAX_RECEIVE_COUNT) and access Policy on the main queue."

# --- 4. Subscribe the main queue to the topic (raw delivery — body IS the event JSON) ----------
echo
echo "--- 4/5: SNS subscription (topic -> main queue, RawMessageDelivery=true) ---"

EXISTING_SUB_ARN=$(aws_cli sns list-subscriptions-by-topic --topic-arn "$TOPIC_ARN" \
  --query "Subscriptions[?Endpoint=='$QUEUE_ARN'].SubscriptionArn" --output text)
if [[ -n "$EXISTING_SUB_ARN" && "$EXISTING_SUB_ARN" != "None" ]]; then
  echo "Subscription already exists: $EXISTING_SUB_ARN (leaving as-is; re-run with that subscription"
  echo "deleted first if you need to recreate it)."
else
  SUB_ARN=$(aws_cli sns subscribe --topic-arn "$TOPIC_ARN" --protocol sqs --notification-endpoint "$QUEUE_ARN" \
    --attributes RawMessageDelivery=true --output text --query 'SubscriptionArn')
  echo "Subscribed: $SUB_ARN"
fi

# --- 5. Least-privilege IAM policy + user + access key -----------------------------------------
echo
echo "--- 5/5: IAM policy + user + access key (scoped to exactly the 3 ARNs above) ---"

IAM_POLICY_DOC=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SnsPublishPaymentCompletedTopicOnly",
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "$TOPIC_ARN"
    },
    {
      "Sid": "SqsConsumePaymentCompletedNotifyQueuesOnly",
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": [
        "$QUEUE_ARN",
        "$DLQ_ARN"
      ]
    }
  ]
}
EOF
)

IAM_POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${IAM_POLICY_NAME}"
if aws iam get-policy --policy-arn "$IAM_POLICY_ARN" >/dev/null 2>&1; then
  echo "IAM policy already exists: $IAM_POLICY_ARN (not touching it — this script never edits an"
  echo "existing policy in place; delete it first via 'aws iam delete-policy' if you need to change"
  echo "its document, after detaching it from $IAM_USER_NAME)."
else
  POLICY_DOC_FILE=$(mktemp)
  trap 'rm -f "$ATTRS_FILE" "$POLICY_DOC_FILE"' EXIT
  printf '%s' "$IAM_POLICY_DOC" > "$POLICY_DOC_FILE"
  aws iam create-policy --policy-name "$IAM_POLICY_NAME" --policy-document "file://$POLICY_DOC_FILE" >/dev/null
  echo "Created IAM policy: $IAM_POLICY_ARN"
fi

if aws iam get-user --user-name "$IAM_USER_NAME" >/dev/null 2>&1; then
  echo "IAM user already exists: $IAM_USER_NAME"
else
  aws iam create-user --user-name "$IAM_USER_NAME" >/dev/null
  echo "Created IAM user: $IAM_USER_NAME"
fi

aws iam attach-user-policy --user-name "$IAM_USER_NAME" --policy-arn "$IAM_POLICY_ARN"
echo "Attached $IAM_POLICY_NAME to $IAM_USER_NAME (no-op if already attached)."

EXISTING_KEYS=$(aws iam list-access-keys --user-name "$IAM_USER_NAME" --query 'AccessKeyMetadata[].AccessKeyId' --output text)
if [[ -n "$EXISTING_KEYS" && "$EXISTING_KEYS" != "None" ]]; then
  echo
  echo "User '$IAM_USER_NAME' already has an access key ($EXISTING_KEYS) — NOT creating a new one"
  echo "(AWS caps a user at 2 keys; a silent 2nd/3rd key here would be confusing, not helpful)."
  echo "The SecretAccessKey for an existing key can never be retrieved again. To rotate: delete the"
  echo "old key with 'aws iam delete-access-key --user-name $IAM_USER_NAME --access-key-id <id>',"
  echo "then re-run this script to get a fresh one."
  echo
  echo "=== Done (no new credentials printed — see note above) ==="
  exit 0
fi

CREATE_KEY_JSON=$(aws iam create-access-key --user-name "$IAM_USER_NAME" --output json)
NEW_ACCESS_KEY_ID=$(echo "$CREATE_KEY_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["AccessKey"]["AccessKeyId"])')
NEW_SECRET_ACCESS_KEY=$(echo "$CREATE_KEY_JSON" | python3 -c 'import json,sys; print(json.load(sys.stdin)["AccessKey"]["SecretAccessKey"])')

cat <<EOF

=== Done — NEW credentials for IAM user '$IAM_USER_NAME' ===

AccessKeyId:     $NEW_ACCESS_KEY_ID
SecretAccessKey: $NEW_SECRET_ACCESS_KEY

!!! DO NOT commit these values to git, paste them into a GitHub issue/comment, or leave this
!!! terminal's scrollback somewhere persistent. This is the ONLY time SecretAccessKey is ever
!!! shown — AWS does not let you retrieve it again later (only delete + create a new one).

Next step — create the k8s Secret these 2 Deployments (wallet-service, notification-service) read
via envFrom.secretRef (see deploy/helm/ewallet-lab/templates/wallet-service.yaml and
notification-service.yaml). Run this yourself; it is NOT run by this script:

kubectl -n ewallet-lab create secret generic ewallet-lab-aws-notify \\
  --from-literal=AWS_ACCESS_KEY_ID="$NEW_ACCESS_KEY_ID" \\
  --from-literal=AWS_SECRET_ACCESS_KEY="$NEW_SECRET_ACCESS_KEY" \\
  --from-literal=AWS_DEFAULT_REGION="$REGION"

After creating/rotating that Secret: restart both Deployments so they pick it up —
  kubectl -n ewallet-lab delete pod -l app=wallet-service
  kubectl -n ewallet-lab delete pod -l app=notification-service   # only if already scaled to 1

Resource ARNs/URLs for reference (also hardcoded into deploy/helm/ewallet-lab/values.yaml's
'aws' section — update that file if you ever re-run this against a different AWS account):
  SNS topic ARN:      $TOPIC_ARN
  SQS main queue URL: $QUEUE_URL
  SQS main queue ARN: $QUEUE_ARN
  SQS DLQ ARN:        $DLQ_ARN
EOF
