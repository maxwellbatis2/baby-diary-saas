# 🎛️ Painel Administrativo - Baby Diary

Painel administrativo completo para gerenciar o Baby Diary, desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

### 📊 Dashboard
- **Estatísticas em tempo real** - Usuários, receita, crescimento
- **Gráficos interativos** - Evolução mensal, distribuição de planos
- **Ações rápidas** - Acesso direto às principais funcionalidades
- **Métricas de engajamento** - Usuários ativos, novos cadastros

### 👥 Gerenciamento de Usuários
- **Lista completa** - Todos os usuários com filtros e busca
- **Ações em lote** - Ativar/desativar, reset de senha, gamificação
- **Atribuição de planos** - Gerenciar assinaturas dos usuários
- **Estatísticas detalhadas** - Status, planos, atividade

### 💳 Gerenciamento de Planos
- **CRUD completo** - Criar, editar, deletar planos
- **Integração Stripe** - Configuração automática de preços
- **Funcionalidades personalizáveis** - Limites e recursos por plano
- **Status ativo/inativo** - Controle de disponibilidade

### 🏆 Sistema de Gamificação
- **Regras personalizáveis** - Pontos, badges, condições
- **Configuração de recompensas** - Sistema de incentivos
- **Monitoramento** - Acompanhar engajamento dos usuários

### 📧 Templates de Notificação
- **Editor de templates** - Email e push notifications
- **Variáveis dinâmicas** - Personalização por usuário
- **Preview em tempo real** - Visualizar antes de salvar

### 🌐 Landing Page Editável
- **Editor visual** - Título, subtítulo, features, FAQ
- **Preview instantâneo** - Ver mudanças em tempo real
- **Conteúdo dinâmico** - Atualização automática no site

### 📈 Analytics Avançado
- **Relatórios detalhados** - Engajamento, conversões, receita
- **Gráficos interativos** - Tendências e comparações
- **Exportação de dados** - Relatórios em PDF/Excel

## 🛠️ Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** Radix UI + Shadcn/ui
- **Gráficos:** Recharts
- **Formulários:** React Hook Form + Zod
- **Estado:** Zustand
- **Requisições:** Axios + React Query
- **Notificações:** React Hot Toast

## 📦 Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd admin-panel

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar em desenvolvimento
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# API do Backend
NEXT_PUBLIC_API_URL=http://localhost:3000

# Autenticação
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3001
```

### Estrutura de Pastas

```
admin-panel/
├── app/                    # App Router (Next.js 14)
│   ├── admin/             # Páginas administrativas
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── users/         # Gerenciamento de usuários
│   │   ├── plans/         # Gerenciamento de planos
│   │   ├── gamification/  # Sistema de gamificação
│   │   ├── notifications/ # Templates de notificação
│   │   ├── landing-page/  # Editor da landing page
│   │   └── analytics/     # Relatórios e métricas
│   ├── login/             # Página de login
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── layout/           # Layout components
│   ├── charts/           # Componentes de gráficos
│   └── forms/            # Formulários
├── lib/                  # Utilitários e configurações
│   ├── api.ts           # Cliente API
│   └── utils.ts         # Funções utilitárias
├── providers/           # Context providers
│   ├── auth-provider.tsx
│   └── query-provider.tsx
└── types/               # Definições de tipos
```

## 🎨 Componentes UI

### Sistema de Design
- **Design System** baseado em Tailwind CSS
- **Componentes atômicos** reutilizáveis
- **Tema escuro/claro** automático
- **Responsivo** para todos os dispositivos

### Componentes Principais
- `Button` - Botões com variantes
- `Card` - Containers de conteúdo
- `Input` - Campos de formulário
- `Table` - Tabelas de dados
- `Modal` - Diálogos e modais
- `Charts` - Gráficos interativos

## 🔐 Autenticação

### Fluxo de Login
1. **Página de login** - Credenciais do administrador
2. **Validação** - Verificação no backend
3. **Token JWT** - Armazenamento seguro
4. **Redirecionamento** - Dashboard após autenticação

### Proteção de Rotas
- **Middleware** - Verificação automática de autenticação
- **Redirecionamento** - Login para usuários não autenticados
- **Refresh token** - Renovação automática de sessão

## 📊 Integração com Backend

### Endpoints Utilizados
- `/api/auth/admin/login` - Autenticação
- `/api/admin/dashboard` - Dados do dashboard
- `/api/admin/users` - Gerenciamento de usuários
- `/api/admin/plans` - Gerenciamento de planos
- `/api/admin/gamification-rules` - Regras de gamificação
- `/api/admin/notification-templates` - Templates
- `/api/admin/landing-page` - Conteúdo da landing page

### Tratamento de Erros
- **Interceptors** - Tratamento global de erros
- **Toast notifications** - Feedback visual para o usuário
- **Fallbacks** - Estados de loading e erro
- **Retry logic** - Tentativas automáticas de reconexão

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add NEXT_PUBLIC_API_URL
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 Responsividade

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Adaptações
- **Sidebar colapsável** em telas menores
- **Tabelas responsivas** com scroll horizontal
- **Cards adaptáveis** para diferentes tamanhos
- **Formulários otimizados** para mobile

## 🎯 Próximos Passos

### Funcionalidades Planejadas
- [ ] **Modo escuro** completo
- [ ] **Notificações push** em tempo real
- [ ] **Exportação de relatórios** em PDF/Excel
- [ ] **Auditoria de ações** (log de atividades)
- [ ] **Backup automático** de configurações
- [ ] **Multi-idioma** (i18n)
- [ ] **PWA** (Progressive Web App)

### Melhorias Técnicas
- [ ] **Testes automatizados** (Jest + Testing Library)
- [ ] **Storybook** para documentação de componentes
- [ ] **CI/CD** com GitHub Actions
- [ ] **Monitoramento** com Sentry
- [ ] **Performance** com Lighthouse
- [ ] **SEO** otimizado

## 🤝 Contribuição

### Padrões de Código
- **ESLint** + **Prettier** para formatação
- **TypeScript** strict mode
- **Conventional Commits** para commits
- **Component Story Format** para documentação

### Fluxo de Desenvolvimento
1. **Fork** do repositório
2. **Branch** para nova funcionalidade
3. **Desenvolvimento** seguindo padrões
4. **Testes** e documentação
5. **Pull Request** com descrição detalhada

## 📞 Suporte

### Documentação
- **Storybook** - Componentes e exemplos
- **JSDoc** - Documentação de funções
- **README** - Guias e tutoriais

### Comunidade
- **Issues** - Reportar bugs e sugestões
- **Discussions** - Debates e dúvidas
- **Wiki** - Documentação detalhada

---

**Desenvolvido com ❤️ para o Baby Diary** 