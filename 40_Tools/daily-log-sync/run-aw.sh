#!/bin/bash
export PATH="/Users/apple/.nvm/versions/node/v24.14.1/bin:$PATH"
cd /Users/apple/Desktop/obsidian/AI-france/40_Tools/daily-log-sync
npm run aw >> /tmp/aw-sync.log 2>&1
