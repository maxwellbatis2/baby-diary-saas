import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    // Cores principais - Fofas e vibrantes
    primary: '#FF6B9D',           // Rosa suave
    primaryLight: '#FF8FB1',      // Rosa claro
    primaryDark: '#E55A8A',       // Rosa escuro
    
    secondary: '#4ECDC4',         // Verde água
    secondaryLight: '#6ED7CF',    // Verde água claro
    secondaryDark: '#3BB8B0',     // Verde água escuro
    
    accent: '#FFE66D',            // Amarelo
    accentLight: '#FFF285',       // Amarelo claro
    accentDark: '#FFD93D',        // Amarelo escuro
    
    // Cores de fundo
    background: '#F8F9FA',        // Cinza muito claro
    surface: '#FFFFFF',           // Branco
    surfaceVariant: '#F1F3F4',    // Cinza claro
    
    // Cores de texto
    text: '#2C3E50',              // Azul escuro
    textSecondary: '#7F8C8D',     // Cinza médio
    textLight: '#BDC3C7',         // Cinza claro
    textInverse: '#FFFFFF',       // Branco
    
    // Cores de status
    success: '#2ECC71',           // Verde
    warning: '#F39C12',           // Laranja
    error: '#E74C3C',             // Vermelho
    info: '#3498DB',              // Azul
    
    // Cores especiais - Fofas
    babyBlue: '#87CEEB',          // Azul bebê
    babyPink: '#FFB6C1',          // Rosa bebê
    babyYellow: '#FFFACD',        // Amarelo bebê
    babyGreen: '#98FB98',         // Verde bebê
    babyPurple: '#DDA0DD',        // Roxo bebê
    babyOrange: '#FFB347',        // Laranja bebê
    
    // Gradientes - Super coloridos
    gradients: {
      primary: ['#FF6B9D', '#FF8FB1'],
      secondary: ['#4ECDC4', '#6ED7CF'],
      accent: ['#FFE66D', '#FFF285'],
      sunset: ['#FF6B9D', '#FFE66D'],
      ocean: ['#4ECDC4', '#87CEEB'],
      spring: ['#98FB98', '#FFB6C1'],
      rainbow: ['#FF6B9D', '#4ECDC4', '#FFE66D'],
      cotton: ['#FFB6C1', '#87CEEB', '#FFFACD'],
    }
  },
  
  // Tipografia
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    body1: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
  },
  
  // Espaçamentos
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Bordas
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 50,
  },
  
  // Sombras
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6.27,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 10.32,
      elevation: 8,
    },
  },
  
  // Dimensões
  dimensions: {
    width,
    height,
    isSmallDevice: width < 375,
    isMediumDevice: width >= 375 && width < 414,
    isLargeDevice: width >= 414,
  },
  
  // Animações
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
};

export type Theme = typeof theme;
export default theme; 