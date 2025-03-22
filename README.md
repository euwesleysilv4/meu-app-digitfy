# DigitFy - Plataforma de Marketing Digital

## Configuração do Supabase

### Pré-requisitos
- Conta no [Supabase](https://supabase.com)
- Node.js e npm instalados

### Passos para configuração

1. **Criar um projeto no Supabase**
   - Acesse [app.supabase.com](https://app.supabase.com) e faça login
   - Clique em "New Project"
   - Preencha os detalhes do projeto e crie-o

2. **Obter as credenciais do projeto**
   - No painel do projeto, vá para Settings > API
   - Copie a URL e a anon key (chave pública)

3. **Configurar as variáveis de ambiente**
   - Crie um arquivo `.env` na raiz do projeto (ou edite o existente)
   - Adicione as seguintes variáveis:
     ```
     VITE_SUPABASE_URL=sua-url-do-supabase
     VITE_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
     ```

4. **Executar o script SQL para criar a tabela de perfis**
   - No painel do Supabase, vá para SQL Editor
   - Cole o conteúdo do arquivo `supabase/migrations/create_profiles_table.sql`
   - Execute o script

5. **Configurar autenticação**
   - No painel do Supabase, vá para Authentication > Settings
   - Habilite "Email" como provedor de autenticação
   - Configure o redirecionamento para sua aplicação (opcional)
   - Personalize os templates de e-mail (opcional)

### Estrutura da tabela de perfis

A tabela `profiles` contém os seguintes campos:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Chave primária, referencia auth.users(id) |
| nome | TEXT | Nome completo do usuário |
| email | TEXT | E-mail do usuário (único) |
| avatar_url | TEXT | URL da imagem de perfil (opcional) |
| data_criacao | TIMESTAMP | Data de criação do perfil |
| data_modificacao | TIMESTAMP | Data da última modificação |
| status | ENUM | Status do usuário ('online' ou 'offline') |
| plano | ENUM | Plano do usuário ('gratuito', 'member', 'pro', 'elite') |
| ultimo_login | TIMESTAMP | Data do último login |
| verificado | BOOLEAN | Indica se o e-mail foi verificado |
| role | ENUM | Nível de acesso ('user', 'admin', 'moderator') |
| tentativas_login | INTEGER | Contador de tentativas de login falhas |
| banido | BOOLEAN | Indica se o usuário está banido |
| notificacoes_ativas | BOOLEAN | Preferência de notificações |
| whatsapp | TEXT | Número de WhatsApp (opcional) |

### Segurança

O script SQL configura Row Level Security (RLS) para garantir que:
- Usuários só podem ver e editar seus próprios perfis
- Administradores podem ver e editar todos os perfis

### Automação

O script também configura:
- Atualização automática do campo `data_modificacao` quando o perfil é atualizado
- Criação automática de um perfil quando um novo usuário se registra

## Executando o projeto

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

## Recursos adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentação do Supabase Database](https://supabase.com/docs/guides/database) 