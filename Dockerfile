# ============================================
# Stage 1: Build
# ============================================
FROM node:23-alpine AS builder

WORKDIR /app

# Variáveis de ambiente para build (economiza memória)
ENV NODE_ENV=prod
ENV NODE_OPTIONS=--max-old-space-size=200

# Copiar apenas arquivos de dependências primeiro (cache layer)
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production=false

# Copiar arquivos necessários para build
COPY prisma ./prisma
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Gerar Prisma Client com limite de memória
RUN NODE_OPTIONS='--max-old-space-size=200' npx prisma generate

# Build da aplicação com limite de memória
RUN NODE_OPTIONS='--max-old-space-size=200' npm run build

# ============================================
# Stage 2: Production Runtime
# ============================================
FROM node:23-alpine AS production

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Variáveis de ambiente de produção
ENV NODE_ENV=prod
ENV PORT=10000

# Copiar apenas arquivos necessários do builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --chown=nestjs:nodejs package*.json ./

# Mudar para usuário não-root
USER nestjs

# Expor porta (Render usa variável PORT)
EXPOSE 10000

# Health check (opcional, mas recomendado)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 10000) + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização (Render executará migrações se necessário)
CMD ["node", "dist/src/main"]
