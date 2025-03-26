import React from 'react';
import AffiliateSubmissionsAdmin from './AffiliateSubmissionsAdmin';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestão de Submissões de Afiliados | DigitalFy',
  description: 'Aprove ou rejeite submissões de produtos enviadas pelos afiliados'
};

export default function AffiliateSubmissionsPage() {
  return <AffiliateSubmissionsAdmin />;
} 