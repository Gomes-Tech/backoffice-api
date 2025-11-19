# 🔴 Melhorias Críticas Pendentes - Segurança e Escalabilidade

**Data da Análise**: 2025-01-23  
**Contexto**: API de E-commerce Grande no Brasil  
**Prioridade**: CRÍTICA

---

## 📋 Índice

1. [Segurança Crítica](#segurança-crítica)
2. [Escalabilidade Crítica](#escalabilidade-crítica)
3. [Validações e Proteções](#validações-e-proteções)
4. [Priorização](#priorização)

---

## 🔒 SEGURANÇA CRÍTICA

### 🔴 CRÍTICO 1: Validação de Tipo de Arquivo (MIME Type)

**Problema**: 
Apenas o tamanho de arquivo é validado. Não há validação de tipo MIME, permitindo upload de arquivos maliciosos (ex: `.exe`, `.php`, `.sh` disfarçados como imagens).

**Impacto**:
- Upload de arquivos executáveis maliciosos
- Possível execução de código no servidor
- Comprometimento do sistema de storage
- Violação de segurança crítica

**Solução**:

```typescript
// src/shared/interceptors/file-type-validation.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

const ALLOWED_MIME_TYPES_KEY = 'allowedMimeTypes';

// Tipos permitidos por contexto
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_ICON_TYPES = [
  'image/svg+xml',
  'image/png',
  'image/x-icon',
];

@Injectable()
export class FileTypeValidationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const allowedTypes = this.reflector.getAllAndOverride<string[]>(
      ALLOWED_MIME_TYPES_KEY,
      [context.getHandler(), context.getClass()],
    ) || ALLOWED_IMAGE_TYPES; // Padrão: apenas imagens

    // Validar arquivo único
    if (request.file) {
      this.validateFileType(request.file, allowedTypes);
    }

    // Validar múltiplos arquivos
    if (request.files) {
      if (Array.isArray(request.files)) {
        request.files.forEach((file: Express.Multer.File) => {
          this.validateFileType(file, allowedTypes);
        });
      } else {
        Object.values(request.files).forEach((fileArray: any) => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach((file: Express.Multer.File) => {
              this.validateFileType(file, allowedTypes);
            });
          } else if (fileArray && fileArray.mimetype) {
            this.validateFileType(fileArray, allowedTypes);
          }
        });
      }
    }

    return next.handle();
  }

  private validateFileType(file: Express.Multer.File, allowedTypes: string[]): void {
    if (!file || !file.mimetype) {
      throw new BadRequestException(
        'Tipo de arquivo não identificado. Apenas arquivos de imagem são permitidos.',
      );
    }

    // Validar MIME type
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo "${file.mimetype}" não é permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
      );
    }

    // Validação adicional: verificar extensão do arquivo
    const allowedExtensions = allowedTypes
      .map(mime => {
        if (mime === 'image/jpeg' || mime === 'image/jpg') return ['.jpg', '.jpeg'];
        if (mime === 'image/png') return ['.png'];
        if (mime === 'image/webp') return ['.webp'];
        if (mime === 'image/gif') return ['.gif'];
        if (mime === 'image/svg+xml') return ['.svg'];
        if (mime === 'image/x-icon') return ['.ico'];
        return [];
      })
      .flat();

    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Extensão de arquivo "${fileExtension}" não é permitida.`,
      );
    }
  }
}

// Decorator
export const AllowedFileTypes = (...mimeTypes: string[]) =>
  SetMetadata(ALLOWED_MIME_TYPES_KEY, mimeTypes);
```

**Uso**:
```typescript
@Post()
@AllowedFileTypes('image/jpeg', 'image/png', 'image/webp')
@MaxFileSize(undefined, 10)
async create(@UploadedFiles() files) {
  // ...
}
```

**Prioridade**: 🔴 CRÍTICO - Implementar IMEDIATAMENTE

---

### 🔴 CRÍTICO 2: Falta de Transações de Banco de Dados

**Problema**: 
Não há uso de transações (`$transaction`) em operações que modificam múltiplas tabelas. Isso pode causar inconsistência de dados.

**Impacto**:
- Dados inconsistentes em operações complexas
- Possível perda de integridade referencial
- Problemas em rollback de operações
- Violação de ACID

**Exemplo de Problema**:
```typescript
// ❌ RUIM: Sem transação
async createProduct(data) {
  const product = await this.prisma.product.create(...);
  await this.prisma.attributeValue.create(...); // Se falhar, product fica órfão
  await this.prisma.productImage.create(...); // Se falhar, dados inconsistentes
}
```

**Solução**:

```typescript
// ✅ BOM: Com transação
async createProduct(data) {
  return await this.prisma.$transaction(async (tx) => {
    const product = await tx.product.create(...);
    await tx.attributeValue.create(...);
    await tx.productImage.create(...);
    return product;
  }, {
    maxWait: 5000, // Tempo máximo de espera
    timeout: 10000, // Timeout da transação
  });
}
```

**Onde Implementar**:
- `CreateProductUseCase` - Cria produto + atributos + imagens
- `UpdateProductUseCase` - Atualiza múltiplas tabelas
- `CreateBannerUseCase` - Cria banner + imagens
- Qualquer operação que modifique 2+ tabelas

**Prioridade**: 🔴 CRÍTICO - Implementar IMEDIATAMENTE

---

### 🔴 CRÍTICO 3: Proteção Contra Enumeration Attacks

**Problema**: 
Endpoints de autenticação e recuperação de senha podem revelar se um email/usuário existe no sistema.

**Impacto**:
- Enumeration de usuários cadastrados
- Ataques direcionados
- Violação de privacidade (LGPD)
- Informação útil para ataques de força bruta

**Solução**:

```typescript
// src/app/auth/user/use-cases/forgot-password.use-case.ts
async execute(dto: ForgotPasswordDto): Promise<void> {
  // SEMPRE retornar sucesso, mesmo se email não existir
  const user = await this.userRepository.findByEmail(dto.email);
  
  if (user) {
    // Criar token apenas se usuário existir
    await this.createTokenPasswordUseCase.execute({
      email: dto.email,
      userId: user.id,
    });
    
    // Enviar email (não logar se email não existe)
    await this.mailService.sendPasswordResetEmail(user.email, token);
  }
  
  // SEMPRE retornar a mesma mensagem
  return; // Não revelar se email existe ou não
}

// Resposta sempre igual:
// "Se o email existir, você receberá instruções para redefinir sua senha"
```

**Aplicar em**:
- `/api/auth/forgot-password`
- `/api/auth/sign-in` (não revelar se email existe)
- `/api/customer-auth/forgot-password`
- Qualquer endpoint que verifique existência de usuário

**Prioridade**: 🔴 CRÍTICO - Implementar IMEDIATAMENTE (LGPD)

---

### 🔴 CRÍTICO 4: Proteção Contra IDOR (Insecure Direct Object Reference)

**Problema**: 
Não há verificação se o usuário autenticado tem permissão para acessar/modificar recursos específicos.

**Impacto**:
- Usuário A pode acessar/modificar dados do Usuário B
- Violação de privacidade
- Acesso não autorizado a dados sensíveis
- Violação de LGPD

**Exemplo de Problema**:
```typescript
// ❌ RUIM: Sem verificação de ownership
@Get(':id')
async findById(@Param('id') id: string) {
  return this.service.findById(id); // Qualquer usuário pode acessar qualquer ID
}
```

**Solução**:

```typescript
// ✅ BOM: Com verificação de ownership
@Get(':id')
async findById(
  @Param('id') id: string,
  @UserId() userId: string,
) {
  const customer = await this.service.findById(id);
  
  // Verificar se o usuário autenticado é o dono do recurso
  if (customer.userId !== userId && !this.isAdmin(userId)) {
    throw new ForbiddenException('Você não tem permissão para acessar este recurso');
  }
  
  return customer;
}
```

**Onde Implementar**:
- Endpoints de Customer (verificar se é o próprio customer)
- Endpoints de User (verificar se é o próprio user ou admin)
- Qualquer recurso que tenha ownership

**Prioridade**: 🔴 CRÍTICO - Implementar IMEDIATAMENTE

---

### 🔴 CRÍTICO 5: Rate Limiting por Usuário Autenticado

**Problema**: 
Rate limiting atual é apenas por IP. Usuários autenticados podem compartilhar IP ou usar VPNs para burlar limites.

**Impacto**:
- Bypass de rate limiting
- Ataques distribuídos
- Abuso de API por usuários autenticados

**Solução**:

```typescript
// src/infra/throttler/throttler.module.ts
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async getTracker(req: Record<string, any>): Promise<string> {
    // Se usuário autenticado, usar userId + IP
    if (req.user?.id) {
      return `${req.user.id}:${req.ip}`;
    }
    // Se não autenticado, usar apenas IP
    return req.ip;
  }
}

// Aplicar no AppModule
{
  provide: APP_GUARD,
  useClass: CustomThrottlerGuard,
}
```

**Prioridade**: 🔴 CRÍTICO - Implementar IMEDIATAMENTE

---

### 🟡 ALTO 6: Validação de CORS Mais Restritiva em Produção

**Problema**: 
CORS permite localhost em desenvolvimento, mas pode estar muito permissivo em produção.

**Impacto**:
- Possível acesso de origens não autorizadas
- Vulnerabilidade a ataques CSRF
- Violação de segurança

**Solução**:

```typescript
// src/main.ts
app.enableCors({
  origin: (origin, callback) => {
    // Em produção, NUNCA permitir sem origin
    if (process.env.NODE_ENV === 'prod') {
      if (!origin) {
        callback(new Error('Origin é obrigatório em produção'));
        return;
      }
      
      // Lista explícita de origens permitidas
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      if (!allowedOrigins.includes(origin)) {
        callback(new Error('Origin não autorizada'));
        return;
      }
    }
    
    // Desenvolvimento: permitir localhost
    if (process.env.NODE_ENV !== 'prod') {
      if (!origin || origin.startsWith('http://localhost')) {
        callback(null, true);
        return;
      }
    }
    
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  maxAge: 86400, // 24 horas
});
```

**Prioridade**: 🟡 ALTO - Implementar antes de produção

---

## 📈 ESCALABILIDADE CRÍTICA

### 🔴 CRÍTICO 7: Paginação Obrigatória em Todos os Endpoints de Listagem

**Problema**: 
Alguns endpoints podem não ter paginação implementada ou podem ter limites muito altos.

**Impacto**:
- Timeout de requisições
- Alto uso de memória
- Degradação de performance
- Possível DoS

**Solução**:

```typescript
// src/shared/decorators/pagination.decorator.ts
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100) // Limite máximo
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50) // Limite máximo de itens por página
  limit?: number = 10;
}

// Aplicar em TODOS os endpoints de listagem
@Get()
async findAll(@Query() query: PaginationDto) {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;
  
  return this.service.findAll({
    skip,
    take: limit,
  });
}
```

**Verificar e Implementar em**:
- `/api/users` (GET)
- `/api/customers` (GET)
- `/api/products` (já tem, verificar limites)
- `/api/categories` (já tem, verificar limites)
- Todos os outros endpoints de listagem

**Prioridade**: 🔴 CRÍTICO - Implementar IMEDIATAMENTE

---

### 🟡 ALTO 8: Cache de Queries Frequentes

**Problema**: 
Nem todas as queries frequentes estão sendo cacheadas.

**Impacto**:
- Queries repetidas ao banco
- Degradação de performance
- Maior carga no banco

**Solução**:

```typescript
// Exemplo: Cache de categorias
async findAllCategories() {
  const cacheKey = 'categories:all';
  const cached = await this.cacheService.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const categories = await this.repository.findAll();
  await this.cacheService.set(cacheKey, categories, 3600); // 1 hora
  
  return categories;
}

// Invalidar cache quando necessário
async updateCategory(id: string, data: UpdateCategoryDto) {
  await this.repository.update(id, data);
  await this.cacheService.del('categories:all'); // Invalidar cache
}
```

**Onde Implementar Cache**:
- Listagem de categorias (cache de 1 hora)
- Listagem de produtos públicos (cache de 30 minutos)
- Menus (header/footer) - cache de 1 hora
- Configurações do sistema - cache de 24 horas

**Prioridade**: 🟡 ALTO - Implementar nas próximas 2 semanas

---

### 🟡 ALTO 9: Validação de Mass Assignment

**Problema**: 
DTOs podem aceitar campos que não deveriam ser atualizáveis diretamente.

**Impacto**:
- Usuários podem modificar campos sensíveis (ex: `isActive`, `roleId`)
- Violação de regras de negócio
- Possível escalação de privilégios

**Solução**:

```typescript
// ✅ BOM: DTOs separados para criação e atualização
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  // Campos que NÃO podem ser atualizados diretamente
  // isActive, roleId, etc. devem ser atualizados por endpoints específicos
}

// Endpoint específico para atualizar status
@Patch(':id/status')
@Roles('admin')
async updateStatus(
  @Param('id') id: string,
  @Body() dto: UpdateUserStatusDto, // DTO específico apenas com isActive
) {
  return this.service.updateStatus(id, dto.isActive);
}
```

**Verificar em**:
- `UpdateUserDto` - remover `isActive`, `roleId`
- `UpdateCustomerDto` - remover campos sensíveis
- Todos os DTOs de atualização

**Prioridade**: 🟡 ALTO - Implementar nas próximas 2 semanas

---

### 🟢 MÉDIO 10: Validação de Integridade de Dados

**Problema**: 
Falta validação de integridade referencial antes de operações críticas.

**Solução**:

```typescript
// Verificar se relacionamentos existem antes de criar
async createProduct(data: CreateProductDto) {
  // Validar se categoria existe
  const category = await this.categoryRepository.findById(data.categoryId);
  if (!category) {
    throw new BadRequestException('Categoria não encontrada');
  }
  
  // Validar se atributos existem
  if (data.attributeValues) {
    for (const attrValue of data.attributeValues) {
      const exists = await this.attributeValueRepository.findById(attrValue.id);
      if (!exists) {
        throw new BadRequestException(`Atributo ${attrValue.id} não encontrado`);
      }
    }
  }
  
  // Criar produto com transação
  return await this.prisma.$transaction(async (tx) => {
    // ...
  });
}
```

**Prioridade**: 🟢 MÉDIO - Implementar quando necessário

---

## 📊 RESUMO DE PRIORIDADES

### 🔴 CRÍTICO (Implementar IMEDIATAMENTE)

1. ✅ **Validação de Tipo de Arquivo (MIME Type)** - Segurança crítica
2. ✅ **Transações de Banco de Dados** - Integridade de dados
3. ✅ **Proteção Contra Enumeration Attacks** - LGPD/Privacidade
4. ✅ **Proteção Contra IDOR** - Segurança de acesso
5. ✅ **Rate Limiting por Usuário** - Prevenção de abuso
6. ✅ **Paginação Obrigatória** - Escalabilidade

### 🟡 ALTO (Próximas 2 Semanas)

7. **CORS Mais Restritivo** - Segurança
8. **Cache de Queries Frequentes** - Performance
9. **Validação de Mass Assignment** - Segurança

### 🟢 MÉDIO (Próximo Mês)

10. **Validação de Integridade de Dados** - Qualidade

---

## 🎯 AÇÕES IMEDIATAS

1. **Hoje**: Implementar validação de tipo de arquivo
2. **Hoje**: Adicionar transações em operações complexas
3. **Amanhã**: Proteger contra enumeration attacks
4. **Amanhã**: Implementar verificação de ownership (IDOR)
5. **Esta Semana**: Rate limiting por usuário + paginação obrigatória

---

## 📝 NOTAS IMPORTANTES

- **LGPD**: Enumeration attacks violam privacidade (LGPD)
- **E-commerce Grande**: Volume alto requer paginação obrigatória
- **Segurança**: Validação de arquivos é crítica para e-commerce
- **Integridade**: Transações são essenciais para operações financeiras

---

**Última Atualização**: 2025-01-23

