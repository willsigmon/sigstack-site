#!/bin/bash
set -euo pipefail

export HUB_PORT="${HUB_PORT:-3030}"
export HUB_DATA_DIR="${HUB_DATA_DIR:-$HOME/brain/hub/logs}"

node "$(dirname "$0")/server.mjs"

