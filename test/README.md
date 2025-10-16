# Testes do Módulo Banner

Este documento descreve a estrutura e organização dos testes para o módulo de Banner.

## Estrutura de Testes

### Testes Unitários

Os testes unitários estão localizados junto aos arquivos que testam, seguindo a convenção `*.spec.ts`.

#### Repository
- **Arquivo**: `src/infra/prisma/repositories/banner.repository.spec.ts`
- **Testa**: `PrismaBannerRepository`
- **Cobertura**:
  - Busca de todos os banners (findAll)
  - Busca de banners ativos (findList)
  - Busca de banner por ID (findById)
  - Criação de banner (create)
  - Atualização de banner (update)
  - Exclusão lógica de banner (delete)
  - Tratamento de erros do Prisma

#### Use Cases
- **CreateBannerUseCase** (`src/app/banner/use-cases/create-banner.use-case.spec.ts`)
  - Criação de banner com imagens
  - Validação de campos obrigatórios
  - Upload de imagens para storage
  
- **UpdateBannerUseCase** (`src/app/banner/use-cases/update-banner.use-case.spec.ts`)
  - Atualização de banner sem novas imagens
  - Atualização com nova imagem desktop
  - Atualização com nova imagem mobile
  - Atualização com ambas as imagens
  - Remoção de imagens antigas do storage
  
- **DeleteBannerUseCase** (`src/app/banner/use-cases/delete-banner.use-case.spec.ts`)
  - Exclusão lógica de banner
  - Validação de banner existente
  
- **FindBannerByIdUseCase** (`src/app/banner/use-cases/find-banner-by-id.use-case.spec.ts`)
  - Busca de banner por ID
  - Tratamento de banner não encontrado
  
- **FindAllBannersUseCase** (`src/app/banner/use-cases/find-all-banner.use-case.spec.ts`)
  - Listagem de todos os banners
  - Ordenação por campo `order`
  
- **FindListBannersUseCase** (`src/app/banner/use-cases/find-list-banner.use-case.spec.ts`)
  - Listagem de banners ativos
  - Filtro de banners deletados

#### Controller
- **Arquivo**: `src/interfaces/http/controllers/banner/banner.controller.spec.ts`
- **Testa**: `BannerController`
- **Cobertura**:
  - GET /banners - Listar todos os banners
  - GET /banners/list - Listar banners ativos
  - GET /banners/:id - Buscar banner por ID
  - POST /banners - Criar novo banner
  - PATCH /banners/:id - Atualizar banner
  - DELETE /banners/:id - Deletar banner

### Testes End-to-End (E2E)

- **Arquivo**: `test/banner.e2e-spec.ts`
- **Cobertura**:
  - Fluxo completo de CRUD
  - Autenticação e autorização
  - Upload de arquivos
  - Validação de dados
  - Soft delete
  - Integração com banco de dados

## Mocks e Helpers

### Mocks

#### BannerMockFactory (`test/mocks/banner.mock.ts`)
Factory para criação de dados mock de banners:
- `createBanner()` - Cria um mock de Banner
- `createListBanner()` - Cria um mock de ListBanner
- `createListBanners(count)` - Cria múltiplos mocks de ListBanner
- `createCreateBannerDto()` - Cria um mock de CreateBanner DTO
- `createUpdateBannerDto()` - Cria um mock de UpdateBanner DTO
- `createMockFile()` - Cria um mock de arquivo Multer
- `createMockFiles()` - Cria mocks de arquivos desktop e mobile
- `createMockUploadResult()` - Cria resultado mock de upload

#### Service Mocks (`test/mocks/services.mock.ts`)
Mocks de serviços:
- `MockPrismaService` - Mock do PrismaService
- `MockLoggerService` - Mock do AdvancedLoggerService
- `MockStorageService` - Mock do StorageService
- `MockBannerRepository` - Mock do BannerRepository

### Helpers

#### E2ETestHelper (`test/helpers/e2e-test.helper.ts`)
Helpers para testes E2E:
- `createTestAdminUser()` - Cria usuário admin de teste
- `createTestBanner()` - Cria banner de teste
- `deleteTestBanners()` - Remove banners de teste
- `deleteTestUser()` - Remove usuário de teste
- `cleanup()` - Limpa todos os dados de teste
- `generateMockToken()` - Gera token JWT mock

#### DatabaseTransactionHelper (`test/helpers/e2e-test.helper.ts`)
Helpers para transações de banco:
- `executeInTransaction()` - Executa callback em transação
- `clearBannerTable()` - Limpa tabela de banners
- `seedTestBanners()` - Popula banners de teste

#### TestUtils (`test/helpers/test-utils.helper.ts`)
Utilitários gerais para testes:
- `hasRequiredProperties()` - Valida propriedades obrigatórias
- `isValidBannerStructure()` - Valida estrutura de banner
- `isValidListBannerStructure()` - Valida estrutura de list banner
- `randomString()` - Gera string aleatória
- `randomEmail()` - Gera email aleatório
- `randomUrl()` - Gera URL aleatória
- `delay()` - Cria delay assíncrono
- `sortByProperty()` - Ordena array por propriedade
- `isSortedByProperty()` - Verifica se array está ordenado
- `filterActive()` - Filtra itens ativos
- E muitos outros utilitários...

## Executando os Testes

### Testes Unitários
```bash
# Executar todos os testes unitários
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:cov

# Executar testes específicos
npm test -- banner.repository.spec.ts
```

### Testes E2E
```bash
# Executar todos os testes E2E
npm run test:e2e

# Executar teste E2E específico
npm run test:e2e -- banner.e2e-spec.ts
```

### Debug de Testes
```bash
# Executar testes em modo debug
npm run test:debug
```

## Configuração

### Jest Configuration

A configuração do Jest está no `package.json` e inclui:
- Suporte a TypeScript via `ts-jest`
- Path aliases configurados via `moduleNameMapper`
- Ambiente de teste Node.js

### E2E Configuration

A configuração E2E está em `test/jest-e2e.json` e inclui:
- Regex para arquivos `.e2e-spec.ts`
- Path aliases para imports
- Ambiente de teste Node.js

## Boas Práticas

1. **Isolamento**: Cada teste deve ser independente e não depender de outros testes
2. **Mocks**: Use os mocks fornecidos para isolar dependências
3. **Cleanup**: Sempre limpe os dados de teste após a execução
4. **Nomenclatura**: Use nomes descritivos para os testes
5. **Arrange-Act-Assert**: Siga o padrão AAA nos testes
6. **Coverage**: Mantenha a cobertura de testes acima de 80%

## Estrutura de Diretórios

```
src/
├── app/
│   └── banner/
│       └── use-cases/
│           ├── *.use-case.ts
│           └── *.use-case.spec.ts
├── infra/
│   └── prisma/
│       └── repositories/
│           ├── banner.repository.ts
│           └── banner.repository.spec.ts
└── interfaces/
    └── http/
        └── controllers/
            └── banner/
                ├── banner.controller.ts
                └── banner.controller.spec.ts

test/
├── banner.e2e-spec.ts
├── helpers/
│   ├── e2e-test.helper.ts
│   ├── test-utils.helper.ts
│   └── index.ts
└── mocks/
    ├── banner.mock.ts
    ├── services.mock.ts
    └── index.ts
```

## Troubleshooting

### Erro: Cannot find module '@domain/banner'
- Verifique se o `moduleNameMapper` está configurado no `package.json`
- Execute `npm test` novamente

### Erro: Connection refused (E2E)
- Certifique-se de que o banco de dados está rodando
- Verifique as variáveis de ambiente

### Testes lentos
- Use mocks ao invés de serviços reais quando possível
- Execute testes em paralelo quando apropriado
- Considere usar `--maxWorkers` para limitar workers

## Contribuindo

Ao adicionar novos testes:
1. Siga a estrutura existente
2. Use os mocks e helpers fornecidos
3. Adicione documentação quando necessário
4. Mantenha a cobertura de testes alta
5. Execute todos os testes antes de fazer commit
