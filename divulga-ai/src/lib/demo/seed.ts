import type { AppUser, Category, Payment, ProfessionalRecord, Service, Subscription } from "@/lib/types";

/**
 * Dados de exemplo do modo demonstração. Gerados de forma determinística para
 * que a mesma lista apareça a cada reinício do servidor.
 */

export interface DemoUser extends AppUser {
  senha: string;
}

export interface DemoReview {
  id: string;
  profissional_id: string;
  cliente_id: string;
  nota: number;
  comentario: string | null;
  created_at: string;
}

export interface DemoDB {
  users: DemoUser[];
  categorias: Category[];
  profissionais: ProfessionalRecord[];
  servicos: (Service & { profissional_id: string })[];
  avaliacoes: DemoReview[];
  assinaturas: Subscription[];
  pagamentos: Payment[];
  visualizacoes: { profissional_id: string; created_at: string }[];
}

export const DEMO_PASSWORD = "123456";

export const CATEGORIES: Omit<Category, "id" | "ativo">[] = [
  { slug: "pedreiro", nome: "Pedreiro", icone: "brick-wall" },
  { slug: "eletricista", nome: "Eletricista", icone: "zap" },
  { slug: "encanador", nome: "Encanador", icone: "droplets" },
  { slug: "pintor", nome: "Pintor", icone: "paint-roller" },
  { slug: "diarista", nome: "Diarista", icone: "sparkles" },
  { slug: "jardineiro", nome: "Jardineiro", icone: "sprout" },
  { slug: "tecnico-informatica", nome: "Técnico de informática", icone: "monitor" },
  { slug: "montador-moveis", nome: "Montador de móveis", icone: "hammer" },
  { slug: "designer", nome: "Designer", icone: "palette" },
  { slug: "programador", nome: "Programador", icone: "code" },
  { slug: "mecanico", nome: "Mecânico", icone: "car" },
];

const CITIES = [
  { nome: "Santa Inês", lat: -3.6667, lng: -45.38 },
  { nome: "São Luís", lat: -2.5297, lng: -44.3028 },
  { nome: "São Paulo", lat: -23.5505, lng: -46.6333 },
  { nome: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
  { nome: "Belo Horizonte", lat: -19.9167, lng: -43.9345 },
  { nome: "Fortaleza", lat: -3.7319, lng: -38.5267 },
];

const FIRST = ["Ana", "Carlos", "Mariana", "Paulo", "Fernanda", "Ricardo", "Juliana", "Marcos", "Patrícia", "Diego", "Camila", "Rafael", "Luciana", "Bruno", "Aline", "Thiago", "Beatriz", "Gustavo", "Larissa", "Eduardo", "Renata", "Felipe", "Tatiane", "André"];
const LAST = ["Souza", "Oliveira", "Santos", "Lima", "Pereira", "Costa", "Ferreira", "Almeida", "Ribeiro", "Carvalho", "Gomes", "Martins"];

const SERVICES: Record<string, [string, number][]> = {
  pedreiro: [["Assentamento de piso", 45], ["Reboco de parede", 35], ["Pequenas reformas", 150]],
  eletricista: [["Instalação de tomadas", 40], ["Troca de disjuntor", 80], ["Instalação de chuveiro", 70]],
  encanador: [["Desentupimento", 90], ["Troca de registro", 60], ["Conserto de vazamento", 80]],
  pintor: [["Pintura de parede (m²)", 18], ["Pintura de fachada", 800], ["Textura e grafiato", 35]],
  diarista: [["Diária", 150], ["Faxina pesada", 220], ["Passar roupas", 90]],
  jardineiro: [["Corte de grama", 80], ["Poda de árvores", 150], ["Paisagismo", 400]],
  "tecnico-informatica": [["Formatação", 100], ["Limpeza de notebook", 120], ["Instalação de rede", 150]],
  "montador-moveis": [["Montagem de guarda-roupa", 180], ["Montagem de cozinha", 350], ["Desmontagem", 90]],
  designer: [["Criação de logotipo", 350], ["Posts para redes sociais", 250], ["Identidade visual", 1200]],
  programador: [["Landing page", 900], ["Site institucional", 2500], ["Manutenção de sistema (hora)", 120]],
  mecanico: [["Troca de óleo", 80], ["Revisão completa", 350], ["Diagnóstico eletrônico", 120]],
};

const COMMENTS = [
  "Muito bom trabalho, recomendo muito!",
  "Pontual, caprichoso e preço justo.",
  "Resolveu meu problema no mesmo dia.",
  "Excelente profissional, super educado.",
  "Serviço bem feito, voltarei a contratar.",
  "Atendimento rápido e organizado.",
  "Bom, mas atrasou um pouco.",
  null,
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function uuid(n: number) {
  return `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function daysAhead(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

export function createSeed(): DemoDB {
  const rand = rng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  const categorias: Category[] = CATEGORIES.map((c, i) => ({ ...c, id: i + 1, ativo: true }));
  const users: DemoUser[] = [];
  const profissionais: ProfessionalRecord[] = [];
  const servicos: DemoDB["servicos"] = [];
  const avaliacoes: DemoReview[] = [];
  const assinaturas: Subscription[] = [];
  const pagamentos: Payment[] = [];
  const visualizacoes: DemoDB["visualizacoes"] = [];

  const base = (id: string, nome: string, email: string, tipo: AppUser["tipo"], cidade: (typeof CITIES)[number], telefone: string): DemoUser => ({
    id,
    nome,
    email,
    senha: DEMO_PASSWORD,
    tipo,
    cidade: cidade.nome,
    telefone,
    foto: null,
    lat: cidade.lat + (rand() - 0.5) * 0.06,
    lng: cidade.lng + (rand() - 0.5) * 0.06,
    banido: false,
    created_at: daysAgo(Math.floor(rand() * 200) + 10),
  });

  users.push(base(uuid(1), "Administrador", "admin@divulgaai.com", "admin", CITIES[0], "(98) 99999-0000"));
  users.push(base(uuid(2), "Robertinha Alves", "cliente@divulgaai.com", "cliente", CITIES[0], "(98) 98888-1111"));

  // Clientes que deixam avaliações
  const clientes: DemoUser[] = [users[1]];
  for (let i = 0; i < 12; i++) {
    const c = base(uuid(100 + i), `${pick(FIRST)} ${pick(LAST)}`, `cliente${i}@exemplo.com`, "cliente", pick(CITIES), "");
    users.push(c);
    clientes.push(c);
  }

  const addProfessional = (
    n: number,
    nome: string,
    email: string,
    cidade: (typeof CITIES)[number],
    catSlug: string,
    profissao: string,
    opts: { aprovado?: boolean; ativa?: boolean; descricao?: string } = {},
  ) => {
    const id = uuid(n);
    const user = base(id, nome, email, "profissional", cidade, `(98) 9${Math.floor(rand() * 1e8).toString().padStart(8, "0")}`);
    users.push(user);
    const cat = categorias.find((c) => c.slug === catSlug)!;
    const svc = SERVICES[catSlug] ?? [];
    const ativa = opts.ativa ?? true;
    profissionais.push({
      user_id: id,
      profissao,
      descricao:
        opts.descricao ??
        `Olá! Sou ${nome.split(" ")[0]}, ${profissao.toLowerCase()} com mais de ${2 + Math.floor(rand() * 15)} anos de experiência em ${cidade.nome} e região. Trabalho com capricho, pontualidade e orçamento sem compromisso.`,
      categoria_id: cat.id,
      nota: 0,
      total_avaliacoes: 0,
      valor_medio: svc.length ? Math.round(svc.reduce((s, [, p]) => s + p, 0) / svc.length) : null,
      whatsapp: user.telefone,
      assinatura_ativa: ativa,
      aprovado: opts.aprovado ?? true,
      visualizacoes: Math.floor(rand() * 400),
      created_at: user.created_at,
    });
    svc.forEach(([titulo, preco], i) => servicos.push({ id: `${id}-s${i}`, profissional_id: id, titulo, preco }));

    const subId = `${id}-sub`;
    assinaturas.push({
      id: subId,
      user_id: id,
      status: ativa ? "ativa" : "vencida",
      valor: 5,
      vencimento: ativa ? daysAhead(5 + Math.floor(rand() * 25)) : daysAgo(3),
      provider: rand() > 0.5 ? "mercadopago" : "stripe",
      provider_ref: null,
      renovacao_automatica: true,
    });
    const months = 1 + Math.floor(rand() * 5);
    for (let m = 0; m < months; m++) {
      pagamentos.push({
        id: `${id}-p${m}`,
        user_id: id,
        valor: 5,
        status: "aprovado",
        provider: assinaturas.at(-1)!.provider!,
        provider_ref: null,
        created_at: daysAgo(m * 30 + Math.floor(rand() * 5)),
      });
    }

    const reviewCount = Math.floor(rand() * 7);
    const shuffled = [...clientes].sort(() => rand() - 0.5).slice(0, reviewCount);
    shuffled.forEach((c, i) => {
      avaliacoes.push({
        id: `${id}-r${i}`,
        profissional_id: id,
        cliente_id: c.id,
        nota: rand() > 0.25 ? 5 : rand() > 0.4 ? 4 : 3,
        comentario: pick(COMMENTS),
        created_at: daysAgo(Math.floor(rand() * 90)),
      });
    });
    for (let d = 0; d < 20; d++) {
      if (rand() > 0.4) visualizacoes.push({ profissional_id: id, created_at: daysAgo(rand() * 14) });
    }
  };

  // Profissional da referência visual
  addProfessional(3, "José da Silva", "profissional@divulgaai.com", CITIES[0], "pedreiro", "Pedreiro, eletricista, encanador", {
    descricao:
      "Faço pequenas e grandes reformas, instalações elétricas e hidráulicas. Atendo Santa Inês e cidades vizinhas. Orçamento grátis pelo WhatsApp!",
  });
  const jose = uuid(3);
  for (let i = avaliacoes.length - 1; i >= 0; i--) {
    if (avaliacoes[i].profissional_id === jose && avaliacoes[i].cliente_id === users[1].id) avaliacoes.splice(i, 1);
  }
  avaliacoes.push({
    id: `${jose}-robertinha`,
    profissional_id: jose,
    cliente_id: users[1].id,
    nota: 4,
    comentario: "Muito bom trabalho, recomendo muito!",
    created_at: daysAgo(2),
  });

  let n = 10;
  const slugs = CATEGORIES.map((c) => c.slug);
  for (let i = 0; i < 34; i++) {
    const slug = slugs[i % slugs.length];
    const cat = CATEGORIES.find((c) => c.slug === slug)!;
    const cidade = i < 12 ? CITIES[i % 2] : pick(CITIES);
    addProfessional(n++, `${pick(FIRST)} ${pick(LAST)}`, `pro${i}@exemplo.com`, cidade, slug, cat.nome);
  }
  // Pendentes de aprovação e com assinatura vencida (para o painel admin)
  addProfessional(n++, "Sebastião Nunes", "pendente1@exemplo.com", CITIES[0], "mecanico", "Mecânico", { aprovado: false });
  addProfessional(n++, "Cláudia Rocha", "pendente2@exemplo.com", CITIES[1], "designer", "Designer gráfica", { aprovado: false });
  addProfessional(n++, "Hélio Batista", "vencido@exemplo.com", CITIES[1], "pintor", "Pintor", { ativa: false });

  // Nota média
  for (const p of profissionais) {
    const list = avaliacoes.filter((a) => a.profissional_id === p.user_id);
    p.total_avaliacoes = list.length;
    p.nota = list.length ? Math.round((list.reduce((s, a) => s + a.nota, 0) / list.length) * 10) / 10 : 0;
  }

  return { users, categorias, profissionais, servicos, avaliacoes, assinaturas, pagamentos, visualizacoes };
}
