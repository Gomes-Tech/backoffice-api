/**
 * Configuração de Connection Pooling para Prisma
 *
 * O Prisma usa connection pooling através de parâmetros na URL de conexão.
 * Este arquivo documenta as configurações recomendadas.
 */

/**
 * Parâmetros de Connection Pooling para PostgreSQL
 *
 * @example
 * DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=20&pool_timeout=20&connect_timeout=10"
 */
export const PRISMA_POOL_CONFIG = {
  /**
   * Número máximo de conexões no pool
   * Recomendado: 10-20 para aplicações pequenas/médias
   * Para aplicações grandes: 20-50
   * Não exceder o max_connections do PostgreSQL (padrão: 100)
   */
  connectionLimit: 20,

  /**
   * Timeout para obter uma conexão do pool (em segundos)
   * Se todas as conexões estiverem em uso, aguarda este tempo antes de falhar
   */
  poolTimeout: 20,

  /**
   * Timeout para estabelecer conexão inicial (em segundos)
   */
  connectTimeout: 10,
} as const;

/**
 * Constrói a URL de conexão com parâmetros de pool
 * Se a URL já tiver parâmetros, adiciona os de pool
 *
 * @param baseUrl - URL base do banco de dados
 * @param config - Configuração do pool (opcional)
 * @returns URL completa com parâmetros de pool
 */
export function buildDatabaseUrlWithPool(
  baseUrl: string,
  config: Partial<typeof PRISMA_POOL_CONFIG> = {},
): string {
  const poolConfig = { ...PRISMA_POOL_CONFIG, ...config };
  const url = new URL(baseUrl);

  // Adiciona ou atualiza parâmetros de pool
  url.searchParams.set(
    'connection_limit',
    poolConfig.connectionLimit.toString(),
  );
  url.searchParams.set('pool_timeout', poolConfig.poolTimeout.toString());
  url.searchParams.set('connect_timeout', poolConfig.connectTimeout.toString());

  return url.toString();
}

/**
 * Exemplo de DATABASE_URL com connection pooling:
 *
 * postgresql://user:password@localhost:5432/mydb?connection_limit=20&pool_timeout=20&connect_timeout=10
 *
 * Ou usando variáveis de ambiente:
 * DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?connection_limit=20&pool_timeout=20&connect_timeout=10"
 */

