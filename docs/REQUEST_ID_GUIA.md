# 🔍 Guia: Como Ver o Request ID Funcionando

Este guia mostra várias formas de visualizar e testar o Request ID implementado na aplicação.

---

## 📋 Índice

1. [Ver Request ID no Header de Resposta](#1-ver-request-id-no-header-de-resposta)
2. [Testar com cURL](#2-testar-com-curl)
3. [Testar com Navegador (DevTools)](#3-testar-com-navegador-devtools)
4. [Testar com Postman/Insomnia](#4-testar-com-postmaninsomnia)
5. [Ver Request ID nos Logs](#5-ver-request-id-nos-logs)
6. [Endpoint de Demonstração](#6-endpoint-de-demonstração)
7. [Enviar Request ID do Cliente](#7-enviar-request-id-do-cliente)

---

## 1. Ver Request ID no Header de Resposta

O Request ID é automaticamente adicionado ao header `X-Request-ID` em todas as respostas HTTP.

### Exemplo de Resposta:

```
HTTP/1.1 200 OK
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "message": "Hello World"
}
```

---

## 2. Testar com cURL

### Teste Básico:

```bash
# Fazer uma requisição e ver o header X-Request-ID
curl -i http://localhost:3333/api

# Ou apenas o header:
curl -I http://localhost:3333/api | grep -i x-request-id
```

### Teste com Request ID Customizado:

```bash
# Enviar um Request ID customizado (será reutilizado)
curl -i -H "X-Request-ID: meu-request-id-123" http://localhost:3333/api
```

### Ver Todos os Headers:

```bash
curl -v http://localhost:3333/api
```

**Exemplo de Saída:**

```
< HTTP/1.1 200 OK
< X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
< Content-Type: application/json
```

---

## 3. Testar com Navegador (DevTools)

### Passo a Passo:

1. Abra o navegador (Chrome, Firefox, Edge)
2. Pressione `F12` para abrir as DevTools
3. Vá para a aba **Network** (Rede)
4. Faça uma requisição para a API (ex: `http://localhost:3333/api`)
5. Clique na requisição na lista
6. Vá para a aba **Headers**
7. Procure por `X-Request-ID` na seção **Response Headers**

### Exemplo Visual:

```
Response Headers:
  X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
  Content-Type: application/json
  ...
```

---

## 4. Testar com Postman/Insomnia

### Postman:

1. Crie uma nova requisição GET para `http://localhost:3333/api`
2. Clique em **Send**
3. Na aba **Headers** da resposta, procure por `X-Request-ID`

### Insomnia:

1. Crie uma nova requisição GET para `http://localhost:3333/api`
2. Clique em **Send**
3. Na aba **Response** → **Headers**, procure por `X-Request-ID`

### Enviar Request ID Customizado:

Adicione um header na requisição:

- **Nome**: `X-Request-ID`
- **Valor**: `meu-request-id-customizado`

O servidor reutilizará esse ID em vez de gerar um novo.

---

## 5. Ver Request ID nos Logs

O Request ID é automaticamente incluído em todos os logs de erro.

### Exemplo de Log de Erro:

```json
{
  "level": "warn",
  "message": "HTTP Exception",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "statusCode": 400,
  "path": "/api/users",
  "method": "POST",
  "message": "Validation failed"
}
```

### Como Ver os Logs:

#### Console (Desenvolvimento):

Os logs aparecem diretamente no console quando você roda a aplicação.

#### Arquivos de Log (Produção):

```bash
# Ver logs recentes
tail -f logs/app-$(date +%Y-%m-%d).log | grep requestId

# Buscar por um Request ID específico
grep "550e8400-e29b-41d4-a716-446655440000" logs/*.log
```

---

## 6. Endpoint de Demonstração

Foi criado um endpoint especial para demonstrar o Request ID:

### Endpoint:

```
GET /api/request-id-demo
```

### Resposta:

```json
{
  "message": "Request ID Demo",
  "requestIdFromDecorator": "550e8400-e29b-41d4-a716-446655440000",
  "requestIdFromRequest": "550e8400-e29b-41d4-a716-446655440000",
  "areTheyEqual": true,
  "note": "Verifique o header X-Request-ID na resposta HTTP"
}
```

### Testar:

```bash
curl -i http://localhost:3333/api/request-id-demo
```

---

## 7. Enviar Request ID do Cliente

Você pode enviar um Request ID customizado do cliente para manter a cadeia de rastreamento em sistemas distribuídos.

### Exemplo com cURL:

```bash
curl -i \
  -H "X-Request-ID: meu-request-id-123" \
  http://localhost:3333/api
```

### Exemplo com JavaScript (Fetch):

```javascript
fetch('http://localhost:3333/api', {
  headers: {
    'X-Request-ID': 'meu-request-id-123',
  },
}).then((res) => {
  console.log('Request ID:', res.headers.get('X-Request-ID'));
  return res.json();
});
```

### Exemplo com Axios:

```javascript
const response = await axios.get('http://localhost:3333/api', {
  headers: {
    'X-Request-ID': 'meu-request-id-123',
  },
});

console.log('Request ID:', response.headers['x-request-id']);
```

---

## 🧪 Testes Rápidos

### Teste 1: Verificar se o Request ID é gerado

```bash
curl -I http://localhost:3333/api | grep -i x-request-id
```

**Resultado esperado**: Deve mostrar um UUID no formato `X-Request-ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Teste 2: Verificar se Request ID customizado é reutilizado

```bash
curl -I -H "X-Request-ID: teste-123" http://localhost:3333/api | grep -i x-request-id
```

**Resultado esperado**: Deve mostrar `X-Request-ID: teste-123`

### Teste 3: Verificar Request ID em erro

```bash
# Fazer uma requisição que cause erro (ex: endpoint inexistente)
curl -i http://localhost:3333/api/endpoint-inexistente
```

**Resultado esperado**:

- Header `X-Request-ID` na resposta
- Request ID nos logs de erro

---

## 📊 Exemplo Completo

### 1. Fazer uma requisição:

```bash
curl -v http://localhost:3333/api/request-id-demo
```

### 2. Saída esperada:

```
* Connected to localhost (127.0.0.1) port 3333
> GET /api/request-id-demo HTTP/1.1
> Host: localhost:3333
> User-Agent: curl/7.68.0
> Accept: */*
>
< HTTP/1.1 200 OK
< X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
< Content-Type: application/json
< Content-Length: 156
<
{
  "message": "Request ID Demo",
  "requestIdFromDecorator": "550e8400-e29b-41d4-a716-446655440000",
  "requestIdFromRequest": "550e8400-e29b-41d4-a716-446655440000",
  "areTheyEqual": true,
  "note": "Verifique o header X-Request-ID na resposta HTTP"
}
```

---

## 🔍 Dicas de Debug

### Ver Request ID em Logs de Erro:

1. Cause um erro propositalmente (ex: validação falhada)
2. Verifique os logs no console ou arquivo de log
3. Procure pelo campo `requestId` no log

### Rastrear uma Requisição Específica:

1. Anote o Request ID do header de resposta
2. Busque nos logs:
   ```bash
   grep "550e8400-e29b-41d4-a716-446655440000" logs/*.log
   ```

### Verificar se o Interceptor está Funcionando:

1. Verifique se o interceptor está registrado no `AppModule`
2. Faça uma requisição e verifique se o header `X-Request-ID` está presente
3. Se não estiver, verifique os logs de inicialização da aplicação

---

## ✅ Checklist de Verificação

- [ ] Request ID aparece no header `X-Request-ID` de todas as respostas
- [ ] Request ID é um UUID válido quando não fornecido pelo cliente
- [ ] Request ID customizado do cliente é reutilizado
- [ ] Request ID aparece nos logs de erro
- [ ] Endpoint `/api/request-id-demo` retorna o Request ID no body
- [ ] Request ID é o mesmo em toda a cadeia de requisição

---

## 🎯 Próximos Passos

Agora que você sabe como ver o Request ID:

1. **Integre com seu sistema de monitoramento** (ex: Grafana, Datadog)
2. **Use para rastrear requisições** em sistemas distribuídos
3. **Adicione Request ID aos logs customizados** nos seus services
4. **Configure alertas** baseados em Request ID para debugging

---

## 📚 Referências

- [RFC 7231 - HTTP/1.1 Semantics and Content](https://tools.ietf.org/html/rfc7231)
- [MDN - HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [NestJS - Interceptors](https://docs.nestjs.com/interceptors)
