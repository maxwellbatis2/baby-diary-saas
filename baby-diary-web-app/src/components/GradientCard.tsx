import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GradientCardProps {
  title: string;
  content: string;
}

const GradientCard: React.FC<GradientCardProps> = ({ title, content }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'linear-gradient(45deg, #FF6B9D, #FFE66D)', // Example gradient
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    fontSize: 14,
    color: '#fff',
  },
});

export default GradientCard;