#!/usr/bin/env bash
# Builds the helper + rebuilds the Firefox add-on .xpi, then installs the
# helper as a per-user launchd agent (starts at login, restarts on crash).
# Extra flags are passed to the helper, e.g. ./install.sh -iface en10
set -euo pipefail

LABEL="local.hdb-proxy"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
BIN_DIR="$HOME/Library/Application Support/hdb-proxy"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/hdb-proxy.log"
XPI="$ROOT/hdb-proxy.xpi"

mkdir -p "$BIN_DIR" "$(dirname "$PLIST")"

# Rebuild the .xpi from extension/ source every time, so editing the add-on
# and re-running this script is enough — no separate manual zip step.
# If AMO_JWT_ISSUER/AMO_JWT_SECRET are set (from addons.mozilla.org/developers/addon/api/key/),
# sign it via the AMO API so it installs permanently without Developer/Nightly
# signature-check flags. Credentials are read from env only — never written
# to a file in this repo.
rm -f "$XPI"
if [[ -n "${AMO_JWT_ISSUER:-}" && -n "${AMO_JWT_SECRET:-}" ]]; then
  ARTIFACTS="$(mktemp -d)"
  npx --yes web-ext sign \
    --source-dir "$ROOT/extension" \
    --artifacts-dir "$ARTIFACTS" \
    --api-key "$AMO_JWT_ISSUER" \
    --api-secret "$AMO_JWT_SECRET" \
    --channel unlisted
  SIGNED="$(find "$ARTIFACTS" -maxdepth 1 -iname '*.xpi' | head -1)"
  if [[ -z "$SIGNED" ]]; then
    echo "error: web-ext sign didn't produce an .xpi (see output above)" >&2
    rm -rf "$ARTIFACTS"
    exit 1
  fi
  mv "$SIGNED" "$XPI"
  rm -rf "$ARTIFACTS"
  echo "Signed $(basename "$XPI") (channel: unlisted)"
else
  (cd "$ROOT/extension" && zip -r -X -q "$XPI" . -x ".*")
  echo "Rebuilt $(basename "$XPI") (unsigned — set AMO_JWT_ISSUER/AMO_JWT_SECRET to auto-sign)"
fi

(cd "$HERE" && go build -o "$BIN_DIR/hdb-proxy" .)

args="<string>$BIN_DIR/hdb-proxy</string>"
for a in "$@"; do args+="<string>$a</string>"; done

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array>$args</array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
sleep 1
echo "Installed $LABEL — log: $LOG"
curl -s http://127.0.0.1:1081/status && echo
