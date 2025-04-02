import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, GitBranch, Bell, Globe, Image, Link as LinkIcon, PenTool, Hash, 
  Smile, User, Gamepad, Music, BookOpen, ShoppingCart, Wrench, Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import Tools from '../../../pages/Tools';

// Interface da ferramenta
interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  image_url: string;
  status: 'published' | 'draft' | 'scheduled';
  is_free: boolean;
  is_online: boolean;
  last_updated: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  priority: number;
}

// Mapeamento dos ícones do Lucide React
const iconMap: { [key: string]: React.ElementType } = {
  Scale: Scale,
  GitBranch: GitBranch,
  Bell: Bell,
  Globe: Globe,
  Image: Image,
  LinkIcon: LinkIcon,
  PenTool: PenTool,
  Hash: Hash,
  Smile: Smile,
  User: User,
  Gamepad: Gamepad,
  Music: Music,
  BookOpen: BookOpen,
  ShoppingCart: ShoppingCart,
  Wrench: Wrench,
  Sparkles: Sparkles
  // Adicione outros ícones aqui conforme necessário
};

// Função para obter classes CSS com base na cor da ferramenta
const getColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string, text: string, hover: string, border: string }> = {
    emerald: { 
      bg: 'bg-emerald-500', 
      text: 'text-emerald-600',
      hover: 'group-hover:text-emerald-700',
      border: 'border-emerald-100'
    },
    blue: { 
      bg: 'bg-blue-500', 
      text: 'text-blue-600',
      hover: 'group-hover:text-blue-700',
      border: 'border-blue-100'
    },
    violet: { 
      bg: 'bg-violet-500', 
      text: 'text-violet-600',
      hover: 'group-hover:text-violet-700',
      border: 'border-violet-100'
    },
    amber: { 
      bg: 'bg-amber-500', 
      text: 'text-amber-600',
      hover: 'group-hover:text-amber-700',
      border: 'border-amber-100'
    },
    rose: { 
      bg: 'bg-rose-500', 
      text: 'text-rose-600',
      hover: 'group-hover:text-rose-700',
      border: 'border-rose-100'
    },
    cyan: { 
      bg: 'bg-cyan-500', 
      text: 'text-cyan-600',
      hover: 'group-hover:text-cyan-700',
      border: 'border-cyan-100'
    },
    indigo: { 
      bg: 'bg-indigo-500', 
      text: 'text-indigo-600',
      hover: 'group-hover:text-indigo-700',
      border: 'border-indigo-100'
    },
    purple: { 
      bg: 'bg-purple-500', 
      text: 'text-purple-600',
      hover: 'group-hover:text-purple-700',
      border: 'border-purple-100'
    },
    teal: { 
      bg: 'bg-teal-500', 
      text: 'text-teal-600',
      hover: 'group-hover:text-teal-700',
      border: 'border-teal-100'
    },
  };
  
  return colorMap[color] || colorMap.emerald;
};

const DashboardTools = () => {
  return (
    <div className="dashboard-tools-wrapper">
      <Tools />
    </div>
  );
};

export default DashboardTools; 