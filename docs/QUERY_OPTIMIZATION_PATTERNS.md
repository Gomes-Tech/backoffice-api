# 📊 Padrões de Otimização de Queries Prisma

Este documento descreve os padrões e boas práticas para otimizar queries do Prisma no projeto.

---

## 🎯 Princípios Fundamentais

### 1. Sempre use `select` explícito

**❌ Ruim:**
```typescript
const user = await prisma.user.findUnique({
  where: { id },
});
// Retorna TODOS os campos, incluindo password, timestamps, etc.
```

**✅ Bom:**
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    // Apenas os campos necessários
  },
});
```

**Benefícios:**
- Reduz transferência de dados
- Melhora performance
- Evita expor campos sensíveis
- Reduz uso de memória

---

### 2. Evite N+1 Queries

**❌ Ruim (N+1 Query):**
```typescript
const categories = await prisma.category.findMany();
// Para cada categoria, faz uma query separada
for (const category of categories) {
  const parent = await prisma.category.findUnique({
    where: { id: category.parentId },
  });
}
```

**✅ Bom (Query única):**
```typescript
// Busca todas as categorias de uma vez
const categories = await prisma.category.findMany({
  where: { id: { in: parentIds } },
  select: { id: true, name: true },
});

// Cria um mapa para lookup O(1)
const categoryMap = new Map(categories.map(c => [c.id, c]));
```

**✅ Melhor (Usando include quando necessário):**
```typescript
const categories = await prisma.category.findMany({
  include: {
    parent: {
      select: { id: true, name: true },
    },
  },
});
```

---

### 3. Use `include` apenas quando necessário

**❌ Ruim:**
```typescript
// Inclui relacionamentos que não serão usados
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    role: true,
    createdBy: true,
    updatedBy: true,
    // ... muitos outros relacionamentos
  },
});
```

**✅ Bom:**
```typescript
// Inclui apenas o que é necessário
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    role: {
      select: {
        name: true, // Apenas o campo necessário
      },
    },
  },
});
```

---

### 4. Prefira `select` sobre `include` quando possível

**Quando usar `select`:**
- Você precisa de campos específicos
- Quer controle total sobre os campos retornados
- Quer evitar campos desnecessários

**Quando usar `include`:**
- Você precisa de todos os campos do modelo principal + relacionamentos
- O relacionamento é obrigatório e sempre será usado

**Exemplo:**
```typescript
// ✅ Usando select (mais controle)
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    role: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});

// ✅ Usando include (quando precisa de tudo)
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    role: true,
  },
});
```

---

### 5. Use índices para queries frequentes

**Verifique se há índices nos campos usados em:**
- `where`
- `orderBy`
- `groupBy`

**Exemplo:**
```prisma
model User {
  email String @unique
  isActive Boolean
  isDeleted Boolean
  
  @@index([isDeleted, isActive]) // Índice composto
  @@index([email]) // Já existe por ser unique
}
```

---

### 6. Evite queries em loops

**❌ Ruim:**
```typescript
const products = await prisma.product.findMany();
for (const product of products) {
  const category = await prisma.category.findUnique({
    where: { id: product.categoryId },
  });
}
```

**✅ Bom:**
```typescript
const products = await prisma.product.findMany({
  include: {
    category: {
      select: { id: true, name: true },
    },
  },
});
```

---

### 7. Use paginação para listagens grandes

**❌ Ruim:**
```typescript
// Busca TODOS os registros
const users = await prisma.user.findMany();
```

**✅ Bom:**
```typescript
const users = await prisma.user.findMany({
  where: { isDeleted: false },
  take: 20, // Limite
  skip: (page - 1) * 20, // Offset
  orderBy: { createdAt: 'desc' },
});
```

---

### 8. Use `findFirst` com cuidado

**Prefira `findUnique` quando possível:**
```typescript
// ✅ Se o campo é único
const user = await prisma.user.findUnique({
  where: { email },
});

// ✅ Se precisa de condições complexas
const user = await prisma.user.findFirst({
  where: {
    email,
    isActive: true,
    isDeleted: false,
  },
});
```

---

## 🔍 Checklist de Otimização

Ao revisar queries, verifique:

- [ ] Usa `select` explícito?
- [ ] Evita N+1 queries?
- [ ] Usa `include` apenas quando necessário?
- [ ] Campos usados em `where` têm índices?
- [ ] Listagens grandes têm paginação?
- [ ] Não há queries em loops?
- [ ] Usa `findUnique` quando o campo é único?

---

## 📝 Exemplos de Otimização

### Exemplo 1: Query simples otimizada

**Antes:**
```typescript
const user = await prisma.user.findUnique({ where: { id } });
return { name: user.name, email: user.email };
```

**Depois:**
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    name: true,
    email: true,
  },
});
return user;
```

### Exemplo 2: Evitando N+1

**Antes:**
```typescript
const categories = await prisma.category.findMany();
const paths = categories.map(cat => {
  // N+1 query aqui!
  const parent = await prisma.category.findUnique({
    where: { id: cat.parentId },
  });
  return { ...cat, parent };
});
```

**Depois:**
```typescript
const categories = await prisma.category.findMany({
  include: {
    parent: {
      select: { id: true, name: true, slug: true },
    },
  },
});
```

### Exemplo 3: Query com relacionamentos

**Antes:**
```typescript
const product = await prisma.product.findUnique({
  where: { id },
  include: {
    category: true,
    variants: true,
    images: true,
  },
});
```

**Depois:**
```typescript
const product = await prisma.product.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    variants: {
      where: { isActive: true },
      select: {
        id: true,
        price: true,
        stock: true,
      },
    },
  },
});
```

---

## 🚀 Performance Tips

1. **Use `select` para reduzir dados transferidos**
2. **Evite `include` desnecessário**
3. **Use índices em campos frequentemente consultados**
4. **Implemente paginação em listagens**
5. **Monitore queries lentas com Prisma logging**
6. **Use `$queryRaw` apenas quando necessário**

---

## 📚 Referências

- [Prisma Select](https://www.prisma.io/docs/concepts/components/prisma-client/select-fields)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [N+1 Problem](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

