
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string; // ISO string
  gender: Gender;
}

export interface GrowthRecord {
  id: string;
  date: string; // ISO string
  weight: number; // kg
  height: number; // cm
  notes?: string;
}

export interface MealRecord {
  id: string;
  date: string; // ISO string
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  description: string;
  imageUrl?: string;
}

export interface MealSuggestion {
  suggestedFor: string;
  dishName: string;
  description: string;
  ingredients: string[];
  instructions: string; // Thêm hướng dẫn nấu
  nutritionalBenefits: string;
}

export interface AIAnalysis {
  status: 'Normal' | 'Warning' | 'Good';
  message: string;
  recommendation: string;
}
