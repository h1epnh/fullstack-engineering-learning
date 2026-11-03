#!/usr/bin/env bash
set -euo pipefail

LABEL="local.hdb-proxy"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
rm -f "$HOME/Library/LaunchAgents/$LABEL.plist"
rm -rf "$HOME/Library/Application Support/hdb-proxy"
echo "Removed $LABEL"
