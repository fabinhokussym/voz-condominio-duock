import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ThumbsUp, ThumbsDown, MessageCircle, Download, X, User, Search, TrendingUp, CheckCircle2, Clock, Wrench, Sparkles, Shield, DollarSign, ScrollText, MoreHorizontal, Home, Phone, Mail, Globe, Calendar, Award, Briefcase, CircleDollarSign, FileCheck, Flag, Archive, AlertTriangle, Eye, EyeOff, UserCog, Ban, Users, Camera, Edit2, Trash2, Link, ZoomIn } from 'lucide-react';

// ============ SUPABASE CONFIG ============
// Substitua pelos seus valores após pegar no Supabase → Project Settings → API
const SUPABASE_URL = 'https://jeackdgolyqbkvngbqsj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7lLV5uaydCDBWZETHUGIdw_OvrLjdwk';

const sb = async (path, options = {}) => {
  const base = SUPABASE_URL.replace('https://', 'https://').replace('.supabase.co', '.supabase.co');
  const res = await fetch(`${base}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer ?? 'return=representation',
      ...options.headers,
    },
    method: options.method || 'GET',
    body: options.body,
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  if (res.status === 204 || options.method === 'DELETE') return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// ============ CORES DUO CK ============
const COR = {
  azul: '#1B2D4F',
  vinho: '#8B1F41',
  teal: '#2A7F8A',
  azulLight: '#E8EDF4',
  vinhoLight: '#F5E8EC',
  tealLight: '#E6F2F3',
  cinza100: '#F7F7F8',
  cinza200: '#EEEEF0',
  cinza400: '#9B9BA8',
  cinza700: '#3D3D4A',
  branco: '#FFFFFF',
};

// ============ CONFIGURAÇÕES ============
const TOTAL_APARTAMENTOS = 98;
const PALAVRAS_BLOQUEADAS = ['airbnb', 'aluguel por temporada', 'locação curta', 'locação de curta duração', 'booking.com', 'hospedagem temporada', 'aluguel diário', 'por temporada', 'short stay'];
const COOLDOWN_SUGESTAO_HORAS = 24;
const MAX_COMENTARIOS_POR_SUGESTAO = 3;
const MIN_CARACTERES_DESCRICAO = 50;

const CATEGORIES = [
  { id: 'melhorias', label: 'Melhorias', icon: Sparkles },
  { id: 'reparos', label: 'Reparos', icon: Wrench },
  { id: 'areas-comuns', label: 'Áreas Comuns', icon: Home },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'regras', label: 'Regras', icon: ScrollText },
  { id: 'outros', label: 'Outros', icon: MoreHorizontal },
];

const STATUS = [
  { id: 'ideia', label: 'Ideia', bg: '#EEEEF0', text: '#3D3D4A' },
  { id: 'votacao', label: 'Em votação', bg: '#E6F2F3', text: '#2A7F8A' },
  { id: 'orcando', label: 'Orçando', bg: '#FEF3C7', text: '#92400E' },
  { id: 'aprovado', label: 'Aprovado', bg: '#E8EDF4', text: '#1B2D4F' },
  { id: 'agendado', label: 'Agendado', bg: '#EDE9FE', text: '#5B21B6' },
  { id: 'execucao', label: 'Em execução', bg: '#F5E8EC', text: '#8B1F41' },
  { id: 'concluido', label: 'Concluído', bg: '#D1FAE5', text: '#065F46' },
  { id: 'rejeitado', label: 'Rejeitado', bg: '#FEE2E2', text: '#991B1B' },
  { id: 'arquivado', label: 'Arquivado', bg: '#E5E7EB', text: '#6B7280' },
];

const STATUS_PLACAR_VISIVEL = ['aprovado', 'rejeitado', 'concluido', 'execucao', 'agendado', 'arquivado'];

const SEED = [
  { id:'s1', titulo:'Melhorias e novos equipamentos para a academia', descricao:'Nossa academia tem potencial para ser completa, mas faltam equipamentos essenciais. Proponho a compra de crossover com duas polias, agachamento, bicicleta spinning (até R$ 2.000) e a substituição dos aparelhos mais desgastados. Uma academia bem equipada é comodidade real para quem quer treinar antes ou depois do trabalho sem precisar sair do condomínio, valorizando nosso patrimônio e qualidade de vida.', categoria:'areas-comuns', status:'ideia', autorApto:'1902B', autorNome:'Fabinho', data:'2026-04-22', comentarios:[{autorApto:'—',autorNome:'Daiany Martins',texto:'Eu já mandei o link de um aparelho para o Marcos. Ele disse que precisamos decidir em assembleia.',data:'2026-04-22'}], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s2', titulo:'Melhorias na brinquedoteca interna e externa', descricao:'A brinquedoteca precisa de investimento em novos brinquedos e equipamentos, tanto na área interna quanto na externa. Com várias crianças no prédio, um espaço bem equipado faz enorme diferença no dia a dia das famílias e se torna um grande diferencial do condomínio. Vale avaliar também a segurança e o estado atual dos itens existentes.', categoria:'areas-comuns', status:'ideia', autorApto:'1902B', autorNome:'Fabinho', data:'2026-04-22', comentarios:[], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s3', titulo:'Paisagismo nas áreas externas e fachada', descricao:'Pode parecer detalhe, mas paisagismo valoriza muito o patrimônio. Trabalho com empreendimentos de alto padrão e vejo que o Duo tem potencial estético ainda não aproveitado. Proponho um projeto profissional de paisagismo para áreas externas e fachada — investimento relativamente baixo com impacto visual alto, que se reflete no valor dos apartamentos.', categoria:'melhorias', status:'ideia', autorApto:'1902B', autorNome:'Fabinho', data:'2026-04-22', comentarios:[{autorApto:'—',autorNome:'Jhonatan De Lorenzi',texto:'Total apoio. Falei sobre paisagismo essa semana também.',data:'2026-04-22'}], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s4', titulo:'Compressor de ar no bicicletário', descricao:'Simples, barato e muito funcional. Instalar um compressor fixo no bicicletário resolve a vida de quem chega de viagem com pneu murcho ou de quem usa bicicleta com frequência. Investimento baixo e benefício imediato para todos que usam o espaço.', categoria:'melhorias', status:'ideia', autorApto:'1902B', autorNome:'Fabinho', data:'2026-04-22', comentarios:[], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s5', titulo:'Trocadores de fraldas nas áreas comuns', descricao:'Temos muitas crianças no prédio e nenhum trocador de fraldas nas áreas de lazer. Proposta: instalar trocadores fixos de parede em pelo menos dois pontos — um próximo aos salões de festa e outro perto da piscina. Atende tanto moradores quanto convidados dos eventos.', categoria:'areas-comuns', status:'ideia', autorApto:'1902B', autorNome:'Fernanda', data:'2026-04-22', comentarios:[{autorApto:'—',autorNome:'Mona Goulart',texto:'Ahh, verdade! Boa ideia.',data:'2026-04-22'},{autorApto:'—',autorNome:'Nando de Marchi',texto:'Dá pra colocar um em cada torre — um próximo dos salões de festa e outro perto da piscina.',data:'2026-04-22'}], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s6', titulo:'Reuniões de condomínio com mais frequência', descricao:'Muitos moradores ficam em dúvida sobre o que o conselho e síndico estão fazendo, porque não existe um planejamento público com datas e previsões. Proposta: reuniões periódicas (mensais ou bimestrais) para alinhar prioridades, compartilhar avanços e dar transparência. Melhora a confiança de todos na gestão.', categoria:'regras', status:'ideia', autorApto:'—', autorNome:'Mona Goulart', data:'2026-04-22', comentarios:[], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s7', titulo:'Lixeiras em cada andar da garagem', descricao:'Hoje é preciso ir até o térreo e sair do condomínio para descartar lixo, o que gera risco de assalto e desperdício de tempo abrindo portão. Proposta: instalar lixeiras em cada andar de garagem — se não houver lugar ideal, podem ficar na área das escadas de emergência.', categoria:'melhorias', status:'ideia', autorApto:'—', autorNome:'Mona Goulart', data:'2026-04-22', comentarios:[], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s8', titulo:'Automação da Hidro', descricao:'Maior controle da hidromassagem, evitar danos por uso incorreto, melhorar segurança e facilitar o acionamento do esvaziamento. Sistema atual depende de operação manual e já causou problemas. Automatizar reduz custos de manutenção e aumenta a vida útil do equipamento.', categoria:'areas-comuns', status:'ideia', autorApto:'—', autorNome:'Mona Goulart', data:'2026-04-22', comentarios:[], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s9', titulo:'Ampliação do bicicletário', descricao:'O bicicletário atual já não comporta a demanda. Muitos moradores estão deixando de usar bicicleta por falta de espaço ou guardando de forma improvisada. Ampliação é necessária para atender o crescimento do uso e evitar conflitos entre vizinhos.', categoria:'melhorias', status:'ideia', autorApto:'—', autorNome:'Mona Goulart', data:'2026-04-22', comentarios:[], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s10', titulo:'Armários padronizados na garagem para itens de praia', descricao:'Muitos moradores já instalaram armários próprios na garagem, mas o resultado é despadronização visual. Proposta: convênio com marcenaria para um modelo único com preço acessível. Moradores aderem individualmente, mas o visual fica harmônico.', categoria:'melhorias', status:'ideia', autorApto:'—', autorNome:'Mona Goulart', data:'2026-04-22', comentarios:[{autorApto:'—',autorNome:'Vizinho (9765-8997)',texto:'Um pacote de padronização com preço acessível ou um local comum para todos guardarem seria ótimo.',data:'2026-04-22'}], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s11', titulo:'Melhorar sistema de desligamento da sauna', descricao:'Problema recorrente: a sauna fica ligada por horas depois do uso, chegando a 76 graus. Risco elétrico real e custo alto. Proposta: instalar temporizador automático ou sensor de presença para desligamento seguro após período sem uso.', categoria:'seguranca', status:'ideia', autorApto:'—', autorNome:'Jhonatan De Lorenzi', data:'2026-04-22', comentarios:[{autorApto:'—',autorNome:'Nando de Marchi',texto:'Fui verificar e estava vazia mas ligada. Precisa de solução técnica permanente.',data:'2026-04-22'}], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s12', titulo:'Cinzeiros nas áreas de fumantes (G3)', descricao:'Bitucas de cigarro espalhadas pelo G3 e outros pontos são reclamação frequente. A solução precisa ser física, não apenas comunicada. Proposta: instalar cinzeiros adequados (bandeja em aço inox) nos pontos de maior incidência.', categoria:'areas-comuns', status:'ideia', autorApto:'—', autorNome:'Vizinho (9937-9540)', data:'2026-04-22', comentarios:[], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s13', titulo:'Ajustar lógica dos elevadores nas garagens', descricao:'Os elevadores G2, G3, G4 e L só permitem subir ou só descer em alguns andares, obrigando trajetos mais longos. Proposta: revisar a programação para que todos os andares tenham ambas as opções (subir e descer).', categoria:'melhorias', status:'ideia', autorApto:'—', autorNome:'Vizinho (9765-8997)', data:'2026-04-22', comentarios:[{autorApto:'—',autorNome:'Daiany Martins',texto:'Também notei. Não faz sentido. Precisa ter ambos em todos os andares.',data:'2026-04-22'}], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s14', titulo:'Área Pet Wash', descricao:'O parquinho pet atual virou fonte de odor forte por falta de estrutura para limpeza dos animais. Proposta: criar uma área simples de Pet Wash com ponto de água e ducha, para lavar pets ao voltar da praia ou de uma caminhada. Solução simples com grande impacto na higiene das áreas comuns.', categoria:'areas-comuns', status:'ideia', autorApto:'—', autorNome:'Gabriela', data:'2026-04-22', comentarios:[{autorApto:'—',autorNome:'Vizinho (99459-7080)',texto:'Seria incrível!',data:'2026-04-22'}], orcamentos:[], execucao:null, prestacaoContas:null },
  { id:'s15', titulo:'Mesa de ping pong na sala de jogos', descricao:'Sugestão levantada no grupo para complementar a sala de jogos. Precisa avaliar espaço disponível, acústica e regras de uso para não virar fonte de barulho em horários inadequados.', categoria:'areas-comuns', status:'ideia', autorApto:'—', autorNome:'Vizinho (9933-7787)', data:'2026-04-22', comentarios:[{autorApto:'—',autorNome:'Daiany Martins',texto:'Se colocar, vamos precisar melhorar a acústica depois.',data:'2026-04-22'}], orcamentos:[], execucao:null, prestacaoContas:null },
];

const formatBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const contarVotos = (votos = []) => ({
  positivos: votos.filter(v => v.tipo === 'pos').length,
  negativos: votos.filter(v => v.tipo === 'neg').length,
  total: votos.length,
});

const verificarPalavrasBloqueadas = (texto) => {
  const t = texto.toLowerCase();
  for (const p of PALAVRAS_BLOQUEADAS) {
    if (t.includes(p)) return p;
  }
  return null;
};

// Botão padrão do design Duo CK
const Btn = ({ onClick, disabled, cor = 'azul', outline = false, size = 'md', children, className = '' }) => {
  const cores = {
    azul: { bg: COR.azul, text: '#fff', border: COR.azul },
    vinho: { bg: COR.vinho, text: '#fff', border: COR.vinho },
    teal: { bg: COR.teal, text: '#fff', border: COR.teal },
    cinza: { bg: COR.cinza200, text: COR.cinza700, border: COR.cinza200 },
    vermelho: { bg: '#DC2626', text: '#fff', border: '#DC2626' },
  };
  const c = cores[cor] || cores.azul;
  const pad = size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 28px' : '8px 20px';
  const style = {
    background: outline ? 'transparent' : (disabled ? COR.cinza200 : c.bg),
    color: outline ? c.bg : (disabled ? COR.cinza400 : c.text),
    border: `1.5px solid ${disabled ? COR.cinza200 : c.border}`,
    borderRadius: 6,
    padding: pad,
    fontSize: 13,
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    letterSpacing: '0.01em',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  };
  return <button style={style} onClick={onClick} disabled={disabled} className={className}>{children}</button>;
};

const Badge = ({ status }) => {
  const st = STATUS.find(s => s.id === status) || STATUS[0];
  return (
    <span style={{ background: st.bg, color: st.text, borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {st.label}
    </span>
  );
};

const LogoDuoCK = ({ size = 32 }) => (
  <svg width={size * 2.2} height={size * 0.85} viewBox="0 0 110 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="36" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="40" fill={COR.azul}>D</text>
    <text x="26" y="36" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="40" fill={COR.vinho}>U</text>
    <text x="56" y="36" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="40" fill={COR.teal}>O</text>
  </svg>
);

// ============ COMPONENTE PAINEL DE FOTOS ============
function PainelFotos({ fotos, linkFoto, setLinkFoto, uploadando, onAdicionarLink, onUpload, onRemover, onAmplia, COR, input, label }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={label}>Fotos (opcional — máx. 5)</label>

      {/* Grid de fotos existentes */}
      {fotos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
          {fotos.map((f, i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: '75%', background: COR.cinza100, borderRadius: 8, overflow: 'hidden', border: `1px solid ${COR.cinza200}` }}>
              <img
                src={f.url}
                alt={`Foto ${i + 1}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => onAmplia(f.url)}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <button
                onClick={() => onRemover(i)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {fotos.length < 5 && (
        <>
          {/* Upload direto */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: `1.5px dashed ${COR.cinza200}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, color: COR.cinza700, background: COR.cinza100 }}>
              <Camera size={15} /> {uploadando ? 'Carregando...' : 'Enviar foto do dispositivo'}
              <input type="file" accept="image/*" onChange={onUpload} style={{ display: 'none' }} disabled={uploadando} />
            </label>
          </div>

          {/* Link de foto */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={linkFoto}
              onChange={e => setLinkFoto(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAdicionarLink()}
              placeholder="Ou cole um link de foto (http://...)"
              style={{ ...input, flex: 1, fontSize: 12 }}
            />
            <button onClick={onAdicionarLink} disabled={!linkFoto.trim()} style={{ padding: '8px 14px', background: linkFoto.trim() ? COR.teal : COR.cinza200, color: linkFoto.trim() ? '#fff' : COR.cinza400, border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: linkFoto.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
              <Link size={13} /> Adicionar
            </button>
          </div>
          <div style={{ fontSize: 11, color: COR.cinza400, marginTop: 4 }}>
            Fotos do WhatsApp: abra a foto no WhatsApp Web, clique com botão direito → "Copiar endereço da imagem" e cole aqui.
          </div>
        </>
      )}
    </div>
  );
}

// ============ COMPONENTE GALERIA ============
function GaleriaFotos({ fotos, onAmplia, COR }) {
  if (!fotos || fotos.length === 0) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: fotos.length === 1 ? '1fr' : fotos.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 8 }}>
        {fotos.map((f, i) => (
          <div key={i} style={{ position: 'relative', paddingBottom: fotos.length === 1 ? '56%' : '75%', background: COR.cinza100, borderRadius: 10, overflow: 'hidden', border: `1px solid ${COR.cinza200}`, cursor: 'pointer' }} onClick={() => onAmplia(f.url)}>
            <img
              src={f.url}
              alt={`Foto ${i + 1}`}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.parentElement.style.display = 'none'; }}
            />
            <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(27,45,79,0.5)', borderRadius: 6, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ZoomIn size={12} color="#fff" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Condominio() {
  const [usuario, setUsuario] = useState(null);
  const [nomeInput, setNomeInput] = useState('');
  const [aptoInput, setAptoInput] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [votos, setVotos] = useState({});
  const [votosOrc, setVotosOrc] = useState({});
  const [conselho, setConselho] = useState(['SIND']);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('recentes');
  const [busca, setBusca] = useState('');
  const [visualizacao, setVisualizacao] = useState('lista');
  const [modoConselho, setModoConselho] = useState(false);
  const [abrirNova, setAbrirNova] = useState(false);
  const [detalheAberto, setDetalheAberto] = useState(null);
  const [abaDetalhe, setAbaDetalhe] = useState('detalhes');
  const [novaSugestao, setNovaSugestao] = useState({ titulo: '', descricao: '', categoria: 'melhorias', fotos: [] });
  const [avisoNova, setAvisoNova] = useState('');
  const [novoComentario, setNovoComentario] = useState('');
  const [abrirNovoOrc, setAbrirNovoOrc] = useState(false);
  const [novoOrc, setNovoOrc] = useState({ empresa: '', contato: '', email: '', site: '', valor: '', prazo: '', garantia: '', observacoes: '' });
  const [editarExec, setEditarExec] = useState(false);
  const [execTemp, setExecTemp] = useState(null);
  const [novaAtualizacao, setNovaAtualizacao] = useState('');
  const [editarContas, setEditarContas] = useState(false);
  const [contasTemp, setContasTemp] = useState(null);
  const [abrirModeracao, setAbrirModeracao] = useState(false);
  const [sinalizando, setSinalizando] = useState(null);
  const [motivoSin, setMotivoSin] = useState('');
  const [usandoSupabase] = useState(SUPABASE_URL !== 'COLE_SUA_URL_AQUI');
  // Fotos e edição
  const [fotoAmpliada, setFotoAmpliada] = useState(null);
  const [editandoSugestao, setEditandoSugestao] = useState(null); // sugestão sendo editada
  const [linkFoto, setLinkFoto] = useState('');
  const [uploadandoFoto, setUploadandoFoto] = useState(false);

  // ---- LOAD ----
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (usandoSupabase) {
        try {
          const [sRows, vRows, oRows, cRows] = await Promise.all([
            sb('sugestoes?select=*,comentarios(*),orcamentos(*)&order=created_at.desc'),
            sb('votos_sugestao?select=*'),
            sb('votos_orcamento?select=*'),
            sb('conselho?select=apto'),
          ]);
          const votosMap = {};
          (vRows || []).forEach(v => {
            if (!votosMap[v.sugestao_id]) votosMap[v.sugestao_id] = [];
            votosMap[v.sugestao_id].push({ apto: v.apto, tipo: v.tipo, nome: v.nome });
          });
          const votosOrcMap = {};
          (oRows || []).forEach(v => { votosOrcMap[v.sugestao_id] = v.apto; });
          setVotos(votosMap);
          setVotosOrc(votosOrcMap);
          setConselho((cRows || []).map(c => c.apto));
          setSugestoes((sRows || []).map(s => ({
            ...s,
            autorApto: s.autor_apto,
            autorNome: s.autor_nome,
            prestacaoContas: s.prestacao_contas,
            comentarios: (s.comentarios || []).map(c => ({ ...c, autorApto: c.autor_apto, autorNome: c.autor_nome })),
            orcamentos: (s.orcamentos || []).map(o => ({ ...o })),
            sinalizacoes: [],
          })));
        } catch (e) {
          console.error('Erro Supabase, usando seed local:', e);
          setSugestoes(SEED);
        }
      } else {
        // Modo protótipo: usa seed + storage local
        try {
          const s = await window.storage.get('sugestoes_duock', true);
          if (s?.value) setSugestoes(JSON.parse(s.value));
          else setSugestoes(SEED);
          const v = await window.storage.get('votos_duock', false);
          if (v?.value) setVotos(JSON.parse(v.value));
          const vo = await window.storage.get('votosOrc_duock', false);
          if (vo?.value) setVotosOrc(JSON.parse(vo.value));
          const u = await window.storage.get('usuario_duock', false);
          if (u?.value) setUsuario(JSON.parse(u.value));
          const c = await window.storage.get('conselho_duock', true);
          if (c?.value) setConselho(JSON.parse(c.value));
        } catch (e) { setSugestoes(SEED); }
      }
      if (!usandoSupabase) {
        try {
          const u = await window.storage.get('usuario_duock', false);
          if (u?.value) setUsuario(JSON.parse(u.value));
        } catch (e) {}
      }
      setLoading(false);
    };
    load();
  }, []);

  const salvarLocal = async (key, val, shared = false) => {
    try { await window.storage.set(key, JSON.stringify(val), shared); } catch (e) {}
  };

  // ---- FOTOS ----
  const adicionarFotoLink = (alvo, setAlvo) => {
    if (!linkFoto.trim()) return;
    const url = linkFoto.trim();
    if (!url.startsWith('http')) { alert('Cole uma URL válida começando com http...'); return; }
    const fotosAtuais = alvo.fotos || [];
    if (fotosAtuais.length >= 5) { alert('Máximo de 5 fotos por sugestão.'); return; }
    setAlvo({ ...alvo, fotos: [...fotosAtuais, { tipo: 'link', url }] });
    setLinkFoto('');
  };

  const adicionarFotoUpload = (e, alvo, setAlvo) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Foto muito grande. Máximo 3MB.'); return; }
    const fotosAtuais = alvo.fotos || [];
    if (fotosAtuais.length >= 5) { alert('Máximo de 5 fotos por sugestão.'); return; }
    setUploadandoFoto(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAlvo({ ...alvo, fotos: [...fotosAtuais, { tipo: 'base64', url: ev.target.result }] });
      setUploadandoFoto(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removerFoto = (idx, alvo, setAlvo) => {
    setAlvo({ ...alvo, fotos: (alvo.fotos || []).filter((_, i) => i !== idx) });
  };

  // ---- EDITAR/APAGAR SUGESTÃO ----
  const podEditarApagar = (s) => {
    if (!usuario) return false;
    if (s.autorApto !== usuario.apto) return false;
    // Só pode se não tiver votos de outros aptos
    const votosOthers = (votos[s.id] || []).filter(v => v.apto !== usuario.apto);
    return votosOthers.length === 0;
  };

  const salvarEdicao = async () => {
    if (!editandoSugestao) return;
    const { titulo, descricao, categoria, fotos } = editandoSugestao;
    if (!titulo.trim() || !descricao.trim()) return;
    const bloqueada = verificarPalavrasBloqueadas(`${titulo} ${descricao}`);
    if (bloqueada) { alert(`Texto menciona tema fora da convenção ("${bloqueada}").`); return; }
    if (usandoSupabase) {
      await sb(`sugestoes?id=eq.${editandoSugestao.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ titulo: titulo.trim(), descricao: descricao.trim(), categoria, fotos: fotos || [] }),
        prefer: 'return=minimal',
      });
    }
    const novos = sugestoes.map(s => s.id !== editandoSugestao.id ? s : { ...s, titulo: titulo.trim(), descricao: descricao.trim(), categoria, fotos: fotos || [] });
    await salvarSugestoes(novos);
    setDetalheAberto(novos.find(s => s.id === editandoSugestao.id));
    setEditandoSugestao(null);
  };

  const apagarSugestao = async (id) => {
    if (!confirm('Tem certeza que quer apagar esta sugestão? Essa ação não pode ser desfeita.')) return;
    if (!confirm('Confirma o apagamento?')) return;
    if (usandoSupabase) {
      await sb(`sugestoes?id=eq.${id}`, { method: 'DELETE', prefer: '' });
    }
    await salvarSugestoes(sugestoes.filter(s => s.id !== id));
    setDetalheAberto(null);
  };

  const salvarSugestoes = async (novas) => {
    setSugestoes(novas);
    if (!usandoSupabase) await salvarLocal('sugestoes_duock', novas, true);
    if (detalheAberto) {
      const atual = novas.find(s => s.id === detalheAberto.id);
      if (atual) setDetalheAberto(atual);
    }
  };

  const fazerLogin = async () => {
    if (!nomeInput.trim() || !aptoInput.trim() || !aceitouTermos) return;
    const u = { nome: nomeInput.trim(), apto: aptoInput.trim().toUpperCase() };
    setUsuario(u);
    if (!usandoSupabase) await salvarLocal('usuario_duock', u, false);
  };

  const sair = () => {
    setUsuario(null);
    setModoConselho(false);
    setNomeInput('');
    setAptoInput('');
    setAceitouTermos(false);
  };

  const ehConselho = usuario && conselho.includes(usuario.apto);

  // ---- VOTAR ----
  const votar = async (sid, tipo) => {
    const sug = sugestoes.find(s => s.id === sid);
    if (!sug || !['ideia', 'votacao'].includes(sug.status)) return;
    const votosAtual = votos[sid] || [];
    const votoAtual = votosAtual.find(v => v.apto === usuario.apto);

    let novosVotos = [...votosAtual];
    if (votoAtual) {
      novosVotos = novosVotos.filter(v => v.apto !== usuario.apto);
      if (usandoSupabase) {
        await sb(`votos_sugestao?sugestao_id=eq.${sid}&apto=eq.${usuario.apto}`, { method: 'DELETE', prefer: '' });
      }
    }
    if (!votoAtual || votoAtual.tipo !== tipo) {
      const novoVoto = { apto: usuario.apto, nome: usuario.nome, tipo };
      novosVotos.push(novoVoto);
      if (usandoSupabase) {
        await sb('votos_sugestao', { method: 'POST', body: JSON.stringify({ sugestao_id: sid, apto: usuario.apto, nome: usuario.nome, tipo }), prefer: 'return=minimal' });
      }
    }
    const novosMap = { ...votos, [sid]: novosVotos };
    setVotos(novosMap);
    if (!usandoSupabase) await salvarLocal('votos_duock', novosMap, false);
  };

  const votarOrcamento = async (sid, orcId) => {
    const votoAtualOrcId = votosOrc[sid];
    if (usandoSupabase) {
      if (votoAtualOrcId) {
        await sb(`votos_orcamento?sugestao_id=eq.${sid}&apto=eq.${usuario.apto}`, { method: 'DELETE', prefer: '' });
      }
      if (votoAtualOrcId !== orcId) {
        await sb('votos_orcamento', { method: 'POST', body: JSON.stringify({ orcamento_id: orcId, sugestao_id: sid, apto: usuario.apto }), prefer: 'return=minimal' });
      }
    }
    const novos = { ...votosOrc };
    if (votoAtualOrcId === orcId) delete novos[sid];
    else novos[sid] = orcId;
    setVotosOrc(novos);
    if (!usandoSupabase) await salvarLocal('votosOrc_duock', novos, false);
  };

  // ---- CRIAR SUGESTÃO ----
  const criarSugestao = async () => {
    setAvisoNova('');
    const textoCompleto = `${novaSugestao.titulo} ${novaSugestao.descricao}`;
    const bloqueada = verificarPalavrasBloqueadas(textoCompleto);
    if (bloqueada) {
      setAvisoNova(`Essa proposta contém um tema ("${bloqueada}") que não está previsto na convenção do condomínio. Por favor, consulte o regulamento interno ou o síndico.`);
      return;
    }
    if (novaSugestao.descricao.trim().length < MIN_CARACTERES_DESCRICAO) {
      setAvisoNova(`A descrição precisa ter pelo menos ${MIN_CARACTERES_DESCRICAO} caracteres.`);
      return;
    }
    if (!ehConselho) {
      const agora = new Date();
      const recentes = sugestoes.filter(s => {
        if (s.autorApto !== usuario.apto) return false;
        const horas = (agora - new Date(s.data)) / (1000 * 60 * 60);
        return horas < COOLDOWN_SUGESTAO_HORAS;
      });
      if (recentes.length > 0) {
        setAvisoNova(`Você só pode publicar uma sugestão a cada ${COOLDOWN_SUGESTAO_HORAS} horas.`);
        return;
      }
    }

    let nova;
    if (usandoSupabase) {
      const [row] = await sb('sugestoes', {
        method: 'POST',
        body: JSON.stringify({ titulo: novaSugestao.titulo.trim(), descricao: novaSugestao.descricao.trim(), categoria: novaSugestao.categoria, status: 'ideia', autor_apto: usuario.apto, autor_nome: usuario.nome, data: new Date().toISOString().split('T')[0], fotos: novaSugestao.fotos || [] }),
      });
      nova = { ...row, autorApto: row.autor_apto, autorNome: row.autor_nome, prestacaoContas: null, comentarios: [], orcamentos: [], sinalizacoes: [], fotos: row.fotos || [] };
      await sb('votos_sugestao', { method: 'POST', body: JSON.stringify({ sugestao_id: row.id, apto: usuario.apto, nome: usuario.nome, tipo: 'pos' }), prefer: 'return=minimal' });
      setVotos(prev => ({ ...prev, [row.id]: [{ apto: usuario.apto, nome: usuario.nome, tipo: 'pos' }] }));
    } else {
      nova = { id: `local_${Date.now()}`, titulo: novaSugestao.titulo.trim(), descricao: novaSugestao.descricao.trim(), categoria: novaSugestao.categoria, status: 'ideia', autorApto: usuario.apto, autorNome: usuario.nome, data: new Date().toISOString().split('T')[0], comentarios: [], orcamentos: [], sinalizacoes: [], fotos: novaSugestao.fotos || [] };
      setVotos(prev => ({ ...prev, [nova.id]: [{ apto: usuario.apto, nome: usuario.nome, tipo: 'pos' }] }));
    }
    await salvarSugestoes([nova, ...sugestoes]);
    setNovaSugestao({ titulo: '', descricao: '', categoria: 'melhorias', fotos: [] });
    setAbrirNova(false);
  };

  // ---- COMENTÁRIO ----
  const adicionarComentario = async () => {
    if (!novoComentario.trim() || !detalheAberto) return;
    const meusComentarios = detalheAberto.comentarios.filter(c => c.autorApto === usuario.apto).length;
    if (meusComentarios >= MAX_COMENTARIOS_POR_SUGESTAO && !ehConselho) {
      alert(`Limite de ${MAX_COMENTARIOS_POR_SUGESTAO} comentários por morador nesta sugestão.`);
      return;
    }
    const bloqueada = verificarPalavrasBloqueadas(novoComentario);
    if (bloqueada) { alert(`Comentário menciona tema fora da convenção ("${bloqueada}").`); return; }

    const novo = { autorApto: usuario.apto, autorNome: usuario.nome, texto: novoComentario.trim(), data: new Date().toISOString().split('T')[0] };
    if (usandoSupabase) {
      await sb('comentarios', { method: 'POST', body: JSON.stringify({ sugestao_id: detalheAberto.id, autor_apto: usuario.apto, autor_nome: usuario.nome, texto: novoComentario.trim(), data: novo.data }), prefer: 'return=minimal' });
    }
    const novos = sugestoes.map(s => s.id !== detalheAberto.id ? s : { ...s, comentarios: [...s.comentarios, novo] });
    await salvarSugestoes(novos);
    setNovoComentario('');
  };

  const removerComentario = async (idx) => {
    if (!confirm('Remover este comentário?')) return;
    const novos = sugestoes.map(s => s.id !== detalheAberto.id ? s : { ...s, comentarios: s.comentarios.filter((_, i) => i !== idx) });
    await salvarSugestoes(novos);
  };

  // ---- STATUS ----
  const mudarStatus = async (id, novoStatus) => {
    if (usandoSupabase) {
      await sb(`sugestoes?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: novoStatus }), prefer: 'return=minimal' });
    }
    await salvarSugestoes(sugestoes.map(s => s.id === id ? { ...s, status: novoStatus } : s));
  };

  const arquivar = async (id, motivo) => {
    const data = { status: 'arquivado', motivoArquivamento: motivo, arquivadoEm: new Date().toISOString().split('T')[0], arquivadoPor: `${usuario.nome} — Apto ${usuario.apto}` };
    if (usandoSupabase) {
      await sb(`sugestoes?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'arquivado', motivo_arquivamento: motivo }), prefer: 'return=minimal' });
    }
    await salvarSugestoes(sugestoes.map(s => s.id === id ? { ...s, ...data } : s));
    setDetalheAberto(null);
  };

  // ---- SINALIZAR ----
  const sinalizarSugestao = async () => {
    if (!motivoSin.trim() || !sinalizando) return;
    const sin = { autorApto: usuario.apto, autorNome: usuario.nome, motivo: motivoSin.trim(), data: new Date().toISOString().split('T')[0] };
    if (usandoSupabase) {
      await sb('sinalizacoes', { method: 'POST', body: JSON.stringify({ sugestao_id: sinalizando.id, autor_apto: usuario.apto, autor_nome: usuario.nome, motivo: motivoSin.trim(), data: sin.data }), prefer: 'return=minimal' });
    }
    const novos = sugestoes.map(s => s.id !== sinalizando.id ? s : { ...s, sinalizacoes: [...(s.sinalizacoes || []), sin] });
    await salvarSugestoes(novos);
    setMotivoSin('');
    setSinalizando(null);
    alert('Sinalização enviada ao conselho. Obrigado.');
  };

  // ---- ORÇAMENTOS ----
  const adicionarOrcamento = async () => {
    if (!novoOrc.empresa.trim() || !novoOrc.valor) return;
    const orc = { empresa: novoOrc.empresa.trim(), contato: novoOrc.contato, email: novoOrc.email, site: novoOrc.site, valor: parseFloat(novoOrc.valor), prazo: novoOrc.prazo, garantia: novoOrc.garantia, observacoes: novoOrc.observacoes, adicionadoPor: `${usuario.nome} — Apto ${usuario.apto}` };
    let orcComId = { ...orc, id: `orc_${Date.now()}` };
    if (usandoSupabase) {
      const [row] = await sb('orcamentos', { method: 'POST', body: JSON.stringify({ sugestao_id: detalheAberto.id, ...orc }) });
      orcComId = row;
    }
    const novos = sugestoes.map(s => s.id !== detalheAberto.id ? s : { ...s, orcamentos: [...s.orcamentos, orcComId] });
    await salvarSugestoes(novos);
    setNovoOrc({ empresa: '', contato: '', email: '', site: '', valor: '', prazo: '', garantia: '', observacoes: '' });
    setAbrirNovoOrc(false);
  };

  const removerOrcamento = async (orcId) => {
    if (!confirm('Remover este orçamento?')) return;
    if (usandoSupabase) await sb(`orcamentos?id=eq.${orcId}`, { method: 'DELETE', prefer: '' });
    const novos = sugestoes.map(s => s.id !== detalheAberto.id ? s : { ...s, orcamentos: s.orcamentos.filter(o => o.id !== orcId) });
    await salvarSugestoes(novos);
  };

  // ---- EXECUÇÃO ----
  const salvarExecucao = async () => {
    if (usandoSupabase) await sb(`sugestoes?id=eq.${detalheAberto.id}`, { method: 'PATCH', body: JSON.stringify({ execucao: execTemp }), prefer: 'return=minimal' });
    await salvarSugestoes(sugestoes.map(s => s.id !== detalheAberto.id ? s : { ...s, execucao: execTemp }));
    setEditarExec(false);
  };

  const adicionarAtualizacao = async () => {
    if (!novaAtualizacao.trim()) return;
    const execAtual = detalheAberto.execucao || { empresaContratada: '', valorContratado: 0, dataInicio: '', dataConclusaoPrevista: '', dataConclusaoReal: '', responsavel: '', atualizacoes: [] };
    const novaExec = { ...execAtual, atualizacoes: [...(execAtual.atualizacoes || []), { data: new Date().toISOString().split('T')[0], texto: novaAtualizacao.trim() }] };
    if (usandoSupabase) await sb(`sugestoes?id=eq.${detalheAberto.id}`, { method: 'PATCH', body: JSON.stringify({ execucao: novaExec }), prefer: 'return=minimal' });
    await salvarSugestoes(sugestoes.map(s => s.id !== detalheAberto.id ? s : { ...s, execucao: novaExec }));
    setNovaAtualizacao('');
  };

  // ---- CONTAS ----
  const salvarContas = async () => {
    if (usandoSupabase) await sb(`sugestoes?id=eq.${detalheAberto.id}`, { method: 'PATCH', body: JSON.stringify({ prestacao_contas: contasTemp }), prefer: 'return=minimal' });
    await salvarSugestoes(sugestoes.map(s => s.id !== detalheAberto.id ? s : { ...s, prestacaoContas: contasTemp }));
    setEditarContas(false);
  };

  // ---- CONSELHO ----
  const toggleConselheiro = async (apto) => {
    if (apto === 'SIND') return;
    let novo;
    if (conselho.includes(apto)) {
      novo = conselho.filter(a => a !== apto);
      if (usandoSupabase) await sb(`conselho?apto=eq.${apto}`, { method: 'DELETE', prefer: '' });
    } else {
      novo = [...conselho, apto];
      if (usandoSupabase) await sb('conselho', { method: 'POST', body: JSON.stringify({ apto }), prefer: 'return=minimal' });
    }
    setConselho(novo);
    if (!usandoSupabase) await salvarLocal('conselho_duock', novo, true);
  };

  // ---- FILTROS ----
  const sugestoesFiltradas = useMemo(() => {
    let f = sugestoes.filter(s => s.status !== 'arquivado' || filtroStatus === 'arquivado' || ehConselho);
    if (filtroCategoria !== 'todas') f = f.filter(s => s.categoria === filtroCategoria);
    if (filtroStatus !== 'todas') f = f.filter(s => s.status === filtroStatus);
    if (busca.trim()) { const b = busca.toLowerCase(); f = f.filter(s => s.titulo.toLowerCase().includes(b) || s.descricao.toLowerCase().includes(b)); }
    if (ordenacao === 'votos') f.sort((a, b) => (votos[b.id] || []).length - (votos[a.id] || []).length);
    if (ordenacao === 'recentes') f.sort((a, b) => new Date(b.data) - new Date(a.data));
    if (ordenacao === 'comentarios') f.sort((a, b) => b.comentarios.length - a.comentarios.length);
    return f;
  }, [sugestoes, votos, filtroCategoria, filtroStatus, ordenacao, busca, ehConselho]);

  const stats = useMemo(() => {
    const v = sugestoes.filter(s => s.status !== 'arquivado');
    return {
      total: v.length,
      debate: v.filter(s => ['ideia', 'votacao'].includes(s.status)).length,
      andamento: v.filter(s => ['orcando', 'aprovado', 'agendado', 'execucao'].includes(s.status)).length,
      concluidas: v.filter(s => s.status === 'concluido').length,
      investido: v.reduce((a, s) => a + (s.prestacaoContas?.valorFinalPago || 0), 0),
      emExec: v.filter(s => ['aprovado', 'agendado', 'execucao'].includes(s.status)).reduce((a, s) => a + (s.execucao?.valorContratado || 0), 0),
      sinalizadas: sugestoes.filter(s => (s.sinalizacoes || []).length > 0 && s.status !== 'arquivado').length,
    };
  }, [sugestoes]);

  const pipelineCols = useMemo(() => {
    const cols = {};
    STATUS.filter(s => s.id !== 'rejeitado' && s.id !== 'arquivado').forEach(s => { cols[s.id] = sugestoes.filter(su => su.status === s.id); });
    return cols;
  }, [sugestoes]);

  const aptosAtivos = useMemo(() => {
    const set = new Set();
    sugestoes.forEach(s => {
      set.add(s.autorApto);
      (votos[s.id] || []).forEach(v => set.add(v.apto));
      s.comentarios.forEach(c => set.add(c.autorApto));
    });
    return Array.from(set).filter(a => a && a !== 'SIND' && a !== '—').sort();
  }, [sugestoes, votos]);

  const sinalizadas = sugestoes.filter(s => (s.sinalizacoes || []).length > 0 && s.status !== 'arquivado');
  const arquivadas = sugestoes.filter(s => s.status === 'arquivado');

  // Estilos base
  const card = { background: COR.branco, border: `1px solid ${COR.cinza200}`, borderRadius: 10, padding: 20, marginBottom: 12, cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' };
  const input = { width: '100%', padding: '10px 14px', border: `1.5px solid ${COR.cinza200}`, borderRadius: 6, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: COR.cinza700 };
  const label = { display: 'block', fontSize: 11, fontWeight: 600, color: COR.cinza400, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 };

  // ============ LOGIN ============
  if (!usuario) {
    return (
      <div style={{ minHeight: '100vh', background: COR.cinza100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
        <div style={{ background: COR.branco, borderRadius: 16, padding: 48, maxWidth: 420, width: '100%', boxShadow: '0 4px 32px rgba(27,45,79,0.10)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <LogoDuoCK size={28} />
            <div style={{ marginTop: 16, fontSize: 20, fontWeight: 700, color: COR.azul, letterSpacing: '-0.02em' }}>Voz do Condomínio</div>
            <div style={{ fontSize: 13, color: COR.cinza400, marginTop: 4 }}>Canal oficial de sugestões e melhorias</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={label}>Seu nome</label>
            <input style={input} value={nomeInput} onChange={e => setNomeInput(e.target.value)} placeholder="Seu nome completo" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={label}>Apartamento</label>
            <input style={input} value={aptoInput} onChange={e => setAptoInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && fazerLogin()} placeholder="Número do apartamento" />
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: COR.cinza700, cursor: 'pointer', marginBottom: 24, lineHeight: 1.5 }}>
            <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} style={{ marginTop: 2, accentColor: COR.azul, flexShrink: 0 }} />
            Concordo em usar este canal com respeito. Sugestões ofensivas ou fora da convenção poderão ser arquivadas pelo conselho. <strong>Um voto por apartamento.</strong>
          </label>

          <button
            onClick={fazerLogin}
            disabled={!nomeInput.trim() || !aptoInput.trim() || !aceitouTermos}
            style={{ width: '100%', padding: '13px', background: !nomeInput.trim() || !aptoInput.trim() || !aceitouTermos ? COR.cinza200 : COR.azul, color: !nomeInput.trim() || !aptoInput.trim() || !aceitouTermos ? COR.cinza400 : '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: !nomeInput.trim() || !aptoInput.trim() || !aceitouTermos ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em' }}
          >
            Entrar
          </button>

          <div style={{ textAlign: 'center', fontSize: 11, color: COR.cinza400, marginTop: 20 }}>
            Sem senha · Identificação visível · Um voto por apto
          </div>
        </div>
      </div>
    );
  }

  // ============ APP PRINCIPAL ============
  return (
    <div style={{ minHeight: '100vh', background: COR.cinza100, fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>

      {/* HEADER */}
      <header style={{ background: COR.azul, borderBottom: `3px solid ${COR.vinho}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <LogoDuoCK size={22} />
              <div>
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Voz do Condomínio</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Canal oficial de sugestões</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} />
                {usuario.nome} · Apto {usuario.apto}
                {ehConselho && <span style={{ background: COR.vinho, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Conselho</span>}
              </div>
              {ehConselho && (
                <button onClick={() => setModoConselho(!modoConselho)} style={{ background: modoConselho ? COR.vinho : 'rgba(255,255,255,0.1)', color: '#fff', border: `1px solid ${modoConselho ? COR.vinho : 'rgba(255,255,255,0.25)'}`, borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                  {modoConselho ? <Eye size={13} /> : <EyeOff size={13} />}
                  {modoConselho ? 'Conselho ativo' : 'Modo conselho'}
                </button>
              )}
              <button onClick={sair} style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>Sair</button>
            </div>
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, paddingBottom: 20 }}>
            {[
              { label: 'Total', valor: stats.total, Icon: TrendingUp, col: 1 },
              { label: 'Em debate', valor: stats.debate, Icon: Clock, col: 1 },
              { label: 'Em andamento', valor: stats.andamento, Icon: Wrench, col: 1 },
              { label: 'Concluídas', valor: stats.concluidas, Icon: CheckCircle2, col: 1 },
              { label: 'Já investido', valor: formatBRL(stats.investido), Icon: Award, col: 2 },
              { label: 'Em execução', valor: formatBRL(stats.emExec), Icon: CircleDollarSign, col: 2 },
            ].map(({ label, valor, Icon, col }) => (
              <div key={label} style={{ gridColumn: `span ${col}`, background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={18} color={COR.teal} />
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{valor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: COR.cinza400 }}>Carregando sugestões...</div>
        )}

        {!loading && (
          <>
            {/* BARRA DE AÇÕES */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: COR.branco, border: `1px solid ${COR.cinza200}`, borderRadius: 6, overflow: 'hidden' }}>
                {['lista', 'pipeline'].map(v => (
                  <button key={v} onClick={() => setVisualizacao(v)} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, background: visualizacao === v ? COR.azul : 'transparent', color: visualizacao === v ? '#fff' : COR.cinza400, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                    {v === 'lista' ? 'Lista' : 'Pipeline'}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1 }}></div>
              <Btn onClick={() => { setAbrirNova(true); setAvisoNova(''); }} cor="teal"><Plus size={16} /> Nova sugestão</Btn>
              {modoConselho && <Btn onClick={() => setAbrirModeracao(true)} cor="vinho"><UserCog size={16} /> Moderação {stats.sinalizadas > 0 && `(${stats.sinalizadas})`}</Btn>}
              {modoConselho && (
                <Btn onClick={() => {
                  const html = `<html><head><title>Relatório Duo CK</title></head><body style="font-family:Arial;max-width:800px;margin:0 auto;padding:2rem">
                  <h1 style="color:#1B2D4F">Voz do Condomínio — Duo CK</h1>
                  <p>Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
                  ${sugestoes.filter(s=>s.status!=='arquivado').map(s=>{const v=contarVotos(votos[s.id]||[]);return`<div style="border-left:3px solid #1B2D4F;padding:12px;margin:16px 0;background:#f9f9f9"><strong>${s.titulo}</strong><br>Por ${s.autorNome} — Apto ${s.autorApto} · ${s.status}<br>${v.positivos} a favor · ${v.negativos} contra · ${v.total}/${TOTAL_APARTAMENTOS} votaram<br><em>${s.descricao}</em></div>`}).join('')}
                  </body></html>`;
                  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], {type:'text/html'})); a.download = 'relatorio-duock.html'; a.click();
                }} cor="azul"><Download size={16} /> Relatório</Btn>
              )}
            </div>

            {visualizacao === 'lista' && (
              <>
                {/* FILTROS */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: COR.cinza400 }} />
                    <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar sugestão..." style={{ ...input, paddingLeft: 36 }} />
                  </div>
                  <select value={ordenacao} onChange={e => setOrdenacao(e.target.value)} style={{ ...input, width: 'auto', cursor: 'pointer' }}>
                    <option value="recentes">Mais recentes</option>
                    <option value="votos">Mais participação</option>
                    <option value="comentarios">Mais comentadas</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }}>
                  {[{ id: 'todas', label: 'Todas', icon: null }, ...CATEGORIES].map(cat => {
                    const ativo = filtroCategoria === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button key={cat.id} onClick={() => setFiltroCategoria(cat.id)} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${ativo ? COR.azul : COR.cinza200}`, background: ativo ? COR.azul : COR.branco, color: ativo ? '#fff' : COR.cinza700, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        {Icon && <Icon size={13} />} {cat.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
                  {[{ id: 'todas', label: 'Qualquer etapa' }, ...STATUS.filter(s => ehConselho || s.id !== 'arquivado')].map(st => {
                    const ativo = filtroStatus === st.id;
                    return (
                      <button key={st.id} onClick={() => setFiltroStatus(st.id)} style={{ flexShrink: 0, padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${ativo ? COR.azul : COR.cinza200}`, background: ativo ? COR.azul : 'transparent', color: ativo ? '#fff' : COR.cinza400, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        {st.label}
                      </button>
                    );
                  })}
                </div>

                {/* CARDS */}
                {sugestoesFiltradas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, color: COR.cinza400 }}>Nenhuma sugestão encontrada.</div>
                ) : sugestoesFiltradas.map(s => {
                  const cat = CATEGORIES.find(c => c.id === s.categoria);
                  const Icon = cat?.icon || MoreHorizontal;
                  const v = contarVotos(votos[s.id] || []);
                  const meuVoto = (votos[s.id] || []).find(vv => vv.apto === usuario.apto)?.tipo;
                  const placarVisivel = STATUS_PLACAR_VISIVEL.includes(s.status) || modoConselho;
                  const pct = Math.min(100, Math.round((v.total / TOTAL_APARTAMENTOS) * 100));
                  const foiSinalizada = (s.sinalizacoes || []).length > 0;
                  return (
                    <div key={s.id} onClick={() => { setDetalheAberto(s); setAbaDetalhe('detalhes'); }} style={{ ...card, borderColor: foiSinalizada && modoConselho ? '#FCA5A5' : s.status === 'arquivado' ? COR.cinza200 : COR.cinza200, opacity: s.status === 'arquivado' ? 0.6 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = COR.teal}
                      onMouseLeave={e => e.currentTarget.style.borderColor = foiSinalizada && modoConselho ? '#FCA5A5' : COR.cinza200}
                    >
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        {/* Participação */}
                        <div style={{ textAlign: 'center', minWidth: 52, flexShrink: 0 }}>
                          {placarVisivel ? (
                            <>
                              <div style={{ fontSize: 22, fontWeight: 800, color: COR.azul, letterSpacing: '-0.03em' }}>{v.positivos >= v.negativos ? '+' : ''}{v.positivos - v.negativos}</div>
                              <div style={{ fontSize: 10, color: COR.cinza400 }}>{v.positivos}↑ {v.negativos}↓</div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: 22, fontWeight: 800, color: COR.azul, letterSpacing: '-0.03em' }}>{v.total}</div>
                              <div style={{ fontSize: 10, color: COR.cinza400 }}>de {TOTAL_APARTAMENTOS}</div>
                              <div style={{ height: 3, background: COR.cinza200, borderRadius: 2, marginTop: 4 }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: COR.teal, borderRadius: 2 }}></div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: COR.azulLight, color: COR.azul, borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>
                              <Icon size={11} /> {cat?.label}
                            </span>
                            <Badge status={s.status} />
                            {s.orcamentos.length > 0 && <span style={{ background: COR.vinhoLight, color: COR.vinho, borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Briefcase size={11} /> {s.orcamentos.length} orç.</span>}
                            {s.prestacaoContas && <span style={{ background: '#D1FAE5', color: '#065F46', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><FileCheck size={11} /> {formatBRL(s.prestacaoContas.valorFinalPago)}</span>}
                            {(s.fotos || []).length > 0 && <span style={{ background: COR.tealLight, color: COR.teal, borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Camera size={11} /> {s.fotos.length}</span>}
                            {meuVoto && <span style={{ background: meuVoto === 'pos' ? '#D1FAE5' : '#FEE2E2', color: meuVoto === 'pos' ? '#065F46' : '#991B1B', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>{meuVoto === 'pos' ? '✓ Concordou' : '✗ Discordou'}</span>}
                            {foiSinalizada && modoConselho && <span style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 4, padding: '3px 8px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Flag size={11} /> {s.sinalizacoes.length}</span>}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: COR.azul, marginBottom: 6, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{s.titulo}</div>
                          <div style={{ fontSize: 13, color: COR.cinza700, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: 10, lineHeight: 1.5 }}>{s.descricao}</div>
                          <div style={{ fontSize: 12, color: COR.cinza400, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span>{s.autorNome} — Apto {s.autorApto}</span>
                            <span>·</span>
                            <span>{new Date(s.data).toLocaleDateString('pt-BR')}</span>
                            <span>·</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MessageCircle size={12} /> {s.comentarios.length}</span>
                          </div>
                        </div>

                        {/* Botões de voto */}
                        {['ideia', 'votacao'].includes(s.status) && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => votar(s.id, 'pos')} style={{ padding: '8px 12px', border: `1.5px solid ${meuVoto === 'pos' ? COR.teal : COR.cinza200}`, borderRadius: 6, background: meuVoto === 'pos' ? COR.teal : COR.branco, color: meuVoto === 'pos' ? '#fff' : COR.cinza400, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ThumbsUp size={16} /></button>
                            <button onClick={() => votar(s.id, 'neg')} style={{ padding: '8px 12px', border: `1.5px solid ${meuVoto === 'neg' ? COR.vinho : COR.cinza200}`, borderRadius: 6, background: meuVoto === 'neg' ? COR.vinho : COR.branco, color: meuVoto === 'neg' ? '#fff' : COR.cinza400, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ThumbsDown size={16} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {visualizacao === 'pipeline' && (
              <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
                  {STATUS.filter(s => s.id !== 'rejeitado' && s.id !== 'arquivado').map(st => {
                    const itens = pipelineCols[st.id] || [];
                    return (
                      <div key={st.id} style={{ width: 240, flexShrink: 0 }}>
                        <div style={{ background: st.bg, color: st.text, borderRadius: 6, padding: '8px 12px', marginBottom: 8, fontSize: 12, fontWeight: 700, display: 'flex', justifyContent: 'space-between', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          <span>{st.label}</span>
                          <span style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '0 8px' }}>{itens.length}</span>
                        </div>
                        <div>
                          {itens.length === 0 ? (
                            <div style={{ border: `1.5px dashed ${COR.cinza200}`, borderRadius: 8, padding: 16, textAlign: 'center', fontSize: 12, color: COR.cinza400 }}>Vazio</div>
                          ) : itens.map(s => {
                            const cat = CATEGORIES.find(c => c.id === s.categoria);
                            const Icon = cat?.icon || MoreHorizontal;
                            const v = contarVotos(votos[s.id] || []);
                            return (
                              <div key={s.id} onClick={() => { setDetalheAberto(s); setAbaDetalhe('detalhes'); }} style={{ background: COR.branco, border: `1px solid ${COR.cinza200}`, borderRadius: 8, padding: 12, marginBottom: 8, cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = COR.teal}
                                onMouseLeave={e => e.currentTarget.style.borderColor = COR.cinza200}
                              >
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: COR.azulLight, color: COR.azul, borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 600, marginBottom: 6 }}>
                                  <Icon size={10} /> {cat?.label}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: COR.azul, marginBottom: 6, lineHeight: 1.3 }}>{s.titulo}</div>
                                <div style={{ fontSize: 11, color: COR.cinza400 }}>{v.total}/{TOTAL_APARTAMENTOS} votaram {s.orcamentos.length > 0 && `· ${s.orcamentos.length} orç.`}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', fontSize: 12, color: COR.cinza400, marginTop: 48, paddingTop: 24, borderTop: `1px solid ${COR.cinza200}` }}>
              Voz do Condomínio · Duo CK · {usandoSupabase ? '🟢 Conectado ao banco' : '🟡 Modo protótipo (dados temporários)'} · Um voto por apartamento
            </div>
          </>
        )}
      </main>

      {/* MODAL NOVA SUGESTÃO */}
      {abrirNova && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,45,79,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => setAbrirNova(false)}>
          <div style={{ background: COR.branco, borderRadius: 16, padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 48px rgba(27,45,79,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: COR.azul }}>Nova sugestão</div>
              <button onClick={() => setAbrirNova(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COR.cinza400 }}><X size={20} /></button>
            </div>

            <div style={{ background: COR.tealLight, borderLeft: `3px solid ${COR.teal}`, borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: COR.teal }}>
              Sua sugestão ficará visível para todos os {TOTAL_APARTAMENTOS} apartamentos, identificada com seu nome e apto.
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Título</label>
              <input style={input} value={novaSugestao.titulo} onChange={e => setNovaSugestao({...novaSugestao, titulo: e.target.value})} placeholder="Ex: Trocar portões da garagem" maxLength={80} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Categoria</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const ativo = novaSugestao.categoria === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setNovaSugestao({...novaSugestao, categoria: cat.id})} style={{ padding: '10px 6px', border: `1.5px solid ${ativo ? COR.teal : COR.cinza200}`, borderRadius: 8, background: ativo ? COR.tealLight : COR.branco, color: ativo ? COR.teal : COR.cinza700, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                      <Icon size={16} /> {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={label}>Descrição (mín. {MIN_CARACTERES_DESCRICAO} caracteres)</label>
              <textarea value={novaSugestao.descricao} onChange={e => setNovaSugestao({...novaSugestao, descricao: e.target.value})} placeholder="Descreva o problema ou ideia com detalhes. Quanto mais contexto, mais chance de engajar os vizinhos." maxLength={800} style={{ ...input, minHeight: 120, resize: 'vertical' }} />
              <div style={{ textAlign: 'right', fontSize: 11, color: novaSugestao.descricao.length < MIN_CARACTERES_DESCRICAO ? '#DC2626' : COR.teal, marginTop: 4 }}>
                {novaSugestao.descricao.length}/{MIN_CARACTERES_DESCRICAO} mín.
              </div>
            </div>

            {avisoNova && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} /> {avisoNova}
              </div>
            )}

            {/* PAINEL DE FOTOS - NOVA SUGESTÃO */}
            <PainelFotos
              fotos={novaSugestao.fotos || []}
              linkFoto={linkFoto}
              setLinkFoto={setLinkFoto}
              uploadando={uploadandoFoto}
              onAdicionarLink={() => adicionarFotoLink(novaSugestao, setNovaSugestao)}
              onUpload={(e) => adicionarFotoUpload(e, novaSugestao, setNovaSugestao)}
              onRemover={(idx) => removerFoto(idx, novaSugestao, setNovaSugestao)}
              onAmplia={setFotoAmpliada}
              COR={COR}
              input={input}
              label={label}
            />

            <button onClick={criarSugestao} disabled={!novaSugestao.titulo.trim() || !novaSugestao.descricao.trim()} style={{ width: '100%', padding: 13, background: !novaSugestao.titulo.trim() || !novaSugestao.descricao.trim() ? COR.cinza200 : COR.teal, color: !novaSugestao.titulo.trim() || !novaSugestao.descricao.trim() ? COR.cinza400 : '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: !novaSugestao.titulo.trim() || !novaSugestao.descricao.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              Publicar sugestão
            </button>
          </div>
        </div>
      )}

      {/* MODAL SINALIZAR */}
      {sinalizando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,45,79,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60 }} onClick={() => setSinalizando(null)}>
          <div style={{ background: COR.branco, borderRadius: 16, padding: 28, maxWidth: 440, width: '100%', boxShadow: '0 8px 48px rgba(27,45,79,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: COR.vinho, display: 'flex', alignItems: 'center', gap: 8 }}><Flag size={16} /> Sinalizar sugestão</div>
              <button onClick={() => setSinalizando(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COR.cinza400 }}><X size={18} /></button>
            </div>
            <div style={{ fontSize: 13, color: COR.cinza700, marginBottom: 4 }}>Sinalizando: <strong>"{sinalizando.titulo}"</strong></div>
            <div style={{ fontSize: 12, color: COR.cinza400, marginBottom: 12 }}>Sua identidade fica registrada para evitar sinalizações abusivas.</div>
            <textarea value={motivoSin} onChange={e => setMotivoSin(e.target.value)} placeholder="Por que está sinalizando? (ex: fora da convenção, conteúdo ofensivo, ataque pessoal...)" style={{ ...input, minHeight: 90, resize: 'vertical', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={sinalizarSugestao} disabled={!motivoSin.trim()} style={{ flex: 1, padding: 10, background: !motivoSin.trim() ? COR.cinza200 : COR.vinho, color: !motivoSin.trim() ? COR.cinza400 : '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: !motivoSin.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Enviar sinalização</button>
              <Btn onClick={() => setSinalizando(null)} cor="cinza">Cancelar</Btn>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODERAÇÃO */}
      {abrirModeracao && ehConselho && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,45,79,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50, overflowY: 'auto' }} onClick={() => setAbrirModeracao(false)}>
          <div style={{ background: COR.branco, borderRadius: 16, padding: 32, maxWidth: 800, width: '100%', maxHeight: '90vh', overflowY: 'auto', margin: '32px auto', boxShadow: '0 8px 48px rgba(27,45,79,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: COR.azul, display: 'flex', alignItems: 'center', gap: 8 }}><UserCog size={20} /> Painel de moderação</div>
              <button onClick={() => setAbrirModeracao(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COR.cinza400 }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COR.vinho, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Flag size={13} /> Sinalizadas ({sinalizadas.length})</div>
              {sinalizadas.length === 0 ? <p style={{ fontSize: 13, color: COR.cinza400, fontStyle: 'italic' }}>Nenhuma sinalização pendente.</p> : sinalizadas.map(s => (
                <div key={s.id} style={{ border: `1px solid #FECACA`, borderRadius: 8, padding: 14, marginBottom: 8, background: '#FEF2F2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, color: COR.azul }}>{s.titulo}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" cor="azul" onClick={() => { setAbrirModeracao(false); setDetalheAberto(s); setAbaDetalhe('detalhes'); }}>Ver</Btn>
                      <Btn size="sm" cor="vinho" onClick={() => { if (confirm('Arquivar esta sugestão?')) arquivar(s.id, 'Arquivada após sinalizações da comunidade'); }}>Arquivar</Btn>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: COR.cinza700, marginBottom: 6, fontStyle: 'italic' }}>Por {s.autorNome} — Apto {s.autorApto}</div>
                  {(s.sinalizacoes || []).map((sin, i) => (
                    <div key={i} style={{ background: COR.branco, borderLeft: `3px solid ${COR.vinho}`, padding: '6px 10px', marginBottom: 4, fontSize: 12, color: COR.cinza700, borderRadius: 4 }}>
                      <strong>{sin.autorNome} — Apto {sin.autorApto}</strong>: {sin.motivo}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COR.cinza700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Archive size={13} /> Arquivadas ({arquivadas.length})</div>
              {arquivadas.length === 0 ? <p style={{ fontSize: 13, color: COR.cinza400, fontStyle: 'italic' }}>Nenhuma sugestão arquivada.</p> : arquivadas.map(s => (
                <div key={s.id} style={{ border: `1px solid ${COR.cinza200}`, borderRadius: 8, padding: 12, marginBottom: 6, background: COR.cinza100, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: COR.cinza700 }}>{s.titulo}</div>
                    <div style={{ fontSize: 11, color: COR.cinza400 }}>Por {s.autorNome} — Apto {s.autorApto} {s.motivoArquivamento && `· ${s.motivoArquivamento}`}</div>
                  </div>
                  <Btn size="sm" cor="cinza" onClick={() => { if (confirm('Restaurar esta sugestão?')) mudarStatus(s.id, 'ideia'); }}>Restaurar</Btn>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COR.azul, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Users size={13} /> Membros do conselho</div>
              <div style={{ background: COR.azulLight, borderRadius: 6, padding: '8px 12px', fontSize: 12, color: COR.azul, marginBottom: 12 }}>O Síndico (SIND) sempre tem acesso. Marque outros aptos abaixo.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {aptosAtivos.map(apto => {
                  const ehC = conselho.includes(apto);
                  return (
                    <button key={apto} onClick={() => toggleConselheiro(apto)} style={{ padding: '6px 14px', border: `1.5px solid ${ehC ? COR.azul : COR.cinza200}`, borderRadius: 6, background: ehC ? COR.azul : COR.branco, color: ehC ? '#fff' : COR.cinza700, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Apto {apto} {ehC && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHE */}
      {detalheAberto && (() => {
        const cat = CATEGORIES.find(c => c.id === detalheAberto.categoria);
        const Icon = cat?.icon || MoreHorizontal;
        const v = contarVotos(votos[detalheAberto.id] || []);
        const meuVoto = (votos[detalheAberto.id] || []).find(vv => vv.apto === usuario.apto)?.tipo;
        const placarVisivel = STATUS_PLACAR_VISIVEL.includes(detalheAberto.status) || modoConselho;
        const podeVotar = ['ideia', 'votacao'].includes(detalheAberto.status);
        let meuVotoOrc = votosOrc[detalheAberto.id] || null;
        const orcsOrdenados = [...detalheAberto.orcamentos].sort((a, b) => (Object.keys(b.votosPorApto||{}).length || 0) - (Object.keys(a.votosPorApto||{}).length || 0));
        const menorValor = detalheAberto.orcamentos.length > 0 ? Math.min(...detalheAberto.orcamentos.map(o => o.valor)) : 0;

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,45,79,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16, zIndex: 50, overflowY: 'auto' }} onClick={() => setDetalheAberto(null)}>
            <div style={{ background: COR.branco, borderRadius: 16, padding: 32, maxWidth: 760, width: '100%', margin: '32px auto', boxShadow: '0 8px 48px rgba(27,45,79,0.2)' }} onClick={e => e.stopPropagation()}>

              {/* Header modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ background: COR.azulLight, color: COR.azul, borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon size={11} /> {cat?.label}</span>
                  <Badge status={detalheAberto.status} />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {detalheAberto.status !== 'arquivado' && !modoConselho && (
                    <button onClick={() => setSinalizando(detalheAberto)} style={{ background: 'none', border: 'none', color: COR.cinza400, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}><Flag size={14} /> Sinalizar</button>
                  )}
                  <button onClick={() => setDetalheAberto(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COR.cinza400 }}><X size={20} /></button>
                </div>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: COR.azul, letterSpacing: '-0.02em', marginBottom: 8, lineHeight: 1.2 }}>{detalheAberto.titulo}</div>
              <div style={{ fontSize: 12, color: COR.cinza400, marginBottom: 24 }}>{detalheAberto.autorNome} — Apto {detalheAberto.autorApto} · {new Date(detalheAberto.data).toLocaleDateString('pt-BR')}</div>

              {/* ABAS */}
              <div style={{ display: 'flex', borderBottom: `2px solid ${COR.cinza200}`, marginBottom: 24, overflowX: 'auto', gap: 4 }}>
                {[
                  { id: 'detalhes', label: 'Detalhes', Icon: MessageCircle },
                  { id: 'orcamentos', label: `Orçamentos (${detalheAberto.orcamentos.length})`, Icon: Briefcase },
                  { id: 'execucao', label: 'Execução', Icon: Calendar },
                  { id: 'contas', label: 'Contas', Icon: FileCheck },
                ].map(aba => (
                  <button key={aba.id} onClick={() => setAbaDetalhe(aba.id)} style={{ padding: '8px 16px', border: 'none', borderBottom: `2px solid ${abaDetalhe === aba.id ? COR.teal : 'transparent'}`, background: 'transparent', color: abaDetalhe === aba.id ? COR.teal : COR.cinza400, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', whiteSpace: 'nowrap', marginBottom: -2 }}>
                    <aba.Icon size={14} /> {aba.label}
                  </button>
                ))}
              </div>

              {/* ABA DETALHES */}
              {abaDetalhe === 'detalhes' && (
                <div>
                  <p style={{ fontSize: 14, color: COR.cinza700, lineHeight: 1.7, marginBottom: 16 }}>{detalheAberto.descricao}</p>

                  {/* GALERIA DE FOTOS */}
                  <GaleriaFotos fotos={detalheAberto.fotos || []} onAmplia={setFotoAmpliada} COR={COR} />

                  {/* BOTÕES EDITAR / APAGAR (só autor, só sem votos de outros) */}
                  {podEditarApagar(detalheAberto) && detalheAberto.status !== 'arquivado' && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20, padding: '12px 14px', background: COR.azulLight, borderRadius: 8, alignItems: 'center' }}>
                      <div style={{ fontSize: 12, color: COR.azul, flex: 1 }}>Esta é a sua sugestão e ainda não tem votos de outros moradores.</div>
                      <button
                        onClick={() => setEditandoSugestao({ ...detalheAberto })}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: `1.5px solid ${COR.azul}`, borderRadius: 6, background: COR.branco, color: COR.azul, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        <Edit2 size={13} /> Editar
                      </button>
                      <button
                        onClick={() => apagarSugestao(detalheAberto.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: `1.5px solid ${COR.vinho}`, borderRadius: 6, background: COR.branco, color: COR.vinho, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        <Trash2 size={13} /> Apagar
                      </button>
                    </div>
                  )}

                  {detalheAberto.status === 'arquivado' && (
                    <div style={{ background: COR.cinza100, border: `1px solid ${COR.cinza200}`, borderRadius: 8, padding: 14, marginBottom: 20 }}>
                      <div style={{ fontWeight: 700, color: COR.cinza700, fontSize: 13, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Archive size={14} /> Sugestão arquivada</div>
                      <div style={{ fontSize: 12, color: COR.cinza400 }}>{detalheAberto.motivoArquivamento || 'Arquivada pelo conselho'}</div>
                    </div>
                  )}

                  {/* Votação */}
                  {podeVotar ? (
                    <div style={{ borderTop: `1px solid ${COR.cinza200}`, paddingTop: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                        <button onClick={() => votar(detalheAberto.id, 'pos')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: `1.5px solid ${meuVoto === 'pos' ? COR.teal : COR.cinza200}`, borderRadius: 8, background: meuVoto === 'pos' ? COR.teal : COR.branco, color: meuVoto === 'pos' ? '#fff' : COR.cinza700, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}><ThumbsUp size={16} /> Concordo</button>
                        <button onClick={() => votar(detalheAberto.id, 'neg')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: `1.5px solid ${meuVoto === 'neg' ? COR.vinho : COR.cinza200}`, borderRadius: 8, background: meuVoto === 'neg' ? COR.vinho : COR.branco, color: meuVoto === 'neg' ? '#fff' : COR.cinza700, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}><ThumbsDown size={16} /> Discordo</button>
                        {meuVoto && <span style={{ fontSize: 12, color: COR.cinza400, fontStyle: 'italic' }}>Clique novamente para retirar o voto.</span>}
                      </div>
                      <div style={{ fontSize: 13, color: COR.cinza700 }}>
                        {placarVisivel ? <><strong>{v.positivos}</strong> a favor · <strong>{v.negativos}</strong> contra · <strong>{v.total}/{TOTAL_APARTAMENTOS}</strong> aptos participaram</> : <><strong>{v.total}/{TOTAL_APARTAMENTOS}</strong> apartamentos votaram. O placar fica oculto enquanto em debate.</>}
                      </div>
                    </div>
                  ) : (
                    <div style={{ borderTop: `1px solid ${COR.cinza200}`, paddingTop: 20, marginBottom: 20 }}>
                      <div style={{ fontSize: 13, color: COR.cinza400, fontStyle: 'italic', marginBottom: 8 }}>Votação encerrada — sugestão saiu da fase de debate.</div>
                      {placarVisivel && <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: COR.teal }}><ThumbsUp size={14} /> <strong>{v.positivos}</strong></span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: COR.vinho }}><ThumbsDown size={14} /> <strong>{v.negativos}</strong></span>
                        <span style={{ color: COR.cinza400, fontSize: 13 }}>({v.total}/{TOTAL_APARTAMENTOS} participaram)</span>
                      </div>}
                    </div>
                  )}

                  {/* Painel conselho */}
                  {modoConselho && (
                    <div style={{ background: COR.vinhoLight, border: `1px solid ${COR.vinho}20`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COR.vinho, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Ações do conselho</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {STATUS.map(st => (
                          <button key={st.id} onClick={() => mudarStatus(detalheAberto.id, st.id)} style={{ padding: '5px 12px', border: `1.5px solid ${detalheAberto.status === st.id ? COR.azul : COR.cinza200}`, borderRadius: 6, background: detalheAberto.status === st.id ? COR.azul : COR.branco, color: detalheAberto.status === st.id ? '#fff' : COR.cinza700, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{st.label}</button>
                        ))}
                      </div>
                      {detalheAberto.status !== 'arquivado' && (
                        <button onClick={() => { const m = prompt('Motivo do arquivamento:'); if (m) arquivar(detalheAberto.id, m); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: COR.vinho, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}><Ban size={13} /> Arquivar sugestão</button>
                      )}
                    </div>
                  )}

                  {/* Comentários */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COR.azul, marginBottom: 12 }}>Comentários ({detalheAberto.comentarios.length})</div>
                    {detalheAberto.comentarios.length === 0 && <p style={{ fontSize: 13, color: COR.cinza400, fontStyle: 'italic', marginBottom: 12 }}>Nenhum comentário ainda.</p>}
                    <div style={{ marginBottom: 12 }}>
                      {detalheAberto.comentarios.map((c, i) => (
                        <div key={i} style={{ background: COR.cinza100, borderLeft: `3px solid ${COR.teal}`, borderRadius: 6, padding: '10px 14px', marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: COR.azul }}>{c.autorNome} — Apto {c.autorApto}</span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: COR.cinza400 }}>{new Date(c.data).toLocaleDateString('pt-BR')}</span>
                              {modoConselho && <button onClick={() => removerComentario(i)} style={{ background: 'none', border: 'none', color: COR.vinho, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>remover</button>}
                            </div>
                          </div>
                          <p style={{ fontSize: 13, color: COR.cinza700, margin: 0, lineHeight: 1.5 }}>{c.texto}</p>
                        </div>
                      ))}
                    </div>
                    {detalheAberto.status !== 'arquivado' && (
                      <>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input value={novoComentario} onChange={e => setNovoComentario(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarComentario()} placeholder={`Comentar (máx. ${MAX_COMENTARIOS_POR_SUGESTAO} por morador)...`} style={{ ...input, flex: 1 }} />
                          <Btn onClick={adicionarComentario} disabled={!novoComentario.trim()} cor="teal">Enviar</Btn>
                        </div>
                        <div style={{ fontSize: 11, color: COR.cinza400, marginTop: 6 }}>Seu nome fica visível. Máx. {MAX_COMENTARIOS_POR_SUGESTAO} comentários por sugestão.</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ABA ORÇAMENTOS */}
              {abaDetalhe === 'orcamentos' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 13, color: COR.cinza700 }}>{detalheAberto.orcamentos.length === 0 ? 'Nenhum orçamento cadastrado.' : `${detalheAberto.orcamentos.length} orçamento(s) · Menor: ${formatBRL(menorValor)}`}</div>
                    {modoConselho && <Btn onClick={() => setAbrirNovoOrc(true)} cor="teal" size="sm"><Plus size={14} /> Adicionar</Btn>}
                  </div>

                  {!modoConselho && detalheAberto.orcamentos.length === 0 && (
                    <p style={{ fontSize: 12, color: COR.cinza400, fontStyle: 'italic' }}>Apenas o conselho pode cadastrar orçamentos, garantindo curadoria das empresas.</p>
                  )}

                  {abrirNovoOrc && (
                    <div style={{ background: COR.tealLight, border: `1px solid ${COR.teal}30`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: COR.teal }}>Novo orçamento</div>
                        <button onClick={() => setAbrirNovoOrc(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COR.cinza400 }}><X size={16} /></button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        {[['empresa','Nome da empresa *'],['valor','Valor (R$) *'],['contato','Telefone'],['email','E-mail'],['site','Site'],['prazo','Prazo'],['garantia','Garantia']].map(([k,p]) => (
                          <input key={k} type={k==='valor'?'number':'text'} placeholder={p} value={novoOrc[k]} onChange={e => setNovoOrc({...novoOrc,[k]:e.target.value})} style={{...input, gridColumn: k==='garantia'?'span 2':'auto'}} />
                        ))}
                      </div>
                      <textarea placeholder="Observações, escopo..." value={novoOrc.observacoes} onChange={e => setNovoOrc({...novoOrc,observacoes:e.target.value})} style={{...input,minHeight:80,resize:'vertical',marginBottom:12}} />
                      <Btn onClick={adicionarOrcamento} disabled={!novoOrc.empresa.trim()||!novoOrc.valor} cor="teal">Cadastrar orçamento</Btn>
                    </div>
                  )}

                  <div>
                    {orcsOrdenados.map(o => {
                      const escolhido = meuVotoOrc === o.id;
                      const maisBarato = o.valor === menorValor && detalheAberto.orcamentos.length > 1;
                      return (
                        <div key={o.id} style={{ border: `1.5px solid ${escolhido ? COR.teal : COR.cinza200}`, borderRadius: 10, padding: 18, marginBottom: 12, background: escolhido ? COR.tealLight : COR.branco }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                            <div>
                              <div style={{ fontWeight: 700, color: COR.azul, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {o.empresa}
                                {maisBarato && <span style={{ background: COR.teal, color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em' }}>MENOR VALOR</span>}
                              </div>
                              <div style={{ fontSize: 24, fontWeight: 800, color: COR.azul, letterSpacing: '-0.03em', marginTop: 4 }}>{formatBRL(o.valor)}</div>
                            </div>
                            <button onClick={() => votarOrcamento(detalheAberto.id, o.id)} style={{ padding: '8px 16px', border: `1.5px solid ${escolhido ? COR.teal : COR.cinza200}`, borderRadius: 8, background: escolhido ? COR.teal : COR.branco, color: escolhido ? '#fff' : COR.cinza700, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              {escolhido ? '✓ Minha escolha' : 'Prefiro este'}
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, color: COR.cinza700, marginBottom: o.observacoes ? 10 : 0 }}>
                            {o.contato && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {o.contato}</span>}
                            {o.email && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {o.email}</span>}
                            {o.site && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={12} /> {o.site}</span>}
                            {o.prazo && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {o.prazo}</span>}
                            {o.garantia && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={12} /> {o.garantia}</span>}
                          </div>
                          {o.observacoes && <div style={{ background: COR.cinza100, borderRadius: 6, padding: '8px 12px', fontSize: 13, color: COR.cinza700, fontStyle: 'italic' }}>{o.observacoes}</div>}
                          {modoConselho && <button onClick={() => removerOrcamento(o.id)} style={{ background: 'none', border: 'none', color: COR.vinho, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>Remover orçamento</button>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ABA EXECUÇÃO */}
              {abaDetalhe === 'execucao' && (
                <div>
                  {!detalheAberto.execucao && !editarExec && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Calendar size={40} color={COR.cinza200} style={{ margin: '0 auto 12px' }} />
                      <p style={{ color: COR.cinza400, fontStyle: 'italic', marginBottom: 16 }}>Nenhuma execução agendada ainda.</p>
                      {modoConselho && <Btn onClick={() => { setExecTemp({ empresaContratada:'',valorContratado:0,dataInicio:'',dataConclusaoPrevista:'',dataConclusaoReal:'',responsavel:'',atualizacoes:[] }); setEditarExec(true); }} cor="teal">Agendar execução</Btn>}
                    </div>
                  )}
                  {editarExec && execTemp && (
                    <div style={{ background: COR.tealLight, borderRadius: 10, padding: 20, marginBottom: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: COR.teal, marginBottom: 14 }}>Dados da execução</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                        <input placeholder="Empresa contratada" value={execTemp.empresaContratada} onChange={e => setExecTemp({...execTemp,empresaContratada:e.target.value})} style={input} />
                        <input type="number" placeholder="Valor contratado (R$)" value={execTemp.valorContratado||''} onChange={e => setExecTemp({...execTemp,valorContratado:parseFloat(e.target.value)||0})} style={input} />
                        <div><label style={label}>Início</label><input type="date" value={execTemp.dataInicio} onChange={e => setExecTemp({...execTemp,dataInicio:e.target.value})} style={input} /></div>
                        <div><label style={label}>Previsão</label><input type="date" value={execTemp.dataConclusaoPrevista} onChange={e => setExecTemp({...execTemp,dataConclusaoPrevista:e.target.value})} style={input} /></div>
                        <div><label style={label}>Conclusão real</label><input type="date" value={execTemp.dataConclusaoReal} onChange={e => setExecTemp({...execTemp,dataConclusaoReal:e.target.value})} style={input} /></div>
                        <input placeholder="Responsável" value={execTemp.responsavel} onChange={e => setExecTemp({...execTemp,responsavel:e.target.value})} style={input} />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Btn onClick={salvarExecucao} cor="teal">Salvar</Btn>
                        <Btn onClick={() => setEditarExec(false)} cor="cinza">Cancelar</Btn>
                      </div>
                    </div>
                  )}
                  {detalheAberto.execucao && !editarExec && (
                    <div>
                      <div style={{ background: COR.azulLight, borderRadius: 10, padding: 20, marginBottom: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                          {[['Empresa',detalheAberto.execucao.empresaContratada],['Valor',formatBRL(detalheAberto.execucao.valorContratado)],['Início',detalheAberto.execucao.dataInicio?new Date(detalheAberto.execucao.dataInicio).toLocaleDateString('pt-BR'):'—'],['Previsão',detalheAberto.execucao.dataConclusaoPrevista?new Date(detalheAberto.execucao.dataConclusaoPrevista).toLocaleDateString('pt-BR'):'—'],['Concluído em',detalheAberto.execucao.dataConclusaoReal?new Date(detalheAberto.execucao.dataConclusaoReal).toLocaleDateString('pt-BR'):'Em andamento'],['Responsável',detalheAberto.execucao.responsavel||'—']].map(([k,v]) => (
                            <div key={k}><div style={{ fontSize: 10, color: COR.cinza400, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div><div style={{ fontWeight: 600, color: COR.azul }}>{v}</div></div>
                          ))}
                        </div>
                        {modoConselho && <button onClick={() => { setExecTemp(detalheAberto.execucao); setEditarExec(true); }} style={{ marginTop: 12, background: 'none', border: 'none', color: COR.teal, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Editar dados</button>}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: COR.azul, marginBottom: 10 }}>Atualizações de progresso</div>
                      {(!detalheAberto.execucao.atualizacoes||detalheAberto.execucao.atualizacoes.length===0) && <p style={{ fontSize: 13, color: COR.cinza400, fontStyle: 'italic' }}>Nenhuma atualização ainda.</p>}
                      {(detalheAberto.execucao.atualizacoes||[]).map((a,i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, background: COR.cinza100, borderLeft: `3px solid ${COR.azul}`, borderRadius: 6, padding: '8px 12px', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, color: COR.cinza400, flexShrink: 0, marginTop: 2 }}>{new Date(a.data).toLocaleDateString('pt-BR')}</span>
                          <p style={{ fontSize: 13, color: COR.cinza700, margin: 0 }}>{a.texto}</p>
                        </div>
                      ))}
                      {modoConselho && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <input value={novaAtualizacao} onChange={e => setNovaAtualizacao(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarAtualizacao()} placeholder="Adicionar atualização..." style={{ ...input, flex: 1 }} />
                          <Btn onClick={adicionarAtualizacao} disabled={!novaAtualizacao.trim()} cor="azul">Adicionar</Btn>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ABA CONTAS */}
              {abaDetalhe === 'contas' && (
                <div>
                  {!detalheAberto.prestacaoContas && !editarContas && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <FileCheck size={40} color={COR.cinza200} style={{ margin: '0 auto 12px' }} />
                      <p style={{ color: COR.cinza400, fontStyle: 'italic', marginBottom: 16 }}>Prestação de contas será registrada após conclusão.</p>
                      {modoConselho && <Btn onClick={() => { setContasTemp({ valorFinalPago: detalheAberto.execucao?.valorContratado||0, notaFiscal:'', dataPagamento:'', observacoes:'' }); setEditarContas(true); }} cor="teal">Registrar contas</Btn>}
                    </div>
                  )}
                  {editarContas && contasTemp && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 14 }}>Prestação de contas</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                        <div><label style={label}>Valor final pago (R$)</label><input type="number" value={contasTemp.valorFinalPago||''} onChange={e => setContasTemp({...contasTemp,valorFinalPago:parseFloat(e.target.value)||0})} style={input} /></div>
                        <div><label style={label}>Nota fiscal / Recibo</label><input placeholder="Ex: NF 1234" value={contasTemp.notaFiscal} onChange={e => setContasTemp({...contasTemp,notaFiscal:e.target.value})} style={input} /></div>
                        <div style={{ gridColumn: 'span 2' }}><label style={label}>Data do pagamento</label><input type="date" value={contasTemp.dataPagamento} onChange={e => setContasTemp({...contasTemp,dataPagamento:e.target.value})} style={input} /></div>
                      </div>
                      <textarea placeholder="Observações..." value={contasTemp.observacoes} onChange={e => setContasTemp({...contasTemp,observacoes:e.target.value})} style={{ ...input, minHeight: 80, resize: 'vertical', marginBottom: 12 }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Btn onClick={salvarContas} cor="teal">Salvar contas</Btn>
                        <Btn onClick={() => setEditarContas(false)} cor="cinza">Cancelar</Btn>
                      </div>
                    </div>
                  )}
                  {detalheAberto.prestacaoContas && !editarContas && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 12, padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Award size={20} color="#166534" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Obra concluída e paga</span>
                      </div>
                      <div style={{ fontSize: 36, fontWeight: 800, color: COR.azul, letterSpacing: '-0.03em', marginBottom: 16 }}>{formatBRL(detalheAberto.prestacaoContas.valorFinalPago)}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
                        <div><div style={{ fontSize: 10, color: COR.cinza400, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Nota fiscal</div><div style={{ fontWeight: 600 }}>{detalheAberto.prestacaoContas.notaFiscal||'—'}</div></div>
                        <div><div style={{ fontSize: 10, color: COR.cinza400, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Pagamento em</div><div style={{ fontWeight: 600 }}>{detalheAberto.prestacaoContas.dataPagamento?new Date(detalheAberto.prestacaoContas.dataPagamento).toLocaleDateString('pt-BR'):'—'}</div></div>
                      </div>
                      {detalheAberto.prestacaoContas.observacoes && <p style={{ fontSize: 13, color: COR.cinza700, fontStyle: 'italic', marginTop: 12, borderTop: '1px solid #86EFAC', paddingTop: 12 }}>{detalheAberto.prestacaoContas.observacoes}</p>}
                      {modoConselho && <button onClick={() => { setContasTemp(detalheAberto.prestacaoContas); setEditarContas(true); }} style={{ background: 'none', border: 'none', color: '#166534', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginTop: 10 }}>Editar</button>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* MODAL FOTO AMPLIADA */}
      {fotoAmpliada && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
          onClick={() => setFotoAmpliada(null)}
        >
          <button onClick={() => setFotoAmpliada(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={20} />
          </button>
          <img
            src={fotoAmpliada}
            alt="Foto ampliada"
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 64px rgba(0,0,0,0.8)' }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      {/* MODAL EDITAR SUGESTÃO */}
      {editandoSugestao && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,45,79,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 80 }} onClick={() => setEditandoSugestao(null)}>
          <div style={{ background: COR.branco, borderRadius: 16, padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 48px rgba(27,45,79,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: COR.azul, display: 'flex', alignItems: 'center', gap: 8 }}><Edit2 size={18} /> Editar sugestão</div>
              <button onClick={() => setEditandoSugestao(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COR.cinza400 }}><X size={20} /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Título</label>
              <input style={input} value={editandoSugestao.titulo} onChange={e => setEditandoSugestao({...editandoSugestao, titulo: e.target.value})} maxLength={80} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Categoria</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const ativo = editandoSugestao.categoria === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setEditandoSugestao({...editandoSugestao, categoria: cat.id})} style={{ padding: '10px 6px', border: `1.5px solid ${ativo ? COR.teal : COR.cinza200}`, borderRadius: 8, background: ativo ? COR.tealLight : COR.branco, color: ativo ? COR.teal : COR.cinza700, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                      <Icon size={16} /> {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={label}>Descrição</label>
              <textarea value={editandoSugestao.descricao} onChange={e => setEditandoSugestao({...editandoSugestao, descricao: e.target.value})} maxLength={800} style={{ ...input, minHeight: 120, resize: 'vertical' }} />
            </div>

            <PainelFotos
              fotos={editandoSugestao.fotos || []}
              linkFoto={linkFoto}
              setLinkFoto={setLinkFoto}
              uploadando={uploadandoFoto}
              onAdicionarLink={() => adicionarFotoLink(editandoSugestao, setEditandoSugestao)}
              onUpload={(e) => adicionarFotoUpload(e, editandoSugestao, setEditandoSugestao)}
              onRemover={(idx) => removerFoto(idx, editandoSugestao, setEditandoSugestao)}
              onAmplia={setFotoAmpliada}
              COR={COR}
              input={input}
              label={label}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={salvarEdicao} disabled={!editandoSugestao.titulo.trim() || !editandoSugestao.descricao.trim()} style={{ flex: 1, padding: 12, background: !editandoSugestao.titulo.trim() || !editandoSugestao.descricao.trim() ? COR.cinza200 : COR.teal, color: !editandoSugestao.titulo.trim() || !editandoSugestao.descricao.trim() ? COR.cinza400 : '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Salvar alterações
              </button>
              <button onClick={() => setEditandoSugestao(null)} style={{ padding: '12px 20px', background: COR.cinza100, color: COR.cinza700, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
