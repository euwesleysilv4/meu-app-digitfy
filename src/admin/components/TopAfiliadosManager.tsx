import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Button, 
  Input, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  Pagination
} from '@nextui-org/react';
import { 
  PlusIcon, 
  EditIcon, 
  DeleteIcon, 
  EyeIcon, 
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SearchIcon,
  RefreshCwIcon,
  Instagram
} from 'lucide-react';

interface Afiliado {
  id: string;
  nome: string;
  instagram: string;
  profile_image: string;
  vendas: number;
  comissao: number;
  comissao_formatada: string;
  posicao: number;
  status: 'ativo' | 'inativo';
  is_top5: boolean;
  data_criacao: string;
  data_modificacao: string;
}

interface FormValues {
  id?: string;
  nome: string;
  instagram: string;
  profile_image: string;
  vendas: number;
  comissao: number;
  posicao: number;
  status: 'ativo' | 'inativo';
}

const TopAfiliadosManager: React.FC = () => {
  // Estados
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    nome: '',
    instagram: '',
    profile_image: '',
    vendas: 0,
    comissao: 0,
    posicao: 1,
    status: 'ativo'
  });
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // Função para buscar afiliados
  const fetchAfiliados = async () => {
    try {
      setLoading(true);
      console.log('Iniciando busca de afiliados...');
      
      const { data, error } = await supabase
        .from('top_afiliados')
        .select('*')
        .order('posicao', { ascending: true });

      console.log('Resposta do Supabase:', { data, error });

      if (error) throw error;
      console.log('Afiliados carregados:', data);
      setAfiliados(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar afiliados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar
  useEffect(() => {
    fetchAfiliados();
  }, []);

  // Filtragem de afiliados com base no termo de busca
  const filteredAfiliados = afiliados.filter(afiliado => 
    afiliado.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    afiliado.instagram.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const pages = Math.ceil(filteredAfiliados.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAfiliados = filteredAfiliados.slice(startIndex, endIndex);

  // Abrir modal para criar
  const handleCreate = () => {
    setFormValues({
      nome: '',
      instagram: '',
      profile_image: 'https://i.pravatar.cc/150?img=1',
      vendas: 0,
      comissao: 0,
      posicao: afiliados.length + 1,
      status: 'ativo'
    });
    setFormMode('create');
    onOpen();
  };

  // Abrir modal para editar
  const handleEdit = (afiliado: Afiliado) => {
    setFormValues({
      id: afiliado.id,
      nome: afiliado.nome,
      instagram: afiliado.instagram,
      profile_image: afiliado.profile_image,
      vendas: afiliado.vendas,
      comissao: afiliado.comissao,
      posicao: afiliado.posicao,
      status: afiliado.status
    });
    setFormMode('edit');
    onOpen();
  };

  // Salvar afiliado (criar ou atualizar)
  const handleSave = async () => {
    try {
      setLoading(true);

      const formatInstagram = (instagram: string) => {
        // Garantir que o Instagram comece com @
        if (!instagram.startsWith('@')) {
          return '@' + instagram;
        }
        return instagram;
      };

      // Validar formato do Instagram
      const formattedInstagram = formatInstagram(formValues.instagram);

      if (formMode === 'create') {
        // Chamar função RPC para adicionar afiliado
        const { data, error } = await supabase.rpc('add_top_afiliado', {
          p_nome: formValues.nome,
          p_instagram: formattedInstagram,
          p_profile_image: formValues.profile_image,
          p_vendas: formValues.vendas,
          p_comissao: formValues.comissao,
          p_posicao: formValues.posicao
        });

        if (error) throw error;
      } else {
        // Chamar função RPC para atualizar afiliado
        const { data, error } = await supabase.rpc('update_top_afiliado', {
          p_id: formValues.id,
          p_nome: formValues.nome,
          p_instagram: formattedInstagram,
          p_profile_image: formValues.profile_image,
          p_vendas: formValues.vendas,
          p_comissao: formValues.comissao,
          p_posicao: formValues.posicao,
          p_status: formValues.status
        });

        if (error) throw error;
      }

      // Fechar modal e atualizar lista
      onClose();
      await fetchAfiliados();
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao salvar afiliado:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remover afiliado
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este afiliado?')) return;

    try {
      setLoading(true);
      
      // Chamar função RPC para remover afiliado
      const { data, error } = await supabase.rpc('delete_top_afiliado', {
        p_id: id
      });

      if (error) throw error;
      
      // Atualizar lista
      await fetchAfiliados();
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao excluir afiliado:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mover afiliado para cima ou para baixo
  const handleMove = async (id: string, direction: 'up' | 'down') => {
    try {
      const afiliado = afiliados.find(a => a.id === id);
      if (!afiliado) return;

      let novaPosicao = afiliado.posicao;
      if (direction === 'up' && novaPosicao > 1) {
        novaPosicao -= 1;
      } else if (direction === 'down' && novaPosicao < afiliados.length) {
        novaPosicao += 1;
      } else {
        return; // Não é possível mover mais
      }

      // Chamar função RPC para reordenar
      const { data, error } = await supabase.rpc('reorder_top_afiliado', {
        p_id: id,
        p_nova_posicao: novaPosicao
      });

      if (error) throw error;
      
      // Atualizar lista
      await fetchAfiliados();
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao mover afiliado:', err);
    }
  };

  // Renderizar o componente de interface
  return (
    <div className="w-full px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Gerenciamento de Top Afiliados
          </h1>
          <p className="text-sm text-gray-500">
            Gerencie os afiliados que aparecem na página principal
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar afiliados..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64"
              size="sm"
            />
          </div>
          <Button 
            color="primary" 
            startContent={<RefreshCwIcon className="w-4 h-4" />}
            size="sm"
            onClick={() => fetchAfiliados()}
          >
            Atualizar
          </Button>
          <Button 
            color="success" 
            startContent={<PlusIcon className="w-4 h-4" />}
            size="sm"
            onClick={handleCreate}
          >
            Novo Afiliado
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
          <Button
            color="danger"
            variant="light"
            size="sm"
            onClick={() => setError(null)}
            className="ml-2"
          >
            Fechar
          </Button>
        </div>
      )}

      {loading && afiliados.length === 0 ? (
        <div className="flex justify-center items-center p-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <Table 
            aria-label="Tabela de Top Afiliados"
            bottomContent={
              <div className="flex w-full justify-between items-center">
                <span className="text-sm text-gray-500">
                  Total de {filteredAfiliados.length} afiliados
                </span>
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={currentPage}
                  total={pages}
                  onChange={(page) => setCurrentPage(page)}
                />
              </div>
            }
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn width={70}>POSIÇÃO</TableColumn>
              <TableColumn>FOTO</TableColumn>
              <TableColumn>NOME</TableColumn>
              <TableColumn>INSTAGRAM</TableColumn>
              <TableColumn>VENDAS</TableColumn>
              <TableColumn>COMISSÃO</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn width={150}>AÇÕES</TableColumn>
            </TableHeader>
            <TableBody items={paginatedAfiliados} emptyContent="Nenhum afiliado encontrado">
              {(afiliado) => (
                <TableRow key={afiliado.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium text-lg">{afiliado.posicao}</span>
                      {afiliado.is_top5 && (
                        <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                          Top 5
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <img 
                      src={afiliado.profile_image} 
                      alt={afiliado.nome}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell>{afiliado.nome}</TableCell>
                  <TableCell>
                    <a 
                      href={`https://instagram.com/${afiliado.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-emerald-500 hover:text-emerald-700"
                    >
                      <Instagram className="w-4 h-4 mr-1" />
                      {afiliado.instagram}
                    </a>
                  </TableCell>
                  <TableCell>{afiliado.vendas.toLocaleString()}</TableCell>
                  <TableCell>{afiliado.comissao_formatada}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      afiliado.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {afiliado.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip content="Mover para cima">
                        <Button 
                          isIconOnly
                          size="sm" 
                          variant="light" 
                          onClick={() => handleMove(afiliado.id, 'up')}
                          isDisabled={afiliado.posicao === 1}
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      
                      <Tooltip content="Mover para baixo">
                        <Button 
                          isIconOnly
                          size="sm" 
                          variant="light" 
                          onClick={() => handleMove(afiliado.id, 'down')}
                          isDisabled={afiliado.posicao === afiliados.length}
                        >
                          <ArrowDownIcon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      
                      <Tooltip content="Editar afiliado">
                        <Button 
                          isIconOnly
                          size="sm" 
                          color="primary" 
                          variant="flat"
                          onClick={() => handleEdit(afiliado)}
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      
                      <Tooltip content="Excluir afiliado">
                        <Button 
                          isIconOnly
                          size="sm" 
                          color="danger" 
                          variant="flat"
                          onClick={() => handleDelete(afiliado.id)}
                        >
                          <DeleteIcon className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </>
      )}

      {/* Modal para criar/editar afiliado */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {formMode === 'create' ? 'Adicionar Novo Afiliado' : 'Editar Afiliado'}
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Nome do Afiliado"
                      placeholder="Ex: João Silva"
                      value={formValues.nome}
                      onChange={(e) => setFormValues({...formValues, nome: e.target.value})}
                      variant="bordered"
                    />
                  </div>
                  
                  <Input
                    label="Instagram"
                    placeholder="Ex: @usuario"
                    value={formValues.instagram}
                    onChange={(e) => setFormValues({...formValues, instagram: e.target.value})}
                    variant="bordered"
                    startContent={<Instagram className="w-4 h-4 text-default-400" />}
                  />
                  
                  <Input
                    label="URL da Imagem de Perfil"
                    placeholder="https://..."
                    value={formValues.profile_image}
                    onChange={(e) => setFormValues({...formValues, profile_image: e.target.value})}
                    variant="bordered"
                  />
                  
                  <Input
                    type="number"
                    label="Vendas"
                    placeholder="Número de vendas"
                    value={formValues.vendas.toString()}
                    onChange={(e) => setFormValues({...formValues, vendas: parseInt(e.target.value) || 0})}
                    variant="bordered"
                  />
                  
                  <Input
                    type="number"
                    label="Comissão (R$)"
                    placeholder="Valor em reais (sem pontos)"
                    value={formValues.comissao.toString()}
                    onChange={(e) => setFormValues({...formValues, comissao: parseFloat(e.target.value) || 0})}
                    variant="bordered"
                    description="Digite o valor sem pontuação (Ex: 125000 para R$ 125.000,00)"
                  />
                  
                  <Input
                    type="number"
                    label="Posição no Ranking"
                    placeholder="1-100"
                    value={formValues.posicao.toString()}
                    onChange={(e) => setFormValues({...formValues, posicao: parseInt(e.target.value) || 1})}
                    variant="bordered"
                  />
                  
                  <div>
                    <label className="block text-sm mb-1">Status</label>
                    <select
                      className="w-full p-2 rounded-md border border-gray-300"
                      value={formValues.status}
                      onChange={(e) => setFormValues({
                        ...formValues, 
                        status: e.target.value as 'ativo' | 'inativo'
                      })}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="flex mt-4">
                  <div className="flex flex-col items-center border border-gray-200 rounded-lg p-4 mr-4">
                    <p className="text-sm text-gray-500 mb-2">Visualização</p>
                    <img 
                      src={formValues.profile_image || 'https://i.pravatar.cc/150?img=1'}
                      alt="Prévia" 
                      className="w-16 h-16 rounded-full mb-2 object-cover"
                    />
                    <p className="font-semibold text-center">{formValues.nome || 'Nome do Afiliado'}</p>
                    <p className="text-emerald-600 text-sm">{formValues.instagram || '@usuario'}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {`R$ ${(formValues.comissao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </p>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">Observações:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Os Top 5 afiliados serão destacados na página principal</li>
                      <li>• A posição define a ordem de exibição na página</li>
                      <li>• Apenas afiliados com status "Ativo" serão exibidos</li>
                      <li>• O sistema atualiza automaticamente o campo Top 5</li>
                    </ul>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={handleSave} isLoading={loading}>
                  {formMode === 'create' ? 'Adicionar' : 'Salvar Alterações'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TopAfiliadosManager; 