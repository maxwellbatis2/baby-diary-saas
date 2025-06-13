export const theme = {
  colors: {
    primary: '#FF6B9D',        // Rosa suave
    secondary: '#4ECDC4',      // Verde água
    accent: '#FFE66D',         // Amarelo
    babyBlue: '#87CEEB',       // Azul bebê
    babyPink: '#FFB6C1',       // Rosa bebê
    babyYellow: '#FFFACD'      // Amarelo bebê
  },
  gradients: {
    primary: ['#FF6B9D', '#FFB6C1'], // Rosa para rosa claro
    ocean: ['#4ECDC4', '#87CEEB'],    // Verde água para azul bebê
    sunset: ['#FF6B9D', '#FFE66D'],   // Rosa para amarelo
    spring: ['#87CEEB', '#FFB6C1'],   // Verde bebê para rosa bebê
    rainbow: ['#FF6B9D', '#4ECDC4', '#FFE66D'] // Rosa, verde água, amarelo
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    fontWeight: '400',
  },
  spacing: (factor) => `${0.25 * factor}rem`, // 1 unit = 0.25rem
};