import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animations = [
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Scale up
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Rotate
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      // Slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();

    // Auto navigate after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, rotateAnim, slideAnim, onFinish]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={theme.colors.gradients.rainbow}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating bubbles */}
        <Animated.View style={[styles.bubble, styles.bubble1, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.bubble, styles.bubble2, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.bubble, styles.bubble3, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.bubble, styles.bubble4, { opacity: fadeAnim }]} />

        {/* Main content */}
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <View style={styles.logo}>
              <Text style={styles.logoText}>🍼</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Baby Diary</Text>
            <Text style={styles.subtitle}>Acompanhe cada momento especial</Text>
          </Animated.View>

          {/* Loading dots */}
          <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
              <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
              <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  logoText: {
    fontSize: 60,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textInverse,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...theme.typography.body1,
    color: theme.colors.textInverse,
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingContainer: {
    marginTop: theme.spacing.xl,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textInverse,
    marginHorizontal: 4,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bubble1: {
    width: 80,
    height: 80,
    top: height * 0.1,
    left: width * 0.1,
  },
  bubble2: {
    width: 60,
    height: 60,
    top: height * 0.2,
    right: width * 0.1,
  },
  bubble3: {
    width: 100,
    height: 100,
    bottom: height * 0.2,
    left: width * 0.2,
  },
  bubble4: {
    width: 40,
    height: 40,
    bottom: height * 0.1,
    right: width * 0.2,
  },
});

export default SplashScreen; 