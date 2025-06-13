import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../utils/theme';
import GradientCard from '../components/GradientCard';

const { width } = Dimensions.get('window');

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

interface DashboardScreenProps {
  babies: Baby[];
  stats: DashboardStats;
  onBabyPress: (babyId: string) => void;
  onAddActivity: () => void;
  onAddMemory: () => void;
  onViewMilestones: () => void;
  onViewAnalytics: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  babies,
  stats,
  onBabyPress,
  onAddActivity,
  onAddMemory,
  onViewMilestones,
  onViewAnalytics,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simular refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
          <Text style={styles.headerTitle}>Baby Diary</Text>
          <Text style={styles.headerSubtitle}>
            Acompanhe o desenvolvimento do seu bebê
          </Text>
        </View>
      </LinearGradient>

      {/* Babies Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seus Bebês</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.babiesContainer}
        >
          {babies.map((baby) => (
            <TouchableOpacity
              key={baby.id}
              style={styles.babyCard}
              onPress={() => onBabyPress(baby.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.colors.gradients.ocean}
                style={styles.babyCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.babyEmoji}>👶</Text>
                <Text style={styles.babyName}>{baby.name}</Text>
                <Text style={styles.babyAge}>{baby.age}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.addBabyCard}
            onPress={() => onBabyPress('new')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.colors.gradients.spring}
              style={styles.addBabyCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.addBabyIcon}>+</Text>
              <Text style={styles.addBabyText}>Adicionar Bebê</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActionsGrid}>
          <GradientCard
            title="Adicionar Atividade"
            subtitle="Registre sono, alimentação..."
            gradient={theme.colors.gradients.sunset}
            onPress={onAddActivity}
            icon={<Text style={styles.actionIcon}>📝</Text>}
          />
          
          <GradientCard
            title="Nova Memória"
            subtitle="Guarde momentos especiais"
            gradient={theme.colors.gradients.ocean}
            onPress={onAddMemory}
            icon={<Text style={styles.actionIcon}>📸</Text>}
          />
          
          <GradientCard
            title="Ver Marcos"
            subtitle="Acompanhe o desenvolvimento"
            gradient={theme.colors.gradients.spring}
            onPress={onViewMilestones}
            icon={<Text style={styles.actionIcon}>🎯</Text>}
          />
          
          <GradientCard
            title="Analytics"
            subtitle="Veja estatísticas detalhadas"
            gradient={theme.colors.gradients.rainbow}
            onPress={onViewAnalytics}
            icon={<Text style={styles.actionIcon}>📊</Text>}
          />
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estatísticas</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalActivities}</Text>
            <Text style={styles.statLabel}>Atividades</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalMemories}</Text>
            <Text style={styles.statLabel}>Memórias</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalMilestones}</Text>
            <Text style={styles.statLabel}>Marcos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Dias Seguidos</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atividade Recente</Text>
        <View style={styles.recentActivityCard}>
          <Text style={styles.recentActivityText}>
            Última atividade: Sono da tarde - 2h atrás
          </Text>
          <Text style={styles.recentActivityText}>
            Nova memória: Primeiro sorriso - 1 dia atrás
          </Text>
          <Text style={styles.recentActivityText}>
            Marco alcançado: Primeiro passo - 3 dias atrás
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    ...theme.typography.h4,
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    ...theme.typography.body1,
    color: theme.colors.textInverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  babiesContainer: {
    paddingRight: theme.spacing.lg,
  },
  babyCard: {
    width: 120,
    height: 140,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  babyCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  babyEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  babyName: {
    ...theme.typography.h6,
    color: theme.colors.textInverse,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  babyAge: {
    ...theme.typography.caption,
    color: theme.colors.textInverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  addBabyCard: {
    width: 120,
    height: 140,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  addBabyCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  addBabyIcon: {
    fontSize: 32,
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.sm,
  },
  addBabyText: {
    ...theme.typography.body2,
    color: theme.colors.textInverse,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionIcon: {
    fontSize: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statNumber: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  recentActivityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  recentActivityText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
});

export default DashboardScreen; 