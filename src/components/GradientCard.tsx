import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../utils/theme';

interface GradientCardProps {
  title: string;
  subtitle?: string;
  gradient?: string[];
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: any;
  children?: React.ReactNode;
}

const { width } = Dimensions.get('window');

export const GradientCard: React.FC<GradientCardProps> = ({
  title,
  subtitle,
  gradient = theme.colors.gradients.primary,
  onPress,
  icon,
  style,
  children,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const CardContent = () => (
    <LinearGradient
      colors={gradient}
      style={[styles.gradient, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {children}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <CardContent />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: theme.spacing.md,
  },
  gradient: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minHeight: 120,
    ...theme.shadows.medium,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.h5,
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body2,
    color: theme.colors.textInverse,
    opacity: 0.9,
  },
});

export default GradientCard; 