// src/types/index.ts

export interface Baby {
    id: string;
    name: string;
    birthDate: string;
    photoUrl?: string;
}

export interface Activity {
    type: 'sleep' | 'feeding' | 'diaperChange';
    timestamp: string;
    duration?: number; // in minutes for sleep
    amount?: number; // in ml for feeding
}

export interface Milestone {
    title: string;
    description: string;
    date: string;
}

export interface Memory {
    id: string;
    photoUrl: string;
    description: string;
    tags?: string[];
    date: string;
}

export interface User {
    id: string;
    email: string;
    babies: Baby[];
}