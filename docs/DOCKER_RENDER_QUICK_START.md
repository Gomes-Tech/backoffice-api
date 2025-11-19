# 🐳 Deploy com Docker na Render - Guia Rápido

## ⚡ Passos Rápidos

### 1. Commit do Dockerfile

```bash
git add Dockerfile .dockerignore
git commit -m "Adicionar Dockerfile para Render"
git push
```

### 2. Criar Serviço na Render

1. Acesse https://dashboard.render.com
2. **New +** → **Web Service**
3. Conecte repositório
4. Configure:
   - **Runtime**: `Docker` ⚠️ (não Node!)
   - **Dockerfile Path**: `Dockerfile` (ou deixe vazio)
   - **Docker Context**: `.`

### 3. Variáveis de Ambiente

Adicione as mesmas variáveis do deploy Node, especialmente:
- `NODE_ENV=prod`
- `DATABASE_URL` (Internal Database URL)
- `USE_REDIS=false` (ou configure Redis externo)

### 4. Deploy

Salve e aguarde o build. Pronto! 🎉

---

## ✅ Vantagens do Docker

- ✅ Resolve problemas de memória durante build
- ✅ Ambiente consistente
- ✅ Builds mais rápidos (cache de layers)
- ✅ Mais controle sobre o processo

---

## 📝 Notas Importantes

- O Dockerfile já está otimizado para memória (200MB por etapa)
- Define `NODE_ENV=prod` automaticamente durante build
- Usa multi-stage build para imagem menor
- Roda como usuário não-root (segurança)

---

Para mais detalhes, veja `docs/DEPLOY_RENDER_DOCKER.md`

