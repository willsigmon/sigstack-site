#!/bin/bash
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDc4ZmE1Ni1hZGRhLTQwMzktYTgwMy03NzA1MjVlZTExMzkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0NzE1MTU3fQ.rU3NGHrsGYRLMY00OZXPwyrOSsnkiwG45ZlcT3jR1EM"
BASE_URL="https://n8n.wsig.me/api/v1/workflows"
DIR="/Users/wsig/.dotfiles-hub/n8n-workflows"

deploy() {
    name=$1
    file=$2
    result=$(curl -s -X POST "$BASE_URL" \
        -H "X-N8N-API-KEY: $API_KEY" \
        -H "Content-Type: application/json" \
        -d @"$file")
    id=$(echo "$result" | jq -r '.id // empty')
    if [ -n "$id" ]; then
        # Activate the workflow
        curl -s -X PATCH "$BASE_URL/$id" \
            -H "X-N8N-API-KEY: $API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"active": true}' > /dev/null
        echo "✅ $name: $id (activated)"
    else
        echo "❌ $name: $(echo "$result" | jq -r '.message // "Unknown error"')"
    fi
}

echo "Deploying workflows to n8n..."
deploy "Supabase Triggers" "$DIR/supabase-triggers.json"
deploy "SSH Orchestrator" "$DIR/ssh-orchestrator.json"
deploy "AI Content Pipeline" "$DIR/ai-content-pipeline.json"
deploy "Daily Backup" "$DIR/daily-backup.json"
deploy "Build Monitor" "$DIR/build-monitor.json"
echo "Done!"
