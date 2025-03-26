// Este arquivo serve apenas como um proxy para o módulo supabase principal
// para evitar ciclos de dependência e separar preocupações

import { supabase } from './supabase';

export { supabase }; 