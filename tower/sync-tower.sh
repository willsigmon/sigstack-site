#!/bin/bash
# Tower Central Sync
# Syncs claude data between Tower and local machines

TOWER="root@tower.local"
REMOTE="/mnt/user/data/claude/"
LOCAL="$HOME/.claude/tower-sync/"

# Check Tower reachability
if ! ping -c1 -W2 tower.local &>/dev/null; then
    echo "Tower not reachable, skipping sync"
    exit 0
fi

case "${1:-both}" in
  push)
    rsync -avz --delete "$LOCAL" "$TOWER:$REMOTE"
    ;;
  pull)
    rsync -avz --delete "$TOWER:$REMOTE" "$LOCAL"
    ;;
  both)
    rsync -avz "$TOWER:$REMOTE" "$LOCAL"
    rsync -avz "$LOCAL" "$TOWER:$REMOTE"
    ;;
esac

echo "Tower sync completed at $(date)"
