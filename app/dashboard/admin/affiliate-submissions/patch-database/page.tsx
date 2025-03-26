import React from 'react';
import ExecuteMigration from '../execute-migration';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executar Migração da Tabela de Submissões | DigitalFy',
  description: 'Ferramenta para criar e corrigir a tabela de submissões de afiliados'
};

export default function PatchDatabasePage() {
  return <ExecuteMigration />;
} 