# Divulga ai

Marketplace de serviços autônomos: profissionais divulgam seus serviços por **R$ 5,00/mês** e clientes encontram quem está perto, com avaliações e contato direto pelo WhatsApp.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Supabase (Auth + PostgreSQL + Storage) · Stripe · Mercado Pago · Leaflet/OpenStreetMap · Vercel

## Rodando localmente

```bash
cd divulga-ai
npm install
npm run dev   # http://localhost:3000
```

Sem variáveis de ambiente, o app sobe em **modo demonstração**: ~40 profissionais de exemplo em memória, login simulado e pagamento aprovado na hora. Contas (senha `123456`):

| E-mail | Papel |
| --- | --- |
| `cliente@divulgaai.com` | Cliente |
| `profissional@divulgaai.com` | Profissional (José da Silva) |
| `admin@divulgaai.com` | Administrador |

## Produção

1. **Supabase:** crie um projeto e rode `supabase/migrations/0001_schema.sql` no SQL Editor. Ele cria tabelas, triggers, RLS, a função de busca por distância, o bucket `avatars` e as categorias. Ative o provedor Google em *Authentication → Providers* se quiser login com Google e adicione `https://SEU_DOMINIO/auth/callback` às Redirect URLs.
2. **Admin:** depois de criar sua conta, rode `update public.users set tipo = 'admin' where email = 'voce@email.com';`
3. **Variáveis:** copie `.env.example` para `.env.local` (ou configure na Vercel) e preencha.
4. **Stripe:** webhook em `/api/webhooks/stripe` com os eventos `invoice.paid` e `customer.subscription.deleted`.
5. **Mercado Pago:** webhook em `/api/webhooks/mercadopago` com o tópico *Planos e assinaturas* e a assinatura secreta em `MERCADOPAGO_WEBHOOK_SECRET`.
6. **Deploy na Vercel** com *Root Directory* = `divulga-ai`. O `vercel.json` agenda o cron diário que vence as assinaturas expiradas (defina `CRON_SECRET`).

## Arquitetura

```
src/
  app/
    (auth)/login, cadastro           telas de login e cadastro
    (app)/                           layout com sidebar (desktop) e barra inferior (celular)
      page.tsx                       início
      buscar/                        busca com filtros, ordenação, infinite scroll e mapa
      profissional/[id]/             perfil público, avaliações, modal de contratação
      painel/                        dashboard do profissional
      assinatura/                    plano, checkout e área financeira
      admin/                         métricas, aprovações, usuários, pagamentos, categorias
      configuracoes/, conversas/
    api/                             busca paginada, webhooks, cron
    sitemap.ts, robots.ts, manifest.ts
  actions/                           server actions (auth, perfil, avaliações, assinatura, admin)
  components/                        ui/, layout/, professional/, dashboard/, admin/…
  lib/data/                          interface Repository + implementações Supabase e demo
  proxy.ts                           renova a sessão e protege rotas privadas
supabase/migrations/                 schema, RLS e funções
```

- **Acesso a dados:** todas as telas usam a interface `Repository` (`src/lib/data/repository.ts`). Com Supabase configurado usa `supabase-repository.ts`; senão, `demo-repository.ts`.
- **Segurança:** RLS em todas as tabelas; triggers impedem que um usuário mude o próprio papel, se aprove ou ative a assinatura. Pagamentos só são gravados pelos webhooks (service role).
- **Assinatura:** a assinatura é recorrente nos dois provedores (renovação automática). Quando vence, o trigger/cron marca como vencida e o anúncio sai da busca.
- **Geolocalização:** o navegador obtém a posição, a cidade vem do Nominatim (OSM) e fica num cookie usado pelo servidor para ordenar por distância (fórmula de haversine no SQL).
- **Chat:** por enquanto o contato é pelo WhatsApp; as tabelas `conversas` e `mensagens` já existem, com RLS, para o chat interno.
