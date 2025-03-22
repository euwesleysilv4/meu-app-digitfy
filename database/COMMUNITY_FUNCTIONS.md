# Funções RPC para a Página de Comunidade

Este documento explica as funções RPC seguras implementadas para a página de comunidade da DigitFy, que permitem exibir dados de usuários de forma segura, sem expor informações sensíveis.

## Funções Implementadas

### 1. `get_total_user_count()`

Esta função retorna o número total de usuários cadastrados na plataforma.

**Características:**
- Segura - não expõe nenhum dado sensível
- Pode ser acessada por usuários anônimos e autenticados
- Implementada com SECURITY DEFINER para garantir acesso seguro

**Exemplo de uso:**
```typescript
const { data, error } = await supabase.rpc('get_total_user_count');
if (!error) {
  console.log(`Total de usuários: ${data}`);
}
```

### 2. `get_public_profiles(limit_count INTEGER)`

Esta função retorna uma lista de perfis públicos para exibição na página de comunidade, limitando-se apenas a campos não sensíveis.

**Parâmetros:**
- `limit_count`: Número máximo de perfis a retornar (padrão: 20)

**Campos retornados:**
- `id`: ID do usuário
- `nome`: Nome do usuário
- `avatar_url`: URL da imagem de perfil (se disponível)
- `data_criacao`: Data de criação da conta
- `plano`: Plano do usuário
- `role`: Papel do usuário (user, admin, etc.)

**Características:**
- Segura - retorna apenas dados não sensíveis
- Filtrada - não retorna usuários banidos
- Ordenada - retorna usuários por último login

**Exemplo de uso:**
```typescript
const { data, error } = await supabase.rpc('get_public_profiles', { 
  limit_count: 10 
});
if (!error && data) {
  // Exibir membros da comunidade
  console.log(`Obtidos ${data.length} perfis públicos`);
}
```

## Implementação no Supabase

Para implementar estas funções, siga os passos abaixo:

1. Acesse o painel do Supabase para seu projeto
2. Navegue até a seção "SQL Editor"
3. Crie uma nova consulta
4. Cole o conteúdo do arquivo `database/sql/community_functions.sql`
5. Execute a consulta

Alternativamente, você pode executar o arquivo SQL durante a migração do Supabase:

```bash
npx supabase migration up
```

## Segurança

Estas funções foram implementadas seguindo as melhores práticas de segurança:

1. **SECURITY DEFINER**: As funções são executadas com os privilégios do criador, garantindo acesso consistente aos dados
2. **SET search_path = public**: Evita ataques de pesquisa por caminho
3. **Exposição limitada**: Apenas campos não sensíveis são expostos
4. **Filtragem**: Usuários banidos são automaticamente excluídos dos resultados

## Solução de Problemas

Se as funções RPC não estiverem funcionando como esperado, verifique:

1. Se as funções existem no banco de dados:
```sql
SELECT * FROM pg_proc WHERE proname IN ('get_total_user_count', 'get_public_profiles');
```

2. Se as permissões foram concedidas:
```sql
SELECT * FROM pg_proc p JOIN pg_roles r ON p.proowner = r.oid 
WHERE proname IN ('get_total_user_count', 'get_public_profiles');
```

3. Se o código da aplicação está usando as funções corretamente.

## Notas Importantes

- Estas funções são projetadas para serem seguras para uso público e não expõem dados sensíveis
- Para desenvolvimento local, é possível usar métodos alternativos de acesso se as funções RPC não estiverem disponíveis
- A interface da página permanecerá funcional mesmo sem acesso ao banco de dados, usando dados de exemplo 