import React from 'react';

interface BabyCardProps {
  name: string;
  photoUrl: string;
  age: number; // Age in months
}

const BabyCard: React.FC<BabyCardProps> = ({ name, photoUrl, age }) => {
  return (
    <div className="baby-card">
      <img src={photoUrl} alt={`${name}'s photo`} className="baby-photo" />
      <h2 className="baby-name">{name}</h2>
      <p className="baby-age">{age} months old</p>
    </div>
  );
};

export default BabyCard;