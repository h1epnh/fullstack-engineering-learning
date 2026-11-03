#!/usr/bin/env bash
# Builds the helper and installs it as a per-user launchd agent (starts at login, restarts on crash).
# Extra flags are passed to the helper, e.g. ./install.sh -iface en10
set -euo pipefail

LABEL="local.hdb-proxy"
HERE="$(cd "$(dirname "$0")" && pwd)"
BIN_DIR="$HOME/Library/Application Support/hdb-proxy"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/hdb-proxy.log"

mkdir -p "$BIN_DIR" "$(dirname "$PLIST")"
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
