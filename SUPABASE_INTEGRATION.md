# Integração do Supabase na Plataforma DigitFy

## Visão Geral

Implementamos a integração do Supabase como back-end para a plataforma DigitFy, fornecendo:
- Autenticação de usuários com e-mail e senha
- Armazenamento de perfis de usuários
- Gerenciamento de sessões
- Segurança baseada em Row Level Security (RLS)

## Arquivos Criados/Modificados

1. **Configuração do Supabase**
   - `src/lib/supabase.ts`: Cliente do Supabase e funções de autenticação/perfil
   - `.env`: Variáveis de ambiente para URL e chave do Supabase
   - `supabase/migrations/create_profiles_table.sql`: Script SQL para criar a tabela de perfis

2. **Contexto de Autenticação**
   - `src/contexts/AuthContext.tsx`: Provedor de contexto para gerenciar o estado de autenticação

3. **Componentes de Autenticação**
   - `src/pages/auth/Auth.tsx`: Página de login/registro
   - `src/pages/auth/ResetPassword.tsx`: Página de recuperação de senha

4. **Integração na Aplicação**
   - `src/App.tsx`: Rotas protegidas e navegação
   - `src/main.tsx`: Inclusão do AuthProvider
   - `src/components/Navbar.tsx`: Menu de usuário e logout

5. **Documentação**
   - `README.md`: Instruções para configuração do Supabase
   - `SUPABASE_INTEGRATION.md`: Este documento

## Estrutura da Tabela de Perfis

A tabela `profiles` contém os seguintes campos:
- `id`: UUID (referência a auth.users)
- `nome`: Nome completo do usuário
- `email`: E-mail do usuário
- `avatar_url`: URL da imagem de perfil (opcional)
- `data_criacao`: Data de criação
- `data_modificacao`: Data da última modificação
- `status`: Status do usuário ('online' ou 'offline')
- `plano`: Plano do usuário ('gratuito', 'member', 'pro', 'elite')
- `ultimo_login`: Data do último login
- `verificado`: Indica se o e-mail foi verificado
- `role`: Nível de acesso ('user', 'admin', 'moderator')
- `tentativas_login`: Contador de tentativas de login falhas
- `banido`: Indica se o usuário está banido
- `notificacoes_ativas`: Preferência de notificações
- `whatsapp`: Número de WhatsApp (opcional)

## Funcionalidades Implementadas

### Autenticação
- Registro de usuários com e-mail e senha
- Login com e-mail e senha
- Recuperação de senha
- Logout
- Proteção de rotas

### Perfil de Usuário
- Criação automática de perfil ao registrar
- Atualização de perfil
- Upload de avatar
- Gerenciamento de status online/offline

### Segurança
- Row Level Security (RLS) para proteger dados
- Políticas de acesso baseadas em função
- Contagem de tentativas de login falhas

## Próximos Passos

1. **Configurar o Projeto no Supabase**
   - Criar um projeto no [app.supabase.com](https://app.supabase.com)
   - Executar o script SQL para criar a tabela de perfis
   - Configurar a autenticação por e-mail

2. **Configurar as Variáveis de Ambiente**
   - Adicionar URL e chave do Supabase ao arquivo `.env`

3. **Testar a Integração**
   - Testar o registro de usuários
   - Testar o login
   - Testar a recuperação de senha
   - Testar a proteção de rotas

4. **Implementar Funcionalidades Adicionais**
   - Verificação de e-mail
   - Autenticação com provedores sociais (Google, Facebook, etc.)
   - Gerenciamento de planos e assinaturas 