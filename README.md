# Portfólio Profissional

Portfólio profissional full-stack com painel administrativo integrado e analytics próprio. Duas aplicações servidas pelo mesmo projeto React: **site público** e **admin console**, com Supabase como backend (banco, auth, storage) e Netlify para deploy.

---

## ✨ Visão geral

```
                        PORTFÓLIO
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
        SITE PÚBLICO               PAINEL ADMIN
        seudominio.com           admin.seudominio.com
               │                         │
               └────────────┬────────────┘
                            ▼
                        SUPABASE
                    PostgreSQL + Auth
                    + Storage + RLS
                            │
                            ▼
                    Analytics próprio
                    (page_views + RPCs)
```

Todo o conteúdo exibido no site público é **gerenciado via painel administrativo** e armazenado no Supabase: perfil, projetos, experiências, formação, habilidades, links sociais, colaborações e textos das páginas. Zero hardcode.

---

## 🎯 Principais recursos

### Site público

- **Home** com Hero animado, projetos em destaque, preview sobre/trajetória e CTA
- **Projetos** com listagem e página de detalhes individual (`/projetos/:slug`)
- **Experiência** — preview na Home/Sobre + página completa com timeline (`/experiencia`)
- **Sobre** com filosofia, trajetória, formação, ferramentas e interesses
- **Contato** com canais, colaborações e contexto profissional
- **404** customizada com identidade visual
- **SEO** — `title`, `description`, canonical, Open Graph, Twitter Card e JSON-LD por rota
- **Acessibilidade** — skip link, `aria-current`, foco visível, `prefers-reduced-motion`, navegação por teclado
- **Performance** — lazy loading de imagens, `preconnect`, skeletons, code-split por rota

### Painel administrativo

- **Autenticação** via Supabase Auth com verificação de admin (`is_admin()`)
- **Dashboard** com estatísticas por tabela, ações rápidas e status do perfil
- **CRUDs completos:**
  - Projetos (com upload de capa, destaque, reordenação)
  - Experiências (reordenação, publicar/rascunho)
  - Habilidades (categorias, reordenação)
  - Formação acadêmica
  - Links sociais (com normalização de URL por plataforma)
  - Colaborações
- **Perfil & Conteúdo** — dados pessoais, contexto, interesses, textos da Home e textos de páginas
- **Analytics** — dashboard com views, visitantes, gráfico diário, top páginas, top referrers e device split
- **Toasts e dialogs** consistentes com o design do painel
- **Uploads** para o bucket `portfolio-assets` (avatars, currículos, capas)
- **Responsivo** — sidebar vira drawer em mobile, tabelas com scroll horizontal

### Analytics próprio

Sistema de analytics sem cookies, sem PII, com dados 100% no seu banco:

- **Tracking** — registra cada page view via `usePageTracking` (só em produção, session-based via `sessionStorage`)
- **Agregações** — 6 RPCs PostgreSQL (`analytics_overview`, `analytics_daily_views`, `analytics_top_pages`, `analytics_top_referrers`, `analytics_device_split`, `analytics_compare`)
- **Dashboard** — cards com delta vs. período anterior, gráfico SVG de views diárias, listas ranqueadas, distribuição por dispositivo
- **Períodos** — 7 / 30 / 90 dias
- **Retenção** — cleanup automático de views com mais de 180 dias via `pg_cron`
- **Export** — CSV multi-seção client-side

---

## 🛠 Stack

### Frontend

| Camada      | Tecnologia                                  |
| ----------- | ------------------------------------------- |
| Framework   | React 19                                    |
| Bundler     | Vite 8                                      |
| Linguagem   | TypeScript 6                                |
| Estilo      | Tailwind CSS 4 (`@theme` + design tokens) |
| Rotas       | React Router 7                              |
| Animações | Framer Motion                               |
| Ícones     | Lucide React, react-social-icons            |
| HTTP        | Supabase JS Client (tipado com`Database`) |

### Backend / BaaS

- **Supabase** — PostgreSQL 17 + Auth + Storage + RLS
- **pg_cron** — job de cleanup automático das page views
- **PostgreSQL RPCs** — funções de agregação para o dashboard

### Infra

- **Netlify** — deploy estático + SPA fallback + subdomínio admin
- **Registro.br** (ou provedor equivalente) — DNS gerenciado externamente

### Ferramentas

- **pnpm** — package manager
- **Supabase CLI** — migrations e geração de tipos
- **ESLint** + **TypeScript** — checks
- **Git**

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── App.tsx              # decide PublicApp ou AdminApp via hostname
│   ├── PublicApp.tsx        # rotas públicas + tracking
│   └── AdminApp.tsx         # rotas administrativas
│
├── components/
│   ├── admin/
│   │   ├── analytics/       # Cards, gráfico, top listas, device split
│   │   ├── AdminHeader.tsx
│   │   ├── AdminSidebar.tsx # drawer responsivo
│   │   ├── AdminUserMenu.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── PlatformSelect.tsx
│   │   ├── ReorderButtons.tsx
│   │   └── Toast.tsx
│   ├── auth/
│   │   └── AdminGuard.tsx
│   ├── experience/          # ExperienceCard, ExperienceTimelineFull
│   ├── home/                # Hero, FeaturedProjects, AboutPreview...
│   ├── layout/              # Container, Header, Footer, PageMeta, SmartImage, Skeleton
│   ├── projects/            # ProjectCard, ProjectCardCompact
│   └── Brandmark.tsx
│
├── hooks/                   # 13 hooks customizados
│
├── layouts/
│   ├── PublicLayout.tsx
│   └── AdminLayout.tsx
│
├── lib/
│   ├── database.types.ts    # tipos gerados do Supabase
│   ├── exportCsv.ts         # CSV client-side
│   ├── fetchCache.ts        # dedupe de requisições em-flight
│   ├── mappers.ts           # snake_case → camelCase
│   ├── publicSite.ts        # troca admin.* → hostname público
│   ├── socialUrl.ts         # normalização de URLs sociais
│   ├── supabase.ts          # cliente tipado
│   └── upload.ts            # helper de upload
│
├── pages/
│   ├── About/
│   ├── Contact/
│   ├── Experiences/
│   ├── Home/
│   ├── NotFound/
│   ├── ProjectDetails/
│   ├── Projects/
│   └── Admin/
│       ├── Analytics/
│       ├── Collaborations/
│       ├── Dashboard/
│       ├── Education/
│       ├── Experiences/
│       ├── Login/
│       ├── Profile/
│       ├── Projects/
│       ├── Skills/
│       └── SocialLinks/
│
├── types/index.ts
├── index.css
└── main.tsx

supabase/
└── migrations/              # 20 migrations versionadas
```

---

## 🚀 Rodando localmente

### Pré-requisitos

- **Node.js** ≥ 20
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- Conta no **Supabase** (o projeto usa o Supabase remoto, não o local)

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/portfolio.git
cd portfolio

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# edite .env.local com suas credenciais do Supabase

# 4. Aplicar migrations no Supabase remoto
pnpm exec supabase link --project-ref <seu-project-ref>
pnpm exec supabase db push

# 5. Gerar tipos do banco
pnpm dlx supabase gen types typescript --linked > src/lib/database.types.ts

# 6. Rodar em desenvolvimento
pnpm dev
```

### Acessando o admin em dev

O admin só é servido quando o hostname começa com `admin.`:

- **Público** → `http://localhost:5173`
- **Admin** → `http://admin.localhost:5173` (adicione `127.0.0.1 admin.localhost` ao `hosts` se não resolver)
- **Alternativa em dev** → `http://localhost:5173/?admin` (só funciona em `pnpm dev`)

### Scripts disponíveis

```bash
pnpm dev              # servidor de desenvolvimento
pnpm build            # build de produção (tsc + vite)
pnpm preview          # serve o build localmente
pnpm lint             # ESLint
```

---

## 🔐 Variáveis de ambiente

`.env.local` (não versionado):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_SITE_URL=https://seudominio.com
```

| Variável                  | Descrição                                              |
| -------------------------- | -------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL do projeto Supabase                                  |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase — protegida por RLS   |
| `VITE_SITE_URL`          | URL pública do site (SEO, sitemap, canonical, OG image) |

> ⚠️ **Nunca** coloque a `SERVICE_ROLE_KEY` no frontend. Variáveis com prefixo `VITE_` são embutidas no bundle — são públicas por design.

---

## 🗄 Banco de dados

O schema é versionado em `supabase/migrations/`. Aplicar no remoto:

```bash
pnpm exec supabase db push
pnpm exec supabase migration list
pnpm exec supabase migration new nome_da_migration
```

### Tabelas principais

| Tabela             | Uso                                        |
| ------------------ | ------------------------------------------ |
| `profiles`       | Dados do profissional (single row)         |
| `projects`       | Projetos do portfólio                     |
| `experiences`    | Histórico profissional                    |
| `skills`         | Habilidades técnicas                      |
| `education`      | Formação acadêmica                      |
| `social_links`   | Links de redes sociais                     |
| `collaborations` | Tipos de colaboração aceitos             |
| `site_content`   | Textos editáveis das páginas (key/value) |
| `page_views`     | Registros de analytics (path, device, ref) |
| `admin_users`    | Usuários com permissão administrativa    |

### Funções RPC

| Função                               | Uso                                |
| -------------------------------------- | ---------------------------------- |
| `is_admin()`                         | Verifica se o usuário é admin    |
| `analytics_overview(p_days)`         | Contadores gerais + do período    |
| `analytics_daily_views(p_days)`      | Série diária para o gráfico     |
| `analytics_top_pages(p_days, limit)` | Top rotas mais visitadas           |
| `analytics_top_referrers(...)`       | Origem do tráfego                 |
| `analytics_device_split(p_days)`     | Split mobile/tablet/desktop        |
| `analytics_compare(p_days)`          | Comparação com período anterior |
| `cleanup_old_page_views(days)`       | Remove views antigas (via pg_cron) |

### Segurança (RLS)

Todas as tabelas têm **Row Level Security** habilitado:

- **Leitura pública**: itens com `published = true`
- **Admins** (via `is_admin()`): acesso total, incluindo rascunhos
- **Escrita**: apenas admins
- **`page_views`**: INSERT público (visitantes anônimos), SELECT/DELETE apenas admins

Para adicionar um admin:

```sql
INSERT INTO admin_users (user_id)
VALUES ('<uuid-do-usuario-em-auth.users>');
```

### Regerando tipos

Sempre que uma migration alterar o schema, regenere os tipos:

```bash
pnpm dlx supabase gen types typescript --linked > src/lib/database.types.ts
```

Isso mantém `src/lib/database.types.ts` em sincronia com o banco e dá autocomplete no client.

---

## 📊 Analytics próprio

O sistema foi desenhado para ter **zero dependência de terceiros** e **zero PII**:

- **Sem cookies** — o session ID vive em `sessionStorage`, morre ao fechar a aba
- **Sem identificação de usuário** — só agrega por sessão anônima
- **Só em produção** — o hook ignora dev (`import.meta.env.PROD`)
- **Fire-and-forget** — falhas de tracking nunca bloqueiam a navegação
- **Retenção** — views com mais de 180 dias são removidas pelo `pg_cron` diariamente às 03:00

### Fluxo

```
Visitante navega
    ↓
usePageTracking dispara INSERT em page_views
    ↓
Admin abre /analytics
    ↓
useAnalytics chama 6 RPCs em paralelo
    ↓
Dashboard renderiza (cards + gráfico + listas)
```

---

## 🌐 Deploy

### Frontend (Netlify)

Configuração em `netlify.toml`:

```toml
[build]
  command = "pnpm run build"
  publish = "dist"

[build.environment]
  SECRETS_SCAN_OMIT_KEYS = "VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY,VITE_SITE_URL"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Dois detalhes importantes:

1. **`SECRETS_SCAN_OMIT_KEYS`** — instrui o scanner do Netlify a ignorar as variáveis `VITE_*`. Elas são públicas por design (embutidas no bundle) e protegidas por RLS no servidor. Sem isso, o deploy falha.
2. **`redirects`** — SPA fallback. Sem isso, alguém que abrir `/projetos` diretamente recebe 404 do Netlify em vez de servir o `index.html`.

### Subdomínio admin

Configure no seu provedor de DNS (ex: Registro.br):

```
Tipo    Nome    Valor                    TTL
CNAME   admin   seu-projeto.netlify.app  3600
```

Depois, no painel do Netlify:

1. **Domain management → Add a custom domain** → `admin.seudominio.com`
2. Aguardar emissão automática do certificado SSL (~5-30 min)

O `App.tsx` detecta o prefixo `admin.` via `window.location.hostname` e renderiza `AdminApp`. Nenhum deploy separado é necessário.

### Supabase

- **Auth** — adicione as URLs de produção em **Authentication → URL Configuration**
- **Storage** — bucket `portfolio-assets` já é criado pela migration com as policies corretas
- **RLS** — verifique se todas as migrations estão aplicadas com `supabase migration list`

---

## 🎨 Design system

Tokens de design em `src/index.css` via `@theme` (Tailwind v4):

- **Paleta:** monocromática com acento **índigo**
- **Tipografia:** Inter, com escala editorial (H1 grande, labels em mono uppercase)
- **Tema:** dark por padrão, variáveis `--color-*` para dark/light
- **Padrões:**
  - Labels de seção: `XX — NOME`
  - Botão primário: `bg-indigo-600` + glow
  - Bordas de seção: `border-[var(--color-border)]`
  - Entrada de elementos: Framer Motion com `whileInView` + `once: true`

### Regra

Nunca usar cores hardcoded (`bg-zinc-800`). Sempre via tokens (`bg-[var(--color-card)]`).

---

## 🧭 Fluxo de desenvolvimento

O projeto segue um fluxo incremental:

```
1. Analisar o estado atual
2. Identificar a menor mudança que resolve
3. Implementar
4. Testar
5. Validar antes de avançar
```

Evitar grandes refatorações misturadas com features novas. Cada mudança relevante é testada antes de seguir para a próxima.

---

## 📄 Licença

Projeto pessoal. Todos os direitos reservados.

O código é disponibilizado para fins de **referência e estudo**. Não é permitido reproduzir o conteúdo (textos, imagens, dados do perfil) sem autorização. Ver [LICENSE](./LICENSE) para detalhes.
