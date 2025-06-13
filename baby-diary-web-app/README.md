# 🍼 Baby Diary Web App

> **Aplicativo web bonito e interativo para acompanhamento do desenvolvimento de bebês**  
> Desenvolvido com React, TypeScript e muito amor ❤️

## ✨ **Características Principais**

### 🎨 **Design Fofo e Colorido**
- **Gradientes vibrantes** e cores fofas
- **Animações suaves** e interativas
- **Interface intuitiva** para pais
- **Tema personalizado** com cores de bebê

### 📱 **Funcionalidades Principais**
- **Dashboard interativo** com estatísticas
- **Gestão de múltiplos bebês**
- **Registro de atividades** (sono, alimentação, fraldas)
- **Memórias especiais** com fotos
- **Marcos de desenvolvimento**
- **Gamificação** com pontos e badges
- **Notificações push** personalizadas
- **Modo offline** para uso sem internet

## 🚀 **Quick Start**

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone https://github.com/babydiary/web-app.git
cd baby-diary-web-app

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

## 📱 **Telas Principais**

### 🎨 **Splash Screen**
- Animação de entrada com gradiente
- Logo animado com rotação
- Transição suave para login

### 🔐 **Login Screen**
- Campos estilizados com gradientes
- Validação em tempo real
- Animações de loading
- Opção de registro

### 📊 **Dashboard**
- Cards coloridos com estatísticas
- Lista de bebês com fotos
- Ações rápidas para atividades
- Gráficos de desenvolvimento

## 🎯 **Tecnologias Utilizadas**

### **Core**
- **React** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **React Router** - Navegação entre telas

### **UI/UX**
- **Styled Components** - Estilização
- **React Spring** - Animações

### **Funcionalidades**
- **Axios** - Requisições HTTP
- **React Hook Form** - Gerenciamento de formulários
- **React Query** - Gerenciamento de estado remoto

## 📊 **Estrutura do Projeto**

```
src/
├── components/           # Componentes reutilizáveis
│   ├── GradientCard.tsx # Card com gradiente
│   ├── BabyCard.tsx     # Card do bebê
│   └── StatCard.tsx     # Card de estatísticas
├── screens/             # Telas do app
│   ├── SplashScreen.tsx # Tela de entrada
│   ├── LoginScreen.tsx  # Tela de login
│   └── DashboardScreen.tsx # Dashboard principal
├── utils/               # Utilitários
│   ├── theme.ts         # Tema e cores
│   ├── api.ts           # Integração com backend
│   └── storage.ts       # Armazenamento local
├── hooks/               # Custom hooks
├── services/            # Serviços
└── types/               # Tipos TypeScript
```

## 🔧 **Configuração**

### **Variáveis de Ambiente**
```bash
# .env
API_URL=https://api.babydiary.com
```

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 **Suporte**

- **Email**: support@babydiary.app
- **Documentação**: https://docs.babydiary.app
- **Issues**: GitHub Issues

## 🎉 **Próximos Passos**

- [ ] **PWA** (Progressive Web App)
- [ ] **Machine Learning** avançado
- [ ] **Realidade Aumentada** para fotos

---

**Desenvolvido com ❤️ para ajudar pais a acompanhar cada momento especial de seus bebês**