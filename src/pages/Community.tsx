import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageCircle, TrendingUp, UserPlus, Zap, Crown, Star, Medal, Badge } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { PublicUserProfile } from '../lib/supabase';

interface UserStatus {
  type: 'joined' | 'subscription' | 'invite' | 'article' | 'achievement' | 'active';
  message: string;
  timestamp?: number;
}

interface Member {
  id: number;
  name: string;
  role: string;
  avatar: string;
  achievement: string;
  status: UserStatus;
}

const Community = () => {
  const [visibleMembers, setVisibleMembers] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [animatingIndexes, setAnimatingIndexes] = useState<number[]>([]);
  const [showNotification, setShowNotification] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [realUsers, setRealUsers] = useState<PublicUserProfile[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // Lista expandida de membros com status
  const mockMembers: Member[] = [
    {
      id: 1,
      name: "André Victor",
      role: "Plano Member",
      avatar: "https://i.pravatar.cc/150?img=1",
      achievement: "Marketing Digital",
      status: {
        type: 'joined',
        message: 'Chegou hoje na DigitFy',
        timestamp: Date.now() - 1000 * 60 * 30 // 30 minutos atrás
      }
    },
    {
      id: 2,
      name: "Thomas Macedo",
      role: "Plano Pro",
      avatar: "https://i.pravatar.cc/150?img=2",
      achievement: "Copywriter",
      status: {
        type: 'subscription',
        message: 'Assinou o Plano Member',
        timestamp: Date.now() - 1000 * 60 * 15 // 15 minutos atrás
      }
    },
    {
      id: 3,
      name: "Maria Silva",
      role: "Plano Gratuito",
      avatar: "https://i.pravatar.cc/150?img=3",
      achievement: "Social Media",
      status: {
        type: 'invite',
        message: 'Convidou 3 amigos',
      }
    },
    {
      id: 4,
      name: "João Santos",
      role: "Plano Member",
      avatar: "https://i.pravatar.cc/150?img=4",
      achievement: "SEO Specialist",
      status: {
        type: 'article',
        message: 'Publicou um artigo sobre SEO',
      }
    },
    {
      id: 5,
      name: "Ana Costa",
      role: "Plano Elite",
      avatar: "https://i.pravatar.cc/150?img=5",
      achievement: "Content Creator",
      status: {
        type: 'achievement',
        message: 'Completou 5 cursos',
      }
    },
    {
      id: 6,
      name: "Pedro Oliveira",
      role: "Plano Member",
      avatar: "https://i.pravatar.cc/150?img=6",
      achievement: "PPC Manager",
      status: {
        type: 'active',
        message: 'Ativo na comunidade',
      }
    },
    {
      id: 7,
      name: "Carla Souza",
      role: "Plano Gratuito",
      avatar: "https://i.pravatar.cc/150?img=7",
      achievement: "Email Marketing",
      status: {
        type: 'active',
        message: 'Ativo na comunidade',
      }
    },
    {
      id: 8,
      name: "Lucas Mendes",
      role: "Plano Pro",
      avatar: "https://i.pravatar.cc/150?img=8",
      achievement: "Growth Hacker",
      status: {
        type: 'active',
        message: 'Ativo na comunidade',
      }
    },
    {
      id: 9,
      name: "Beatriz Lima",
      role: "Plano Elite",
      avatar: "https://i.pravatar.cc/150?img=9",
      achievement: "Digital Strategist",
      status: {
        type: 'active',
        message: 'Ativo na comunidade',
      }
    },
    {
      id: 10,
      name: "Rafael Costa",
      role: "Plano Member",
      avatar: "https://i.pravatar.cc/150?img=10",
      achievement: "UX Designer",
      status: {
        type: 'active',
        message: 'Ativo na comunidade',
      }
    },
    {
      id: 11,
      name: "Amanda Santos",
      role: "Plano Pro",
      avatar: "https://i.pravatar.cc/150?img=11",
      achievement: "Performance Marketing",
      status: {
        type: 'active',
        message: 'Ativo na comunidade',
      }
    },
    {
      id: 12,
      name: "Bruno Oliveira",
      role: "Plano Gratuito",
      avatar: "https://i.pravatar.cc/150?img=12",
      achievement: "Data Analytics",
      status: {
        type: 'active',
        message: 'Ativo na comunidade',
      }
    },
  ];

  // Função para gerar status aleatório para novos usuários
  const generateRandomStatus = (timestamp?: string): UserStatus => {
    const statusTypes: UserStatus['type'][] = ['active', 'joined', 'subscription', 'invite', 'article', 'achievement'];
    const randomType = statusTypes[Math.floor(Math.random() * statusTypes.length)];
    
    const messages = {
      active: 'Ativo na comunidade',
      joined: 'Chegou hoje na DigitFy',
      subscription: 'Assinou o Plano Member',
      invite: 'Convidou amigos',
      article: 'Publicou um artigo',
      achievement: 'Completou um curso'
    };
    
    return {
      type: randomType,
      message: messages[randomType],
      timestamp: timestamp ? new Date(timestamp).getTime() : undefined
    };
  };

  // Função para formatar o nome (exibir apenas nome e sobrenome)
  const formatName = (fullName: string): string => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length <= 2) return fullName;
    return `${nameParts[0]} ${nameParts[1]}`;
  };

  // Converter perfis do Supabase para o formato Member
  const convertProfileToMember = (profile: PublicUserProfile, index: number): Member => {
    const formatPlanName = (planName: string): string => {
      return planName.charAt(0).toUpperCase() + planName.slice(1);
    };
    
    return {
      id: index + 1,
      name: formatName(profile.nome || 'Usuário'),
      role: profile.plano === 'gratuito' ? 'Plano Gratuito' : `Plano ${formatPlanName(profile.plano)}`,
      avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nome || 'User')}&background=0D9488&color=fff`,
      achievement: profile.role === 'admin' ? 'Administrador' : 'Membro',
      status: generateRandomStatus(profile.data_criacao)
    };
  };

  // Combinar membros reais com mockups para ter sempre 12 membros
  const getAllMembers = (): Member[] => {
    // Converter usuários reais para o formato Member
    const realMembers: Member[] = realUsers.map(convertProfileToMember);
    
    // Se tivermos 12 ou mais usuários reais, usar apenas eles
    if (realMembers.length >= 12) {
      return realMembers.slice(0, 12);
    }
    
    // Caso contrário, complementar com os membros simulados
    return [...realMembers, ...mockMembers.slice(0, 12 - realMembers.length)];
  };

  // Variável para todos os membros (reais + simulados se necessário)
  const allMembers = getAllMembers();

  // Função para gerar posições aleatórias em padrão xadrez
  const generateChessPattern = () => {
    const positions = Array.from({ length: 10 }, (_, i) => i);
    const pattern: number[] = [];
    
    // Divide em grupos para animação mais orgânica
    const groups = [
      positions.filter((_, i) => i % 4 === 0),
      positions.filter((_, i) => i % 4 === 1),
      positions.filter((_, i) => i % 4 === 2),
      positions.filter((_, i) => i % 4 === 3),
    ];
    
    // Embaralha cada grupo
    groups.forEach(group => {
      for (let i = group.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [group[i], group[j]] = [group[j], group[i]];
      }
      pattern.push(...group);
    });

    return pattern;
  };

  // Efeito para animação fluida
  useEffect(() => {
    const interval = setInterval(() => {
      const pattern = generateChessPattern();
      
      pattern.forEach((position, index) => {
        setTimeout(() => {
          setAnimatingIndexes(prev => [...prev, position]);
          
          setTimeout(() => {
            setVisibleMembers(prev => {
              const newMembers = [...prev];
              newMembers[position] = (newMembers[position] + 10) % allMembers.length;
              return newMembers;
            });
            
            setTimeout(() => {
              setAnimatingIndexes(prev => prev.filter(i => i !== position));
            }, 500); // Duração mais longa para saída suave
          }, 400); // Tempo para troca do membro
        }, index * 150); // Delay maior entre cada posição
      });
      
    }, 5000); // Intervalo maior entre ciclos

    return () => clearInterval(interval);
  }, []);

  // Função para buscar o número de usuários do Supabase
  const fetchUserCount = async () => {
    try {
      setUsersLoading(true);
      
      // Usar RPC para obter a contagem total de usuários (sem acesso aos dados)
      const { data, error } = await supabase.rpc('get_total_user_count');
      
      if (error) {
        console.error('Erro ao buscar contagem de usuários via RPC:', error);
        
        // Fallback: tentar buscar contagem diretamente (apenas para desenvolvimento)
        console.log('Tentando método alternativo para obter contagem...');
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.error('Também falhou o método alternativo:', countError);
        } else if (count !== null) {
          console.log('Contagem obtida via método alternativo:', count);
          setUserCount(count);
        }
      } else if (data !== null) {
        console.log('Contagem de usuários obtida via RPC:', data);
        setUserCount(data);
      }
    } catch (err) {
      console.error('Erro ao buscar contagem de usuários:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Função para buscar perfis de usuários reais
  const fetchUserProfiles = async () => {
    try {
      setMembersLoading(true);
      
      // Buscar alguns perfis aleatórios para exibir usando a função RPC
      const { data, error } = await supabase.rpc('get_public_profiles', { limit_count: 20 });
      
      if (error) {
        console.error('Erro ao buscar perfis de usuários via RPC:', error);
        
        // Fallback: tentar buscar diretamente (apenas para desenvolvimento)
        console.log('Tentando método alternativo para obter perfis...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('id, nome, avatar_url, data_criacao, plano, role')
          .order('ultimo_login', { ascending: false })
          .limit(20);
        
        if (fallbackError) {
          console.error('Também falhou o método alternativo para perfis:', fallbackError);
        } else if (fallbackData) {
          console.log('Perfis obtidos via método alternativo:', fallbackData.length);
          // Embaralhar os usuários
          const shuffled = [...fallbackData].sort(() => 0.5 - Math.random());
          setRealUsers(shuffled.slice(0, 12));
        }
      } else if (data) {
        console.log('Perfis obtidos via RPC:', data.length);
        // Embaralhar os usuários para ter uma exibição aleatória
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setRealUsers(shuffled.slice(0, 12));
      }
    } catch (err) {
      console.error('Erro ao buscar perfis de usuários:', err);
    } finally {
      setMembersLoading(false);
    }
  };

  // Buscar dados ao montar o componente
  useEffect(() => {
    fetchUserCount();
    fetchUserProfiles();
  }, []);

  // Formatar número com separador de milhar
  const formatNumber = (num: number): string => {
    return num.toLocaleString('pt-BR');
  };

  // Função para obter o ícone correto com base no plano
  const getPlanIcon = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'gratuito':
        return <Badge className="w-3 h-3 text-emerald-500" />;
      case 'member':
        return <Medal className="w-3 h-3 text-emerald-500" />;
      case 'pro':
        return <Star className="w-3 h-3 text-emerald-500" />;
      case 'elite':
        return <Crown className="w-3 h-3 text-emerald-500" />;
      default:
        return <Badge className="w-3 h-3 text-emerald-500" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section Modernizada */}
      <div className="relative overflow-hidden pt-20 pb-40">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent"></div>
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-emerald-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-100/30 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Users className="h-5 w-5 text-emerald-600" />
              <span className="text-emerald-600 text-sm font-medium">Comunidade DigitFy</span>
            </motion.div>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent mb-6">
              Faça Parte do Nosso Crescimento
            </h1>
            <p className="text-lg text-gray-600 mb-12">
              Juntos estamos transformando o mercado digital. Cada membro da DigitFy contribui para uma comunidade mais forte e inovadora.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Seção de Notificações de Novos Membros */}
      <div className="container mx-auto px-4 -mt-32 relative z-20 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Novos Membros</h2>
                <p className="text-sm text-gray-500">Acompanhe quem está chegando</p>
              </div>
            </div>

            {/* Contador de usuários - Versão mais larga */}
            <motion.div 
              className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 min-w-[300px]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <Users className="h-6 w-6 text-emerald-600" />
                  {/* Indicador de "ao vivo" */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {usersLoading ? (
                      <div className="text-2xl font-bold text-emerald-600 animate-pulse">...</div>
                    ) : (
                      <span className="text-2xl font-bold text-emerald-600">{formatNumber(userCount)}</span>
                    )}
                    <span className="text-xs text-emerald-600/80 bg-emerald-100/50 px-2 py-0.5 rounded-full">
                      Em Tempo Real
                    </span>
                  </div>
                  <span className="text-sm text-emerald-600/80">Usuários na DigitFy</span>
                </div>
              </div>
              <motion.div 
                className="flex items-center gap-1 bg-emerald-600/10 px-2.5 py-1 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">+15%</span>
              </motion.div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {visibleMembers.map((memberIndex, position) => (
              <motion.div
                key={`${position}-${memberIndex}`}
                className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 shadow-lg shadow-emerald-50/20 hover:shadow-emerald-50/40 transition-all duration-500"
                animate={{
                  opacity: animatingIndexes.includes(position) ? 0 : 1,
                  scale: animatingIndexes.includes(position) ? 0.98 : 1,
                  y: animatingIndexes.includes(position) ? 10 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  mass: 0.8
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <motion.div 
                      className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-emerald-500/20 ring-offset-2"
                      animate={{
                        rotateY: animatingIndexes.includes(position) ? 180 : 0,
                        scale: animatingIndexes.includes(position) ? 0.9 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 12,
                        mass: 0.8
                      }}
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          opacity: animatingIndexes.includes(position) ? 0 : 1,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: "easeInOut"
                        }}
                      >
                        <img
                          src={allMembers[memberIndex].avatar}
                          alt={allMembers[memberIndex].name}
                          className="w-full h-full object-cover transform transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(allMembers[memberIndex].name)}&background=0D9488&color=fff`;
                          }}
                        />
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"
                      animate={{
                        scale: animatingIndexes.includes(position) ? 0 : 1,
                        opacity: animatingIndexes.includes(position) ? 0 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        mass: 0.8
                      }}
                    />
                  </div>
                  <motion.div 
                    className="space-y-1"
                    animate={{
                      opacity: animatingIndexes.includes(position) ? 0 : 1,
                      y: animatingIndexes.includes(position) ? 5 : 0,
                      scale: animatingIndexes.includes(position) ? 0.95 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      mass: 0.8,
                      delay: 0.1
                    }}
                  >
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                      {formatName(allMembers[memberIndex].name)}
                    </h3>
                    <p className="text-emerald-600 text-xs font-medium line-clamp-1 flex items-center justify-center gap-1">
                      {getPlanIcon(allMembers[memberIndex].role.replace('Plano ', ''))}
                      {allMembers[memberIndex].role}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Estilos Globais */}
      <style>
        {`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                          linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 24px 24px;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .aspect-9-16 {
          aspect-ratio: 9/16;
        }
        `}
      </style>

      {/* Seção de Influenciadores */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent mb-4 pb-1">
            Players que recomendam a DigitFy:
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça os especialistas que estão contribuindo para o crescimento da nossa comunidade
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          {/* Sombra esquerda */}
          <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none"></div>

          {/* Container do carrossel com animação contínua */}
          <div className="carousel-container overflow-hidden">
            <div className="carousel-track flex gap-6 py-4 px-2 animate-scroll">
              {/* Cards - Primeiro conjunto */}
              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=2" 
                    alt="Thomas Macedo"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@thomasmacedo</h3>
                      <p className="text-sm opacity-80">Marketing Digital</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=5" 
                    alt="Ana Costa"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@aninha_costa</h3>
                      <p className="text-sm opacity-80">Content Creator</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=8" 
                    alt="Lucas Mendes"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@lucas_growth</h3>
                      <p className="text-sm opacity-80">Growth Hacker</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=9" 
                    alt="Beatriz Lima"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@bea_digital</h3>
                      <p className="text-sm opacity-80">Digital Strategist</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=10" 
                    alt="Pedro Almeida"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@pedro_analytics</h3>
                      <p className="text-sm opacity-80">Data Analytics</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=11" 
                    alt="Camila Ferreira"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@camila_digital</h3>
                      <p className="text-sm opacity-80">Estrategista Digital</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards duplicados para efeito contínuo */}
              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=2" 
                    alt="Thomas Macedo"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@thomasmacedo</h3>
                      <p className="text-sm opacity-80">Marketing Digital</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=5" 
                    alt="Ana Costa"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@aninha_costa</h3>
                      <p className="text-sm opacity-80">Content Creator</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=8" 
                    alt="Lucas Mendes"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@lucas_growth</h3>
                      <p className="text-sm opacity-80">Growth Hacker</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=9" 
                    alt="Beatriz Lima"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@bea_digital</h3>
                      <p className="text-sm opacity-80">Digital Strategist</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=10" 
                    alt="Pedro Almeida"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@pedro_analytics</h3>
                      <p className="text-sm opacity-80">Data Analytics</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden flex-shrink-0 w-72">
                <div className="aspect-9-16 relative overflow-hidden">
                  <img 
                    src="https://i.pravatar.cc/800?img=11" 
                    alt="Camila Ferreira"
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold">@camila_digital</h3>
                      <p className="text-sm opacity-80">Estrategista Digital</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sombra direita */}
          <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Estilos Globais e Carrossel */}
      <style>
        {`
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                          linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 24px 24px;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .aspect-9-16 {
          aspect-ratio: 9/16;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-312px * 6));
          }
        }
        
        .carousel-container {
          width: 100%;
          position: relative;
        }
        
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
        `}
      </style>
    </div>
  );
};

export default Community;
