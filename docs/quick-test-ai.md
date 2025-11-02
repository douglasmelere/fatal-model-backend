# Teste Rápido - Recomendações por IA

## Como Testar

### 1. Obter Token JWT
Primeiro, faça login para obter o token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu_email@example.com",
    "password": "sua_senha"
  }'
```

Copie o `accessToken` da resposta.

### 2. Testar Recomendações
Substitua `SEU_TOKEN_AQUI` pelo token obtido:

```bash
curl -X POST http://localhost:3000/api/ai/recommend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "description": "Procuro alguém para massagem relaxante",
    "location": "São Paulo",
    "budget_range": {
      "min": 200,
      "max": 500
    }
  }'
```

## O que Verificar

✅ Status 200 OK  
✅ Array `recommendations` não vazio (se houver perfis cadastrados)  
✅ Campo `matched_keywords` com palavras extraídas  
✅ Campo `confidence_score` entre 0-100  
✅ Campo `explanation` com texto descritivo  

## Teste Completo com Filtros

```bash
curl -X POST http://localhost:3000/api/ai/recommend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "description": "quero alguém para jantar e conversar",
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
      "min_rating": 4
    }
  }'
```
