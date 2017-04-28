#!/usr/bin/env bash
# the unofficial bash strict mode
set -euo pipefail
IFS=$'\n\t'

cd safe_launcher && npm run dev
