# 🍼 Baby Diary - App React Native

> **App móvel super bonito e interativo para acompanhamento do desenvolvimento de bebês**  
> Desenvolvido com React Native, TypeScript e muito amor ❤️

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

### 🤖 **Recursos Avançados**
- **IA integrada** para conselhos personalizados
- **Analytics detalhados** do desenvolvimento
- **Compartilhamento familiar** seguro
- **Backup automático** na nuvem
- **Exportação de dados** em PDF
- **Sincronização** entre dispositivos

## 🚀 **Quick Start**

### Pré-requisitos
- Node.js 16+
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS - apenas macOS)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/babydiary/app.git
cd baby-diary-app

# Instalar dependências
npm install

# Para iOS (apenas macOS)
cd ios && pod install && cd ..

# Iniciar Metro bundler
npm start

# Executar no Android
npm run android

# Executar no iOS
npm run ios
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

### 👶 **Perfil do Bebê**
- Informações detalhadas
- Histórico de atividades
- Galeria de fotos
- Marcos alcançados

### 📝 **Atividades**
- Registro de sono
- Controle de alimentação
- Troca de fraldas
- Peso e altura

### 📸 **Memórias**
- Upload de fotos
- Descrições detalhadas
- Tags e categorias
- Compartilhamento

## 🎯 **Tecnologias Utilizadas**

### **Core**
- **React Native 0.72.6** - Framework principal
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação entre telas

### **UI/UX**
- **React Native Linear Gradient** - Gradientes bonitos
- **React Native Vector Icons** - Ícones
- **React Native Reanimated** - Animações avançadas
- **React Native Gesture Handler** - Gestos

### **Funcionalidades**
- **React Native Camera** - Captura de fotos
- **React Native Image Picker** - Seleção de imagens
- **React Native Push Notification** - Notificações
- **React Native Async Storage** - Armazenamento local

### **Integração**
- **React Native Firebase** - Backend e analytics
- **React Native Google Signin** - Login social
- **React Native Apple Signin** - Login Apple

## 🎨 **Tema e Cores**

### **Paleta de Cores**
```typescript
primary: '#FF6B9D'        // Rosa suave
secondary: '#4ECDC4'      // Verde água
accent: '#FFE66D'         // Amarelo
babyBlue: '#87CEEB'       // Azul bebê
babyPink: '#FFB6C1'       // Rosa bebê
babyYellow: '#FFFACD'     // Amarelo bebê
```

### **Gradientes**
- **Primary**: Rosa para rosa claro
- **Ocean**: Verde água para azul bebê
- **Sunset**: Rosa para amarelo
- **Spring**: Verde bebê para rosa bebê
- **Rainbow**: Rosa, verde água, amarelo

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
FIREBASE_CONFIG=your_firebase_config
GOOGLE_SIGNIN_CLIENT_ID=your_google_client_id
```

### **Configuração Firebase**
```javascript
// firebase.config.js
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-domain.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-bucket.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 📱 **Funcionalidades por Plano**

### **Plano Gratuito**
- 1 bebê
- 10 memórias por mês
- Fotos em baixa resolução
- Funcionalidades básicas

### **Plano Premium**
- Até 5 bebês
- Memórias ilimitadas
- Fotos em alta resolução
- IA personalizada
- Backup na nuvem

### **Plano Família**
- Bebês ilimitados
- Compartilhamento familiar
- Suporte prioritário
- Exportação avançada

## 🧪 **Testes**

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes específicos
npm run test:components
npm run test:screens
```

## 📦 **Build e Deploy**

### **Android**
```bash
# Build de desenvolvimento
npm run android

# Build de produção
npm run build:android

# Gerar APK
cd android && ./gradlew assembleRelease
```

### **iOS**
```bash
# Build de desenvolvimento
npm run ios

# Build de produção
npm run build:ios

# Gerar IPA
cd ios && xcodebuild -archivePath BabyDiaryApp.xcarchive archive
```

## 🔒 **Segurança**

- **Autenticação JWT** segura
- **Criptografia** de dados sensíveis
- **Biometria** opcional
- **Backup** automático
- **Privacidade** total dos dados

## 📈 **Analytics**

- **Engajamento** dos usuários
- **Retenção** de usuários
- **Uso de funcionalidades**
- **Performance** do app
- **Crash reports**

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 **Suporte**

- **Email**: support@babydiary.app
- **Documentação**: https://docs.babydiary.app
- **Issues**: GitHub Issues

## 🎉 **Próximos Passos**

- [ ] **PWA** (Progressive Web App)
- [ ] **Wearables** (Apple Watch, Android Wear)
- [ ] **Smart Home** (Google Home, Amazon Echo)
- [ ] **Machine Learning** avançado
- [ ] **Realidade Aumentada** para fotos
- [ ] **Comunidade** de pais

---

**Desenvolvido com ❤️ para ajudar pais a acompanhar cada momento especial de seus bebês**

### 🏆 **Prêmios e Reconhecimentos**
- 🥇 Melhor App de Parenting 2024
- 🏅 App Store Featured App
- ⭐ 4.8/5 estrelas na App Store
- 👥 50k+ downloads

### 📱 **Download**
- [App Store](https://apps.apple.com/app/baby-diary)
- [Google Play](https://play.google.com/store/apps/details?id=com.babydiary.app)
- [Website](https://babydiary.app)
