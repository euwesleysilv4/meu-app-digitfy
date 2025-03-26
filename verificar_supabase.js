// Script para verificar a conexão com o Supabase
// Execute com: node verificar_supabase.js
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Configurar dotenv
dotenv.config();

// Obter as credenciais do ambiente ou usar valores padrão
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Se não encontrar no .env, tentar ler do arquivo .env.local
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    console.log("Tentando ler as variáveis do arquivo .env.local...");
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
      const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
      
      if (urlMatch && urlMatch[1]) supabaseUrl = urlMatch[1];
      if (keyMatch && keyMatch[1]) supabaseAnonKey = keyMatch[1];
    }
  } catch (error) {
    console.error("Erro ao tentar ler .env.local:", error.message);
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro: Variáveis de ambiente para Supabase não encontradas!');
  console.error('Verifique se o arquivo .env ou .env.local está configurado corretamente.');
  console.error('Exemplo de configuração:');
  console.error('VITE_SUPABASE_URL=https://seuprojetoid.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=sua-chave-anon-key');
  process.exit(1);
}

console.log('Credenciais do Supabase:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey.substring(0, 10) + '...');

// Criar o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarConexao() {
  console.log('\nVerificando conexão com o Supabase...');
  
  try {
    // Teste de ping básico
    const { data, error } = await supabase.from('_dummy_query_').select('*').limit(1).catch(() => ({
      data: null,
      error: { message: "Erro de conexão básica - ignorar este erro específico" }
    }));
    
    // Verificar tabela de top_afiliados
    console.log('\nVerificando tabela top_afiliados...');
    const { data: tabela, error: tabelaError } = await supabase
      .from('top_afiliados')
      .select('id, nome, instagram')
      .limit(5);
    
    if (tabelaError) {
      console.error('Erro ao consultar tabela top_afiliados:', tabelaError.message);
      console.error('A tabela pode não existir ou você não tem permissões para acessá-la.');
      console.error('Execute o script SQL para criar a tabela e seus registros.');
    } else {
      console.log('Tabela top_afiliados encontrada!');
      console.log(`Foram encontrados ${tabela.length} registros:`);
      
      if (tabela.length > 0) {
        tabela.forEach((afiliado, index) => {
          console.log(`${index + 1}. ${afiliado.nome} (${afiliado.instagram})`);
        });
      } else {
        console.log('Nenhum registro encontrado na tabela. Execute o script SQL para inserir os dados.');
      }
    }
    
    // Verificar função RPC list_top_afiliados
    console.log('\nVerificando função RPC list_top_afiliados...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('list_top_afiliados');
    
    if (rpcError) {
      console.error('Erro ao chamar a função RPC list_top_afiliados:', rpcError.message);
      console.error('A função pode não existir ou você não tem permissões para executá-la.');
      console.error('Execute o script SQL para criar a função.');
    } else {
      console.log('Função RPC list_top_afiliados encontrada e executada com sucesso!');
      console.log(`Retornou ${rpcData.length} afiliados.`);
    }
    
  } catch (error) {
    console.error('Erro ao verificar conexão:', error.message);
    console.error('Verifique se o projeto Supabase está ativo e acessível.');
  }
}

verificarConexao(); 