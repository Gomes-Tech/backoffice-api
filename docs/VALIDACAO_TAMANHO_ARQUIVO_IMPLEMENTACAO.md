# ✅ Implementação: Validação de Tamanho de Arquivos em Uploads

**Data**: 2025-01-23  
**Status**: ✅ Implementado  
**Prioridade**: 🟡 ALTO

---

## 📋 Resumo

Implementada validação automática de tamanho de arquivos em todos os endpoints de upload para prevenir DoS por upload de arquivos muito grandes e proteger o servidor.

---

## 🎯 Objetivo

Garantir que arquivos enviados não excedam limites configurados:
- Prevenir DoS por upload de arquivos muito grandes
- Proteger recursos do servidor (memória/disco)
- Melhorar experiência do usuário com feedback claro

---

## 🔧 Implementação

### Arquivos Criados

1. **`src/shared/decorators/max-file-size.decorator.ts`**
   - Decorator `@MaxFileSize()` para configurar limite por endpoint

2. **`src/shared/interceptors/file-size-validation.interceptor.ts`**
   - Interceptor que valida tamanho de arquivos automaticamente

3. **`src/shared/interceptors/index.ts`**
   - Export do interceptor

### Arquivos Modificados

1. **`src/app.module.ts`**
   - Interceptor aplicado globalmente

2. **Controllers atualizados**:
   - `ProductController` - 10MB por arquivo
   - `BannerController` - 5MB por arquivo
   - `UserController` - 2MB para foto de perfil
   - `SocialMediaController` - 2MB para ícones
   - `CategoryController` - 5MB para imagem

---

## 📝 Como Funciona

### 1. Decorator `@MaxFileSize()`

```typescript
// Opção 1: Especificar em MB
@MaxFileSize(undefined, 10) // 10MB

// Opção 2: Especificar em bytes
@MaxFileSize(5 * 1024 * 1024) // 5MB em bytes

// Se não especificado, usa padrão de 5MB
@MaxFileSize()
```

### 2. Interceptor Global

O `FileSizeValidationInterceptor` é aplicado globalmente e:
- Valida arquivo único (`request.file`)
- Valida múltiplos arquivos (`request.files`)
- Valida arquivos em objetos (`{ desktopImages: [...], mobileImages: [...] }`)
- Lança `BadRequestException` se exceder o limite

### 3. Validação Automática

A validação ocorre **após** o upload pelo Multer, mas **antes** do processamento:
- Arquivo já está em memória
- Validação rápida antes de processar
- Erro claro para o usuário

---

## 📊 Limites Configurados

| Endpoint | Limite | Motivo |
|----------|--------|--------|
| **Products** (imagens desktop/mobile) | 10MB | Imagens de produtos podem ser maiores |
| **Banners** (desktop/mobile) | 5MB | Banners otimizados |
| **Categories** (imagem) | 5MB | Imagens de categorias |
| **Users** (foto perfil) | 2MB | Fotos de perfil devem ser leves |
| **Social Media** (ícones) | 2MB | Ícones devem ser pequenos |
| **Padrão** (se não especificado) | 5MB | Limite seguro padrão |

---

## 🔍 Exemplo de Uso

### Controller com Validação

```typescript
@Controller('products')
export class ProductController {
  @ThrottleUpload()
  @MaxFileSize(undefined, 10) // 10MB por arquivo
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'desktopImages' },
      { name: 'mobileImages' },
    ]),
  )
  async create(
    @Body() dto: CreateProductDTO,
    @UploadedFiles() files: {
      desktopImages?: Express.Multer.File[];
      mobileImages?: Express.Multer.File[];
    },
  ) {
    // Arquivos já validados aqui
    // Se exceder 10MB, BadRequestException é lançado antes
  }
}
```

### Resposta de Erro

Quando um arquivo excede o limite:

```json
{
  "statusCode": 400,
  "message": "Arquivo \"produto.jpg\" excede o tamanho máximo permitido de 10.00MB. Tamanho atual: 15.50MB",
  "timestamp": "2025-01-23T10:30:00.000Z",
  "path": "/api/products"
}
```

---

## ✅ Benefícios

1. **Segurança**: Previne DoS por upload de arquivos grandes
2. **Performance**: Evita consumo excessivo de memória/disco
3. **UX**: Feedback claro sobre limite excedido
4. **Flexibilidade**: Limites configuráveis por endpoint
5. **Automático**: Validação aplicada globalmente sem código extra

---

## 🧪 Testes Recomendados

### Teste 1: Arquivo dentro do limite
```bash
# Upload de arquivo de 2MB (limite: 10MB)
curl -X POST /api/products \
  -F "desktopImages=@small-image.jpg" \
  # ✅ Deve funcionar
```

### Teste 2: Arquivo excede limite
```bash
# Upload de arquivo de 15MB (limite: 10MB)
curl -X POST /api/products \
  -F "desktopImages=@large-image.jpg" \
  # ❌ Deve retornar 400 Bad Request
```

### Teste 3: Múltiplos arquivos
```bash
# Upload de múltiplos arquivos
curl -X POST /api/products \
  -F "desktopImages=@image1.jpg" \
  -F "desktopImages=@image2.jpg" \
  # ✅ Valida cada arquivo individualmente
```

---

## 🔄 Configuração Avançada

### Alterar Limite Padrão

Para alterar o limite padrão (5MB), modifique o interceptor:

```typescript
// src/shared/interceptors/file-size-validation.interceptor.ts
const maxSize = maxFileSize || 10 * 1024 * 1024; // 10MB padrão
```

### Limites por Tipo de Arquivo

Para implementar limites diferentes por tipo de arquivo, você pode:

1. Criar decorators específicos:
```typescript
@MaxFileSizeImage() // 5MB para imagens
@MaxFileSizeDocument() // 10MB para documentos
```

2. Ou validar no interceptor baseado no mimetype:
```typescript
if (file.mimetype.startsWith('image/')) {
  maxSize = 5 * 1024 * 1024;
} else {
  maxSize = 10 * 1024 * 1024;
}
```

---

## 📚 Arquivos Relacionados

- **Decorator**: `src/shared/decorators/max-file-size.decorator.ts`
- **Interceptor**: `src/shared/interceptors/file-size-validation.interceptor.ts`
- **App Module**: `src/app.module.ts`
- **Análise**: `docs/ANALISE_MELHORIAS_SEGURANCA_ESCALABILIDADE.md`
- **Checklist**: `docs/CHECKLIST_IMPLEMENTACAO.md`

---

## 🔄 Próximos Passos

- [x] Implementar decorator `@MaxFileSize()`
- [x] Implementar interceptor de validação
- [x] Aplicar globalmente no AppModule
- [x] Configurar limites nos controllers
- [ ] Criar testes unitários para o interceptor
- [ ] Testar em diferentes cenários de upload
- [ ] Validar performance com múltiplos arquivos

---

**Última atualização**: 2025-01-23

