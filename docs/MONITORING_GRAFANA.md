# 📊 Monitoramento com Grafana e Prometheus

Este documento descreve como configurar e usar o sistema de monitoramento com Grafana e Prometheus para a API Backoffice.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Métricas Disponíveis](#métricas-disponíveis)
3. [Configuração](#configuração)
4. [Uso](#uso)
5. [Dashboards](#dashboards)
6. [Alertas](#alertas)

---

## 🎯 Visão Geral

O sistema de monitoramento utiliza:

- **Prometheus**: Coleta e armazena métricas
- **Grafana**: Visualização e dashboards
- **prom-client**: Biblioteca para expor métricas no formato Prometheus

### Arquitetura

```
Aplicação NestJS → Endpoint /api/metrics
         ↓
    Prometheus (coleta métricas a cada 15s)
         ↓
    Grafana (visualização)
```

---

## 📈 Métricas Disponíveis

### Métricas HTTP

- `http_requests_total`: Total de requisições HTTP
- `http_request_duration_seconds`: Duração das requisições (histograma)
- `http_request_errors_total`: Total de erros HTTP

**Labels**: `method`, `route`, `status_code`

### Métricas de Banco de Dados

- `db_queries_total`: Total de queries executadas
- `db_query_duration_seconds`: Duração das queries (histograma)
- `db_query_errors_total`: Total de erros em queries
- `db_connections_active`: Número de conexões ativas

**Labels**: `operation`, `model`, `status`

### Métricas de Cache

- `cache_hits_total`: Total de hits no cache
- `cache_misses_total`: Total de misses no cache
- `cache_operations_total`: Total de operações no cache

**Labels**: `key`, `operation`, `status`

### Métricas de Sistema

- `nodejs_heap_size_total_bytes`: Tamanho total do heap
- `nodejs_heap_size_used_bytes`: Tamanho usado do heap
- `nodejs_external_memory_bytes`: Memória externa
- `nodejs_process_cpu_user_seconds_total`: CPU usado pelo processo
- `memory_usage_bytes`: Uso de memória detalhado
- `active_connections`: Conexões ativas

---

## ⚙️ Configuração

### 1. Iniciar Serviços com Docker Compose

Para iniciar Prometheus e Grafana junto com a aplicação:

```bash
docker-compose --profile monitoring up -d
```

Ou apenas os serviços de monitoramento:

```bash
docker-compose --profile monitoring up prometheus grafana
```

### 2. Acessar os Serviços

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
  - Usuário: `admin`
  - Senha: `admin` (altere em produção!)

### 3. Verificar Métricas

Acesse o endpoint de métricas da aplicação:

```bash
curl http://localhost:3333/api/metrics
```

Você deve ver métricas no formato Prometheus.

---

## 🚀 Uso

### Verificar Métricas no Prometheus

1. Acesse http://localhost:9090
2. Vá em **Status > Targets** para verificar se a aplicação está sendo coletada
3. Use a aba **Graph** para fazer queries, por exemplo:

```promql
# Total de requisições por segundo
rate(http_requests_total[5m])

# Duração p95 das requisições
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Taxa de erros
rate(http_request_errors_total[5m])
```

### Configurar Grafana

1. **Login**: Acesse http://localhost:3000 e faça login
2. **Data Source**: O Prometheus já está configurado automaticamente
3. **Dashboards**: Um dashboard padrão está disponível em **Dashboards**

### Criar Dashboards Personalizados

1. Vá em **Dashboards > New Dashboard**
2. Adicione painéis com queries PromQL
3. Exemplos de queries úteis:

```promql
# Requisições por segundo por rota
sum(rate(http_requests_total[5m])) by (route)

# Taxa de erro por rota
sum(rate(http_request_errors_total[5m])) by (route)

# Cache hit rate
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))

# Queries do banco por modelo
sum(rate(db_queries_total[5m])) by (model)

# Uso de memória
nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes * 100
```

---

## 📊 Dashboards

### Dashboard Padrão

O dashboard padrão (`backoffice-api.json`) inclui:

1. **Requisições HTTP por Segundo**: Taxa de requisições
2. **Duração das Requisições**: Latência p50 e p95
3. **Taxa de Erros HTTP**: Erros por segundo
4. **Duração das Queries**: Latência p95 das queries do banco
5. **Cache Hit Rate**: Taxa de acerto do cache
6. **Uso de Memória**: Heap usado vs total

### Personalizar Dashboards

Os dashboards estão em `grafana/dashboards/`. Você pode:

1. Editar o JSON diretamente
2. Ou criar no Grafana e exportar

---

## 🔔 Alertas

### Configurar Alertas no Grafana

1. Vá em **Alerting > Alert Rules**
2. Crie uma nova regra
3. Exemplos de alertas úteis:

#### Alta Taxa de Erros

```promql
sum(rate(http_request_errors_total[5m])) > 10
```

#### Alta Latência

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
```

#### Alto Uso de Memória

```promql
nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes > 0.9
```

#### Muitas Queries Lentas

```promql
histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m])) > 2
```

### Configurar Notificações

1. Vá em **Alerting > Notification Channels**
2. Configure canais (Email, Slack, etc.)
3. Associe aos alertas

---

## 🔧 Troubleshooting

### Prometheus não está coletando métricas

1. Verifique se a aplicação está rodando: `docker ps`
2. Verifique o endpoint de métricas: `curl http://localhost:3333/api/metrics`
3. Verifique os targets no Prometheus: **Status > Targets**
4. Verifique os logs: `docker logs backoffice-prometheus`

### Grafana não mostra dados

1. Verifique se o Prometheus está configurado como data source
2. Teste a conexão: **Configuration > Data Sources > Prometheus > Test**
3. Verifique se há dados no Prometheus
4. Verifique o intervalo de tempo do dashboard

### Métricas não aparecem

1. Verifique se o interceptor está ativo (deve estar no `AppModule`)
2. Verifique os logs da aplicação
3. Teste fazendo algumas requisições à API
4. Verifique o endpoint `/api/metrics` diretamente

---

## 📝 Notas Importantes

### Performance

- O interceptor adiciona uma pequena sobrecarga (~1-2ms por requisição)
- As métricas são coletadas em memória e expostas via endpoint
- O Prometheus faz scraping a cada 15 segundos (configurável)

### Produção

- Altere as senhas padrão do Grafana
- Configure autenticação adequada
- Use HTTPS em produção
- Configure retenção de dados do Prometheus
- Configure backups dos dashboards do Grafana

### Segurança

- O endpoint `/api/metrics` deve ser protegido em produção
- Considere usar autenticação básica ou IP whitelist
- Não exponha métricas sensíveis

---

## 📚 Recursos Adicionais

- [Documentação do Prometheus](https://prometheus.io/docs/)
- [Documentação do Grafana](https://grafana.com/docs/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)

---

**Última atualização**: 2025-01-23

