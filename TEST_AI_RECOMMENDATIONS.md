# Teste de Recomendações por IA

Este documento descreve como testar o endpoint de recomendações por IA ("Me Surpreenda").

## 📋 Endpoint

```
POST /api/ai/recommend
Authorization: Bearer <token>
Content-Type: application/json
```

## 🧪 Como Testar

### Opção 1: Script Automatizado

```bash
# Forneça seu token JWT
./test-ai-recommendations.sh eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Ou defina a variável de ambiente API_URL se diferente
API_URL=http://localhost:3333/api ./test-ai-recommendations.sh <token>
```

### Opção 2: cURL Manual

#### Teste Básico - Apenas Descrição

```bash
curl -X POST http://localhost:3000/api/ai/recommend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "description": "Procuro alguém para massagem relaxante"
  }'
```

#### Teste Completo - Com Filtros

```bash
curl -X POST http://localhost:3000/api/ai/recommend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "description": "Procuro uma acompanhante para encontro casual",
    "location": "São Paulo",
    "budget_range": {
      "min": 200,
      "max": 500
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
  }'
```

### Opção 3: Usando Swagger UI

1. Acesse `http://localhost:3000/api/docs`
2. Faça login/autenticação (botão "Authorize" no topo)
3. Vá para a seção "AI Recommendations"
4. Clique em `POST /ai/recommend`
5. Clique em "Try it out"
6. Preencha o body JSON
7. Clique em "Execute"

### Opção 4: Postman/Insomnia

**Request:**
- Method: `POST`
- URL: `http://localhost:3000/api/ai/recommend`
- Headers:
  - `Authorization: Bearer <seu_token>`
  - `Content-Type: application/json`
- Body (JSON):

```json
{
  "description": "Procuro alguém para massagem relaxante",
  "location": "São Paulo",
  "budget_range": {
    "min": 200,
    "max": 500
  },
  "filters": {
    "age_range": {
      "min": 20,
      "max": 30
    },
    "body_type": "curvy",
    "min_rating": 4,
    "services": ["massagem", "relaxante"]
  }
}
```

## 📤 Exemplos de Requisições

### Exemplo 1: Busca Simples
```json
{
  "description": "massagem relaxante"
}
```

### Exemplo 2: Com Localização
```json
{
  "description": "encontro casual",
  "location": "Rio de Janeiro"
}
```

### Exemplo 3: Com Orçamento
```json
{
  "description": "jantar romântico",
  "location": "São Paulo",
  "budget_range": {
    "min": 300,
    "max": 800
  }
}
```

### Exemplo 4: Completo com Filtros
```json
{
  "description": "quero alguém para conversar e jantar",
  "location": "Brasília",
  "budget_range": {
    "min": 250,
    "max": 600
  },
  "filters": {
    "age_range": {
      "min": 25,
      "max": 35
    },
    "body_type": "athletic",
    "hair_color": "loira",
    "min_rating": 4.5,
    "services": ["jantar", "conversa", "companhia"]
  }
}
```

## 📥 Resposta Esperada

### Sucesso (200 OK)

```json
{
  "recommendations": [
    {
      "id": "uuid",
      "display_name": "Maria Silva",
      "bio": "Acompanhante profissional...",
      "age": 28,
      "location": "São Paulo",
      "average_rating": 4.8,
      "total_reviews": 45,
      "pricing": {
        "hourly_rate": 350
      },
      "services_offered": ["massagem", "relaxante", "companhia"],
      ...
    }
  ],
  "explanation": "Based on your preferences, we found profiles matching your interests in massagem, relaxante. We filtered results for the São Paulo area. All results are within your budget of R$ 200 to R$ 500. We found 5 profiles that match your criteria.",
  "matched_keywords": ["massagem", "relaxante"],
  "confidence_score": 85
}
```

### Erros Possíveis

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": ["description must be a string"]
}
```

## 🔍 O que o Sistema Faz

1. **Extrai palavras-chave** da descrição (remove stop words)
2. **Busca perfis** que correspondem às palavras-chave em:
   - Nome de exibição
   - Bio
   - Serviços oferecidos
3. **Aplica filtros** adicionais:
   - Localização
   - Faixa de preço
   - Idade
   - Tipo de corpo
   - Cor do cabelo
   - Rating mínimo
   - Serviços específicos
4. **Ordena resultados** por:
   - Rating médio (decrescente)
   - Total de visualizações (decrescente)
5. **Retorna top 10** perfis
6. **Calcula confidence score** baseado em:
   - Número de resultados encontrados
   - Quantidade de palavras-chave correspondidas

## 🎯 Palavras-chave Testadas

O sistema remove **stop words** (palavras comuns) e extrai palavras-chave significativas:

**Stop words removidas:**
- Português: que, o, a, e, de, para, com, por, em, do, da, um, uma, os, as
- Inglês: a, an, and, are, as, at, be, by, for, from, has, he, in, is, it, its, of, on, or, that, the, to, was, will, with

**Exemplo:**
- Input: "Procuro alguém para massagem relaxante e conversa"
- Keywords extraídas: ["procuro", "alguém", "massagem", "relaxante", "conversa"]

## ✅ Checklist de Teste

- [ ] Endpoint responde com status 200
- [ ] Token JWT é aceito
- [ ] Descrição simples retorna resultados
- [ ] Localização filtra corretamente
- [ ] Budget range filtra corretamente
- [ ] Filtros de idade funcionam
- [ ] Filtros de body_type funcionam
- [ ] Filtros de rating funcionam
- [ ] Filtros de serviços funcionam
- [ ] Keywords são extraídas corretamente
- [ ] Confidence score é calculado
- [ ] Explanation é gerada
- [ ] Resultados são ordenados por rating e views

## 🐛 Troubleshooting

### Problema: Retorna array vazio
**Solução:** Verifique se há perfis cadastrados, verificados e ativos no banco de dados.

### Problema: Keywords não encontram nada
**Solução:** Verifique se os perfis têm essas palavras em `display_name`, `bio` ou `services_offered`.

### Problema: Filtros não funcionam
**Solução:** Verifique a estrutura JSON dos filtros e se os dados dos perfis estão no formato esperado.

### Problema: Token inválido
**Solução:** Obtenha um novo token fazendo login em `/api/auth/login`.

## 📝 Histórico de Recomendações

Para verificar o histórico:

```bash
curl -X GET http://localhost:3000/api/ai/recommendations/history?limit=10&offset=0 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Nota:** Atualmente retorna array vazio pois não há persistência implementada ainda.

## 💡 Dicas para Testes Eficazes

1. **Use descrições variadas** para testar a extração de keywords
2. **Teste com e sem filtros** para ver a diferença
3. **Teste limites** (budget muito baixo/alto, idade muito restrita)
4. **Verifique se os perfis retornados realmente correspondem** às palavras-chave
5. **Compare com busca normal** (`/api/search/escorts`) para validar

