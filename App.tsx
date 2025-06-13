import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { theme } from './src/utils/theme';

type Screen = 'splash' | 'login' | 'dashboard';

interface Baby {
  id: string;
  name: string;
  age: string;
  photoUrl?: string;
}

interface DashboardStats {
  totalActivities: number;
  totalMemories: number;
  totalMilestones: number;
  streakDays: number;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [babies, setBabies] = useState<Baby[]>([
    {
      id: '1',
      name: 'Maria',
      age: '6 meses',
      photoUrl: 'https://example.com/maria.jpg',
    },
    {
      id: '2',
      name: 'João',
      age: '2 anos',
      photoUrl: 'https://example.com/joao.jpg',
    },
  ]);

  const [stats, setStats] = useState<DashboardStats>({
    totalActivities: 156,
    totalMemories: 89,
    totalMilestones: 23,
    streakDays: 7,
  });

  useEffect(() => {
    // Simular verificação de autenticação
    const checkAuth = async () => {
      // Aqui você faria a verificação real com o backend
      const token = await getStoredToken();
      if (token) {
        setIsAuthenticated(true);
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('login');
      }
    };

    setTimeout(checkAuth, 3000); // 3 segundos de splash
  }, []);

  const getStoredToken = async (): Promise<string | null> => {
    // Simular busca de token no AsyncStorage
    return null; // Por enquanto, sempre retorna null para mostrar login
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      // Aqui você faria a chamada real para o backend
      console.log('Tentando login:', email, password);
      
      // Simular resposta do servidor
      const mockUser = {
        id: '1',
        name: 'Mãe/Pai',
        email: email,
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  const handleBabyPress = (babyId: string) => {
    if (babyId === 'new') {
      console.log('Adicionar novo bebê');
      // Navegar para tela de adicionar bebê
    } else {
      console.log('Ver detalhes do bebê:', babyId);
      // Navegar para tela de detalhes do bebê
    }
  };

  const handleAddActivity = () => {
    console.log('Adicionar atividade');
    // Navegar para tela de adicionar atividade
  };

  const handleAddMemory = () => {
    console.log('Adicionar memória');
    // Navegar para tela de adicionar memória
  };

  const handleViewMilestones = () => {
    console.log('Ver marcos');
    // Navegar para tela de marcos
  };

  const handleViewAnalytics = () => {
    console.log('Ver analytics');
    // Navegar para tela de analytics
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onFinish={() => {
              if (isAuthenticated) {
                setCurrentScreen('dashboard');
              } else {
                setCurrentScreen('login');
              }
            }}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onRegister={() => {
              console.log('Navegar para registro');
              // Navegar para tela de registro
            }}
          />
        );

      case 'dashboard':
        return (
          <DashboardScreen
            babies={babies}
            stats={stats}
            onBabyPress={handleBabyPress}
            onAddActivity={handleAddActivity}
            onAddMemory={handleAddMemory}
            onViewMilestones={handleViewMilestones}
            onViewAnalytics={handleViewAnalytics}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar
        barStyle={currentScreen === 'splash' ? 'light-content' : 'dark-content'}
        backgroundColor={currentScreen === 'splash' ? 'transparent' : theme.colors.background}
        translucent
      />
      {renderScreen()}
    </>
  );
} 