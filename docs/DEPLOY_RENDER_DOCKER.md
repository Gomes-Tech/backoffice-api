# 🐳 Deploy na Render usando Dockerfile

Este guia explica como fazer deploy na Render usando Dockerfile, o que pode resolver problemas de memória e dar mais controle sobre o ambiente de build.

---

## ✅ Vantagens de usar Dockerfile

- ✅ **Controle total** sobre o ambiente de build
- ✅ **Otimização de memória** durante o build
- ✅ **Builds mais rápidos** com cache de layers
- ✅ **Ambiente consistente** entre desenvolvimento e produção
- ✅ **Segurança** com usuário não-root

---

## 📋 Pré-requisitos

- Conta na Render (https://render.com)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Dockerfile otimizado no repositório (já criado)

---

## 🚀 Passo a Passo

### 1. Verificar Dockerfile

Certifique-se de que o `Dockerfile` está na raiz do projeto e commitado:

```bash
git add Dockerfile .dockerignore
git commit -m "Adicionar Dockerfile otimizado para Render"
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
   - **Root Directory**: Deixe vazio
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (ou deixe vazio se estiver na raiz)
   - **Docker Context**: `.` (ponto, raiz do projeto)

⚠️ **IMPORTANTE**: Selecione **Runtime: Docker** em vez de Node!

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

# Port (Render define automaticamente)
PORT=10000

# Ambiente
NODE_ENV=prod
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
NODE_OPTIONS=--max-old-space-size=384
```

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

O Dockerfile não executa migrações automaticamente. Você tem duas opções:

#### Opção A: Script de Inicialização (Recomendado)

Crie um script `start.sh` na raiz do projeto:

```bash
#!/bin/sh
set -e

echo "🔄 Executando migrações..."
npx prisma migrate deploy

echo "🌱 Executando seed (se necessário)..."
# npm run seed || true

echo "🚀 Iniciando aplicação..."
node dist/src/main
```

E atualize o Dockerfile:

```dockerfile
# No final do Dockerfile, antes do CMD
COPY --chown=nestjs:nodejs start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]
```

#### Opção B: Comando Manual

No painel da Render, após o primeiro deploy, você pode executar migrações manualmente via **Shell**:

```bash
npx prisma migrate deploy
```

### 6. Deploy

1. Clique em **Save Changes**
2. A Render iniciará o build do Docker automaticamente
3. Acompanhe os logs em **Logs**
4. Aguarde o build e deploy completarem (pode levar 5-10 minutos no plano free)

---

## 🔍 Verificando o Deploy

### 1. Verificar Logs

No painel do serviço, vá em **Logs** e verifique:
- ✅ Build do Docker completado
- ✅ Imagem criada com sucesso
- ✅ Container iniciado
- ✅ Servidor rodando na porta correta

### 2. Testar Health Check

Acesse: `https://seu-servico.onrender.com/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "cache": "connected"
}
```

---

## 🐛 Troubleshooting

### Erro: "Build failed - out of memory"
**Solução**: O Dockerfile já está otimizado com `NODE_OPTIONS=--max-old-space-size=200`. Se ainda falhar:
1. Verifique se está usando o Dockerfile correto
2. Considere reduzir ainda mais o limite (150MB)

### Erro: "Cannot find module"
**Solução**: 
- Verifique se o `Dockerfile` está copiando todos os arquivos necessários
- Certifique-se de que `node_modules` está sendo copiado do builder

### Erro: "Port already in use"
**Solução**: 
- A Render define a porta automaticamente via variável `PORT`
- Certifique-se de que a aplicação usa `process.env.PORT`

### Build muito lento
**Solução**: 
- O Docker usa cache de layers, builds subsequentes serão mais rápidos
- No plano free, builds podem levar 5-10 minutos

### Erro: "Prisma migrations failed"
**Solução**: 
- Execute migrações manualmente via Shell na Render
- Ou configure o script de inicialização (Opção A acima)

---

## 📊 Comparação: Docker vs Node Runtime

| Aspecto | Node Runtime | Docker |
|---------|--------------|--------|
| **Controle** | Limitado | Total |
| **Memória** | 512MB compartilhada | 512MB compartilhada |
| **Build** | Scripts npm | Dockerfile |
| **Cache** | Limitado | Layers Docker |
| **Velocidade** | Mais rápido | Mais lento (primeira vez) |
| **Flexibilidade** | Baixa | Alta |

---

## 💡 Dicas

1. **Cache de Layers**: O Docker cacheia layers, então builds subsequentes são mais rápidos
2. **Multi-stage Build**: O Dockerfile usa multi-stage para reduzir tamanho da imagem final
3. **Usuário Não-Root**: Por segurança, a aplicação roda como usuário não-privilegiado
4. **Health Check**: O Dockerfile inclui health check automático
5. **.dockerignore**: Use para excluir arquivos desnecessários do build

---

## 🔄 Atualizações

Para atualizar o serviço:
1. Faça push das alterações para o repositório
2. A Render detecta automaticamente e inicia novo build
3. Ou clique em **Manual Deploy** → **Deploy latest commit**

---

## ✅ Checklist de Deploy

- [ ] Dockerfile na raiz do projeto
- [ ] .dockerignore configurado
- [ ] Repositório conectado na Render
- [ ] Serviço Web criado com Runtime: Docker
- [ ] PostgreSQL criado e conectado
- [ ] Variáveis de ambiente configuradas
- [ ] Redis configurado (ou `USE_REDIS=false`)
- [ ] Deploy executado com sucesso
- [ ] Health check funcionando
- [ ] Logs verificados
- [ ] Migrações executadas (se necessário)
- [ ] Aplicação testada

---

## 📚 Recursos Adicionais

- [Documentação Docker da Render](https://render.com/docs/docker)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

**Última atualização**: 2024

