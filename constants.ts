// Simplified WHO Growth Standards (Median - P50) for Boys and Girls
// Age in months
export const WHO_STANDARDS = {
  boys: {
    weight: [
      { age: 0, val: 3.3 }, { age: 3, val: 6.4 }, { age: 6, val: 7.9 },
      { age: 12, val: 9.6 }, { age: 24, val: 12.2 }, { age: 36, val: 14.3 },
      { age: 48, val: 16.3 }, { age: 60, val: 18.3 }
    ],
    height: [
      { age: 0, val: 49.9 }, { age: 3, val: 61.4 }, { age: 6, val: 67.6 },
      { age: 12, val: 75.7 }, { age: 24, val: 87.8 }, { age: 36, val: 96.1 },
      { age: 48, val: 103.3 }, { age: 60, val: 110.0 }
    ]
  },
  girls: {
    weight: [
      { age: 0, val: 3.2 }, { age: 3, val: 5.8 }, { age: 6, val: 7.3 },
      { age: 12, val: 8.9 }, { age: 24, val: 11.5 }, { age: 36, val: 13.9 },
      { age: 48, val: 15.5 }, { age: 60, val: 17.4 }
    ],
    height: [
      { age: 0, val: 49.1 }, { age: 3, val: 59.8 }, { age: 6, val: 65.7 },
      { age: 12, val: 74.0 }, { age: 24, val: 86.4 }, { age: 36, val: 95.1 },
      { age: 48, val: 102.7 }, { age: 60, val: 109.4 }
    ]
  }
};

export const MEAL_TYPES = [
  { id: 'Breakfast', label: 'Bữa sáng' },
  { id: 'Lunch', label: 'Bữa trưa' },
  { id: 'Dinner', label: 'Bữa tối' },
  { id: 'Snack', label: 'Bữa phụ' },
];
