# 🔧 Solução: Erro de Memória no Deploy Render (Plano Free)

## ❌ Problema

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Causa**: O build está consumindo mais de 512MB de memória disponível no plano free da Render.

---

## ✅ Solução Rápida

### 1. Atualizar Build Command na Render

No painel da Render, vá em **Settings** → **Build Command** e altere para:

```bash
npm install && npm run build:render
```

**OU** se quiser incluir migrações no build:

```bash
npm install && npm run build:render && npx prisma migrate deploy
```

⚠️ **IMPORTANTE**: O script `build:render` agora define `NODE_ENV=prod` durante o build para desabilitar métricas e economizar memória.

### 2. Adicionar Variável de Ambiente (Opcional mas Recomendado)

No painel da Render, vá em **Environment** e adicione:

```
NODE_OPTIONS=--max-old-space-size=384
```

Isso limita o Node.js a usar no máximo 384MB de memória, deixando espaço para o sistema.

### 3. Fazer Novo Deploy

1. Salve as alterações
2. Clique em **Manual Deploy** → **Deploy latest commit**
3. Acompanhe os logs

---

## 📋 O que foi implementado

Foram criados scripts otimizados no `package.json`:

- `build:render` - Build otimizado para Render (limita memória a 256MB por etapa)
- `prisma:generate:render` - Gera Prisma Client com limite de memória
- `nest:build:render` - Build do NestJS com limite de memória

Esses scripts dividem o build em etapas menores, cada uma usando no máximo 256MB.

---

## 🔍 Verificando se Funcionou

Nos logs do build, você deve ver:
- ✅ `prisma generate` completado
- ✅ `nest build` completado
- ✅ Sem erros de memória

Se ainda houver problemas, tente build em etapas ainda menores (veja abaixo).

---

## 🆘 Se Ainda Falhar

### Opção 1: Build em Etapas Separadas

No **Build Command**, use:

```bash
npm install && npm run prisma:generate:render && npm run nest:build:render && npx prisma migrate deploy
```

### Opção 2: Reduzir Mais a Memória

Se ainda falhar, reduza o limite. Edite `package.json` e altere `200` para `150`:

```json
"prisma:generate:render": "NODE_OPTIONS='--max-old-space-size=150' npx prisma generate",
"nest:build:render": "NODE_OPTIONS='--max-old-space-size=150' npx nest build",
```

⚠️ **Nota**: O limite já está em 200MB por padrão. Reduza apenas se necessário.

### Opção 3: Usar Variável de Ambiente Global

Adicione na Render:
```
NODE_OPTIONS=--max-old-space-size=200
```

E use build command simples:
```bash
npm install && npm run build
```

---

## 📊 Limites de Memória Recomendados

| Configuração | Memória Máxima | Quando Usar |
|-------------|----------------|-------------|
| `--max-old-space-size=200` | 200MB | Padrão atual (build:render) |
| `--max-old-space-size=150` | 150MB | Se 200MB falhar |
| `--max-old-space-size=128` | 128MB | Último recurso (muito restritivo) |

⚠️ **Nota**: O plano free tem 512MB total. Deixe sempre ~128MB para o sistema operacional.

---

## 🎯 Checklist

- [ ] Build Command atualizado para usar `build:render`
- [ ] Variável `NODE_OPTIONS` adicionada (opcional)
- [ ] Novo deploy iniciado
- [ ] Logs verificados - sem erros de memória
- [ ] Build completado com sucesso

---

**Última atualização**: 2024

