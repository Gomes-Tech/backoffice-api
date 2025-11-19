# 🔧 Guia Rápido - Configurar Connection Pooling

## ⚡ Configuração Rápida

### 1. Atualizar .env ou .env.development

Adicione os parâmetros de pool na sua `DATABASE_URL`:

```env
# ANTES
DATABASE_URL="postgresql://postgres:admin@localhost:5432/backoffice"

# DEPOIS (com connection pooling)
DATABASE_URL="postgresql://postgres:admin@localhost:5432/backoffice?connection_limit=20&pool_timeout=20&connect_timeout=10"
```

### 2. Para Docker Compose

Se você usa variáveis de ambiente no docker-compose, atualize o `.env.development`:

```env
DATABASE_URL="postgresql://postgres:admin@db:5432/backoffice?connection_limit=20&pool_timeout=20&connect_timeout=10"
```

### 3. Para Produção

```env
# Produção com mais conexões
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=50&pool_timeout=30&connect_timeout=10&sslmode=require"
```

---

## 📊 Valores Recomendados

| Ambiente | connection_limit | pool_timeout | connect_timeout |
|----------|------------------|--------------|-----------------|
| **Desenvolvimento** | 10-20 | 10-20 | 10 |
| **Staging** | 20 | 20 | 10 |
| **Produção (Pequeno)** | 20 | 20 | 10 |
| **Produção (Médio)** | 30-40 | 30 | 10 |
| **Produção (Grande)** | 50 | 30 | 10 |

---

## ⚠️ Importante

1. **Não exceda max_connections do PostgreSQL** (padrão: 100)
2. **Reserve conexões** para outras aplicações/ferramentas
3. **Monitore** o uso de conexões em produção
4. **Ajuste conforme necessário** baseado em métricas reais

---

## 🔍 Verificar se está funcionando

Após atualizar a `DATABASE_URL` e reiniciar a aplicação:

1. A aplicação deve iniciar normalmente
2. Queries devem funcionar normalmente
3. Em desenvolvimento, você verá logs de queries (se configurado)

---

## 📚 Documentação Completa

Veja `CONNECTION_POOLING_IMPLEMENTACAO.md` para detalhes completos.

