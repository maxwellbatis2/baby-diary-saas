import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
      <p className="stat-description">{description}</p>
    </div>
  );
};

export default StatCard;