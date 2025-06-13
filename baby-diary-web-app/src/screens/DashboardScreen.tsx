import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import GradientCard from '../components/GradientCard';
import BabyCard from '../components/BabyCard';
import StatCard from '../components/StatCard';
import { useBabyData } from '../hooks/useBabyData';

const DashboardScreen = () => {
  const { babies, stats } = useBabyData();

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Dashboard</Text>
      
      <GradientCard title="Estatísticas Gerais" content={stats} />
      
      <View style={{ marginTop: 16 }}>
        {babies.map(baby => (
          <BabyCard key={baby.id} name={baby.name} photo={baby.photo} />
        ))}
      </View>
      
      <View style={{ marginTop: 16 }}>
        <StatCard title="Atividades Recentes" data={stats.recentActivities} />
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;