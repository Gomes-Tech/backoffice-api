# ✅ Implementação: Proteção Contra Timing Attacks

**Data**: 2025-01-23  
**Status**: ✅ Implementado  
**Prioridade**: 🟡 ALTO

---

## 📋 Resumo

Implementada proteção contra timing attacks usando comparação segura (`crypto.timingSafeEqual`) em comparações de strings sensíveis como API keys, tokens e credenciais.

---

## 🎯 Objetivo

Prevenir vazamento de informações através de diferenças de tempo de resposta em comparações de strings sensíveis:
- API keys
- Tokens de autenticação
- Secrets e credenciais
- Outras strings sensíveis

---

## 🔧 Implementação

### Arquivos Criados

1. **`src/shared/utils/crypto.util.ts`**
   - Função `secureCompare()` que usa `crypto.timingSafeEqual`

### Arquivos Modificados

1. **`src/shared/utils/index.ts`**
   - Export da função `secureCompare`

2. **`src/interfaces/http/guards/auth-server.guard.ts`**
   - Substituída comparação `!==` por `secureCompare()` para API keys

---

## 📝 Como Funciona

### Timing Attack

Um **timing attack** é um tipo de ataque onde um adversário tenta inferir informações secretas medindo quanto tempo leva para executar operações.

**Exemplo vulnerável:**
```typescript
// ❌ VULNERÁVEL
if (apiKey !== serverApiKey) {
  throw new UnauthorizedException();
}
```

**Problema**: Se as strings diferem no primeiro caractere, a comparação retorna `false` rapidamente. Se diferem no último caractere, leva mais tempo. Um atacante pode medir essas diferenças para descobrir a API key caractere por caractere.

### Solução: `secureCompare()`

```typescript
// ✅ SEGURO
if (!secureCompare(apiKey, serverApiKey)) {
  throw new UnauthorizedException();
}
```

**Como funciona**:
1. Usa `crypto.timingSafeEqual()` do Node.js
2. Sempre executa em **tempo constante** para strings do mesmo tamanho
3. Compara byte-a-byte usando Buffer
4. Não revela onde a diferença ocorre

---

## 🔍 Detalhes Técnicos

### Função `secureCompare()`

```typescript
export function secureCompare(a: string, b: string): boolean {
  // Validação inicial
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  // Conversão para Buffer
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');

  // Comparação segura em tempo constante
  try {
    return timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
}
```

### Características

1. **Tempo Constante**: Sempre leva o mesmo tempo para strings do mesmo tamanho
2. **Byte-a-Byte**: Compara cada byte, não retorna cedo
3. **Seguro**: Não revela informações sobre onde a diferença ocorre
4. **Robusto**: Trata erros graciosamente

---

## 📊 Onde Foi Aplicado

### 1. AuthServerGuard - Comparação de API Key

**Antes:**
```typescript
if (!apiKey || apiKey !== serverApiKey) {
  throw new UnauthorizedException('Authentication required');
}
```

**Depois:**
```typescript
if (!apiKey || !serverApiKey || !secureCompare(apiKey, serverApiKey)) {
  throw new UnauthorizedException('Authentication required');
}
```

### 2. Senhas (já protegidas)

As comparações de senha usam `bcrypt.compare()`, que **já é seguro** contra timing attacks:
- ✅ `SignInUserUseCase` - usa `cryptographyService.compare()` (bcrypt)
- ✅ `SignInCustomerUseCase` - usa `cryptographyService.compare()` (bcrypt)
- ✅ `VerifyTokenPasswordUseCase` - usa `cryptographyService.compare()` (bcrypt)

**Nota**: `bcrypt.compare()` já implementa proteção contra timing attacks internamente.

---

## ✅ Benefícios

1. **Segurança**: Previne vazamento de informações através de timing
2. **Conformidade**: Segue melhores práticas de segurança
3. **Robustez**: Proteção adicional em camadas críticas
4. **Simplicidade**: Função reutilizável e fácil de usar

---

## 🧪 Testes Recomendados

### Teste 1: Comparação de Strings Iguais
```typescript
const result = secureCompare('test123', 'test123');
expect(result).toBe(true);
```

### Teste 2: Comparação de Strings Diferentes
```typescript
const result = secureCompare('test123', 'test456');
expect(result).toBe(false);
```

### Teste 3: Comparação com Tamanhos Diferentes
```typescript
const result = secureCompare('short', 'verylongstring');
expect(result).toBe(false);
```

### Teste 4: Comparação com Strings Vazias
```typescript
const result1 = secureCompare('', 'test');
const result2 = secureCompare('test', '');
expect(result1).toBe(false);
expect(result2).toBe(false);
```

### Teste 5: Timing Attack (Verificar Tempo Constante)
```typescript
// Medir tempo de execução para diferentes posições de diferença
const start1 = Date.now();
secureCompare('abc', 'abd'); // Difere no último caractere
const time1 = Date.now() - start1;

const start2 = Date.now();
secureCompare('abc', 'xbc'); // Difere no primeiro caractere
const time2 = Date.now() - start2;

// Os tempos devem ser similares (dentro de uma margem de erro)
expect(Math.abs(time1 - time2)).toBeLessThan(10); // 10ms de tolerância
```

---

## 🔄 Quando Usar `secureCompare()`

### ✅ Use `secureCompare()` para:
- Comparação de API keys
- Comparação de tokens de autenticação
- Comparação de secrets e credenciais
- Comparação de qualquer string sensível

### ❌ NÃO use `secureCompare()` para:
- Comparação de senhas (use `bcrypt.compare()` que já é seguro)
- Comparação de strings não sensíveis (use `===` normal)
- Comparação de hashes já seguros (HMAC, etc.)

---

## 📚 Arquivos Relacionados

- **Implementação**: `src/shared/utils/crypto.util.ts`
- **Uso**: `src/interfaces/http/guards/auth-server.guard.ts`
- **Análise**: `docs/ANALISE_MELHORIAS_SEGURANCA_ESCALABILIDADE.md`
- **Checklist**: `docs/CHECKLIST_IMPLEMENTACAO.md`

---

## 🔄 Próximos Passos

- [x] Criar função `secureCompare()`
- [x] Aplicar em `AuthServerGuard`
- [ ] Verificar outros lugares que precisam de proteção
- [ ] Criar testes unitários
- [ ] Documentar uso em outros guards se necessário

---

## 📖 Referências

- [Node.js crypto.timingSafeEqual()](https://nodejs.org/api/crypto.html#crypto_crypto_timingsafeequal_a_b)
- [OWASP - Timing Attack](https://owasp.org/www-community/attacks/Timing_attack)
- [Timing Attacks Explained](https://www.synopsys.com/blogs/software-security/timing-attacks/)

---

**Última atualização**: 2025-01-23

