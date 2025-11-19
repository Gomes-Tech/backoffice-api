# 🚀 Guia de Deploy na Render (Plano Free)

Este guia explica como fazer deploy da aplicação na Render usando o plano free, incluindo as opções para configurar Redis.

---

## 📋 Pré-requisitos

- Conta na Render (https://render.com)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Banco de dados PostgreSQL (pode usar o PostgreSQL gerenciado da Render)

---

## 🎯 Opções para Redis no Plano Free

O plano free da Render **não oferece** serviços Redis gerenciados. Você tem 3 opções:

### ✅ **OPÇÃO 1: Usar Cache em Memória (Recomendado para começar)**

A aplicação foi configurada para fazer **fallback automático** para cache em memória quando Redis não estiver disponível.

**Vantagens:**
- ✅ Funciona imediatamente, sem configuração adicional
- ✅ Sem custos
- ✅ Ideal para desenvolvimento e testes

**Desvantagens:**
- ⚠️ Cache não é compartilhado entre múltiplas instâncias
- ⚠️ Cache é perdido ao reiniciar o serviço
- ⚠️ Limitado pela memória disponível

**Configuração:**
1. No painel da Render, vá em **Environment Variables**
2. Adicione a variável:
   ```
   USE_REDIS=false
   ```

---

### ✅ **OPÇÃO 2: Redis Externo Gratuito (Recomendado para produção)**

Use um serviço Redis gratuito externo. Opções populares:

#### **Upstash Redis (Recomendado)**
- ✅ Plano free generoso (10.000 comandos/dia)
- ✅ Sempre ativo (não dorme)
- ✅ Fácil configuração

**Passos:**
1. Crie conta em https://upstash.com
2. Crie um novo banco Redis
3. Copie as credenciais de conexão
4. No Render, adicione as variáveis de ambiente:
   ```
   USE_REDIS=true
   REDIS_HOST=seu-redis.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=sua-senha-aqui
   REDIS_DB=0
   ```

#### **Redis Cloud (Redis Labs)**
- ✅ Plano free com 30MB
- ✅ Sempre ativo

**Passos:**
1. Crie conta em https://redis.com/cloud
2. Crie um banco gratuito
3. Copie a URL de conexão (formato: `redis://:senha@host:porta`)
4. No Render, configure as variáveis extraindo da URL

#### **Aiven Redis**
- ✅ Plano free com 1GB
- ⚠️ Pode dormir após inatividade

---

### ⚠️ **OPÇÃO 3: Container Redis no Render (Não Recomendado)**

Você pode tentar rodar Redis como um serviço separado no Render, mas:
- ⚠️ Não é oficialmente suportado no plano free
- ⚠️ Pode ser instável
- ⚠️ Consome recursos do plano free

---

## 📝 Passo a Passo do Deploy

### 1. Preparar o Repositório

Certifique-se de que seu código está no Git e commitado:

```bash
git add .
git commit -m "Preparar para deploy na Render"
git push
```

### 2. Criar Serviço Web na Render

1. Acesse https://dashboard.render.com
2. Clique em **New +** → **Web Service**
3. Conecte seu repositório
4. Configure:
   - **Name**: `backoffice-api` (ou o nome que preferir)
   - **Region**: Escolha a mais próxima
   - **Branch**: `main` (ou sua branch principal)
   - **Root Directory**: Deixe vazio (ou `.` se necessário)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:render`
   - **Start Command**: `npm run start:prod`

⚠️ **IMPORTANTE - Problema de Memória**: O plano free tem apenas 512MB de RAM. Use `build:render` que limita o uso de memória durante o build.

### 3. Configurar Variáveis de Ambiente

No painel do serviço, vá em **Environment** e adicione:

#### Variáveis Obrigatórias:
```
# JWT
JWT_SECRET=sua-chave-secreta-jwt-aqui
JWT_EXPIRES=1d
JWT_REFRESH_SECRET=sua-chave-refresh-secreta-aqui
JWT_REFRESH_EXPIRES=7d

# JWT Customer
JWT_CUSTOMER_SECRET=sua-chave-customer-secreta-aqui
JWT_CUSTOMER_EXPIRES=1d
JWT_CUSTOMER_REFRESH_SECRET=sua-chave-customer-refresh-secreta-aqui
JWT_CUSTOMER_REFRESH_EXPIRES=7d

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname?connection_limit=20&pool_timeout=20

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_API_KEY=sua-api-key-supabase

# Server Auth
SERVER_AUTH_SECRET=sua-chave-secreta-server-auth

# Port (Render define automaticamente, mas você pode definir)
PORT=10000
```

#### Variáveis de Redis (Escolha uma opção):

**Opção A: Cache em Memória (Sem Redis)**
```
USE_REDIS=false
```

**Opção B: Redis Externo (Upstash/Redis Cloud)**
```
USE_REDIS=true
REDIS_HOST=seu-redis.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha-redis
REDIS_DB=0
REDIS_TTL=3600
```

#### Variáveis Opcionais:
```
ALLOWED_ORIGINS=https://seu-frontend.com,https://www.seu-frontend.com
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=384
```

⚠️ **Nota sobre NODE_OPTIONS**: Limita o uso de memória do Node.js. 384MB é seguro para o plano free (512MB total).

### 4. Criar Banco de Dados PostgreSQL

1. No painel da Render, clique em **New +** → **PostgreSQL**
2. Configure:
   - **Name**: `backoffice-db`
   - **Database**: `backoffice`
   - **User**: Será gerado automaticamente
   - **Region**: Mesma região do seu serviço web
3. Após criar, copie a **Internal Database URL**
4. Use essa URL na variável `DATABASE_URL` do seu serviço web

### 5. Executar Migrações

A Render pode executar migrações automaticamente. Você tem duas opções:

#### Opção A: Script de Build (Recomendado)
Modifique o **Build Command** para:
```bash
npm install && npm run build:render && npx prisma migrate deploy
```

#### Opção B: Comando de Inicialização
Modifique o **Start Command** para:
```bash
npm run start:migrate:prod
```

⚠️ **Nota**: O script `start:migrate:prod` já está configurado no `package.json` para executar migrações antes de iniciar.

⚠️ **IMPORTANTE**: Use `build:render` em vez de `build` para evitar erros de memória no plano free.

### 6. Deploy

1. Clique em **Save Changes**
2. A Render iniciará o build automaticamente
3. Acompanhe os logs em **Logs**
4. Aguarde o build e deploy completarem

---

## 🔍 Verificando o Deploy

### 1. Verificar Logs

No painel do serviço, vá em **Logs** e verifique:
- ✅ Build completado com sucesso
- ✅ Migrações executadas
- ✅ Servidor iniciado na porta correta
- ✅ Mensagem sobre cache (Redis ou memória)

### 2. Testar Health Check

Acesse: `https://seu-servico.onrender.com/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "cache": "connected"
}
```

### 3. Verificar Cache

Nos logs, você deve ver uma das mensagens:
- `Usando cache em memória (Redis não configurado)` - Se `USE_REDIS=false`
- `Conectando ao Redis em ...` - Se Redis estiver configurado

---

## 🐛 Troubleshooting

### ⚠️ Erro: "JavaScript heap out of memory" ou "Reached heap limit"
**Causa**: O build está consumindo mais de 512MB de memória disponível no plano free.

**Solução**:
1. Certifique-se de usar `build:render` no **Build Command**:
   ```
   npm install && npm run build:render
   ```
2. Adicione variável de ambiente na Render (opcional, mas recomendado):
   ```
   NODE_OPTIONS=--max-old-space-size=384
   ```
3. Se ainda falhar, tente build em etapas separadas:
   ```
   npm install
   npm run prisma:generate:render
   npm run nest:build:render
   npx prisma migrate deploy
   ```

### Erro: "Cannot connect to Redis"
**Solução**: Defina `USE_REDIS=false` para usar cache em memória, ou verifique as credenciais do Redis externo.

### Erro: "Database connection failed"
**Solução**: 
- Verifique se o PostgreSQL está na mesma região
- Use a **Internal Database URL** (não a externa)
- Verifique se o banco está ativo

### Erro: "Prisma migrations failed"
**Solução**: 
- Verifique se o `DATABASE_URL` está correto
- Certifique-se de que o build command inclui `prisma generate`
- Verifique os logs para erros específicos

### Build muito lento
**Solução**: 
- A Render pode ser lenta no plano free
- Considere otimizar o `package.json` removendo dependências desnecessárias
- Use `.dockerignore` se estiver usando Docker
- O build pode levar 5-10 minutos no plano free

### Serviço dormindo (plano free)
**Solução**: 
- No plano free, serviços dormem após 15 minutos de inatividade
- Primeira requisição após dormir pode levar 30-60 segundos
- Considere usar um serviço de "ping" para manter ativo (ex: UptimeRobot)

---

## 📊 Monitoramento

### Logs
- Acesse **Logs** no painel do serviço
- Logs são mantidos por 7 dias no plano free

### Métricas
- A Render fornece métricas básicas no plano free
- CPU, Memória e Requisições

### Health Check
- Configure monitoramento externo (ex: UptimeRobot) para verificar `/health`
- Alerta quando o serviço estiver offline

---

## 🔄 Atualizações

Para atualizar o serviço:
1. Faça push das alterações para o repositório
2. A Render detecta automaticamente e inicia novo deploy
3. Ou clique em **Manual Deploy** → **Deploy latest commit**

---

## 💡 Dicas

1. **Use variáveis de ambiente**: Nunca commite secrets no código
2. **Teste localmente primeiro**: Use `.env` para testar antes de fazer deploy
3. **Monitore logs**: Verifique logs regularmente para identificar problemas
4. **Backup do banco**: Configure backups automáticos do PostgreSQL
5. **Cache em memória é suficiente**: Para começar, cache em memória funciona bem
6. **Upgrade quando necessário**: Quando crescer, considere planos pagos para melhor performance

---

## 📚 Recursos Adicionais

- [Documentação da Render](https://render.com/docs)
- [Upstash Redis](https://upstash.com/docs)
- [Redis Cloud](https://redis.com/cloud)
- [Prisma Deploy](https://www.prisma.io/docs/guides/deployment)

---

## ✅ Checklist de Deploy

- [ ] Repositório conectado na Render
- [ ] Serviço Web criado
- [ ] PostgreSQL criado e conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Redis configurado (ou `USE_REDIS=false`)
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Deploy executado com sucesso
- [ ] Health check funcionando
- [ ] Logs verificados
- [ ] Aplicação testada

---

**Última atualização**: 2024

