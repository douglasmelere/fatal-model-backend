#!/bin/bash

# Script para testar o endpoint de recomendações por IA
# Uso: ./test-ai-recommendations.sh <token_jwt>

BASE_URL="${API_URL:-http://localhost:3000/api}"
TOKEN="${1}"

if [ -z "$TOKEN" ]; then
  echo "❌ Erro: Token JWT não fornecido"
  echo "Uso: ./test-ai-recommendations.sh <seu_jwt_token>"
  echo ""
  echo "Exemplo:"
  echo "  ./test-ai-recommendations.sh eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  exit 1
fi

echo "🧪 Testando endpoint de recomendações por IA..."
echo "📍 URL: ${BASE_URL}/ai/recommend"
echo ""

# Teste 1: Descrição simples
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Teste 1: Descrição simples"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "${BASE_URL}/ai/recommend" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "description": "Procuro alguém para massagem relaxante"
  }' \
  -w "\n\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
echo ""

# Teste 2: Com localização e orçamento
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Teste 2: Com localização e orçamento"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "${BASE_URL}/ai/recommend" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "description": "Procuro uma acompanhante para encontro casual",
    "location": "São Paulo",
    "budget_range": {
      "min": 200,
      "max": 500
    }
  }' \
  -w "\n\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
echo ""

# Teste 3: Com filtros avançados
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Teste 3: Com filtros avançados"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X POST "${BASE_URL}/ai/recommend" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "description": "Quero alguém para jantar e conversar",
    "location": "Rio de Janeiro",
    "budget_range": {
      "min": 300,
      "max": 800
    },
    "filters": {
      "age_range": {
        "min": 20,
        "max": 30
      },
      "body_type": "curvy",
      "min_rating": 4,
      "services": ["jantar", "conversa"]
    }
  }' \
  -w "\n\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
echo ""

# Teste 4: Histórico de recomendações
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Teste 4: Histórico de recomendações"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

curl -X GET "${BASE_URL}/ai/recommendations/history?limit=10&offset=0" \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\n\nStatus: %{http_code}\n" \
  -s | jq '.'

echo ""
echo ""
echo "✅ Testes concluídos!"

