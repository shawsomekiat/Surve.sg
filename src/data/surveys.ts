export interface Question {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'yes_no';
  text: string;
  options?: string[];
}

export interface SurveyTargeting {
  ageMin?: number;
  ageMax?: number;
  genders?: string[];       // ['male','female','non-binary'] — empty = all
  employment?: string[];    // empty = all
  requiresVerification?: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  rewardSGD: number;
  durationMins: number;
  targetResponses: number;
  currentResponses: number;
  status: 'active' | 'draft' | 'paused';
  audienceTag: string;
  createdAt: string;
  expiresAt?: string;       // ISO date string
  targeting?: SurveyTargeting;
  questions: Question[];
}

export const surveys: Survey[] = [
  {
    id: '1',
    title: 'Fitness & Health Habits',
    description: 'Share your wellness routine',
    rewardSGD: 3.50,
    durationMins: 7,
    targetResponses: 200,
    currentResponses: 0,
    status: 'active',
    audienceTag: 'General Population',
    createdAt: '3 Jan',
    expiresAt: '2026-03-30',
    questions: [
      { id: 'q1', type: 'multiple_choice', text: 'How often do you exercise per week?', options: ['Never', '1-2 times', '3-4 times', '5+ times'] },
      { id: 'q2', type: 'multiple_choice', text: 'What type of exercise do you prefer?', options: ['Running', 'Gym', 'Sports', 'Yoga/Pilates', 'Swimming'] },
      { id: 'q3', type: 'rating', text: 'Rate your current fitness level (1-5)' },
      { id: 'q4', type: 'text', text: 'What is your biggest health goal this year?' },
    ],
  },
  {
    id: '2',
    title: 'Hawker Centre Dining Survey',
    description: 'Tell us about your hawker food experiences',
    rewardSGD: 2.00,
    durationMins: 4,
    targetResponses: 600,
    currentResponses: 0,
    status: 'active',
    audienceTag: 'General Population',
    createdAt: '4 Jan',
    expiresAt: '2026-04-01',
    questions: [
      { id: 'q1', type: 'multiple_choice', text: 'How often do you visit hawker centres?', options: ['Daily', '2-3 times a week', 'Once a week', 'Rarely', 'Never'] },
      { id: 'q2', type: 'multiple_choice', text: 'What do you typically spend per meal?', options: ['Under S$5', 'S$5-S$10', 'S$10-S$15', 'Over S$15'] },
      { id: 'q3', type: 'text', text: 'What is your favourite hawker centre in Singapore?' },
    ],
  },
  {
    id: '3',
    title: 'Online Shopping Behavior 2024',
    description: 'Understanding e-commerce trends in Singapore',
    rewardSGD: 5.50,
    durationMins: 12,
    targetResponses: 350,
    currentResponses: 0,
    status: 'active',
    audienceTag: 'Age 18–40',
    createdAt: '3 Jan',
    expiresAt: '2026-04-05',
    targeting: {
      ageMin: 18,
      ageMax: 40,
      employment: ['student', 'full-time', 'part-time', 'self-employed'],
    },
    questions: [
      { id: 'q1', type: 'multiple_choice', text: 'How often do you shop online?', options: ['Daily', 'Weekly', 'Monthly', 'Rarely'] },
      { id: 'q2', type: 'multiple_choice', text: 'Which platform do you use most?', options: ['Shopee', 'Lazada', 'Amazon', 'Carousell', 'Other'] },
      { id: 'q3', type: 'multiple_choice', text: 'Average monthly online spend?', options: ['Under S$50', 'S$50-S$200', 'S$200-S$500', 'Over S$500'] },
      { id: 'q4', type: 'rating', text: 'How satisfied are you with delivery speeds in Singapore? (1-5)' },
      { id: 'q5', type: 'text', text: 'What would make you shop online more?' },
    ],
  },
  {
    id: '4',
    title: 'Morning Coffee Habits',
    description: 'Tell us about your kopi routine!',
    rewardSGD: 1.80,
    durationMins: 3,
    targetResponses: 500,
    currentResponses: 0,
    status: 'active',
    audienceTag: 'General Population',
    createdAt: '4 Jan',
    expiresAt: '2026-03-29',
    questions: [
      { id: 'q1', type: 'multiple_choice', text: 'How many cups of coffee do you drink daily?', options: ['None', '1 cup', '2 cups', '3+ cups'] },
      { id: 'q2', type: 'multiple_choice', text: 'Where do you usually get your morning coffee?', options: ['Kopitiam', 'Starbucks/Coffee Bean', 'Home-brewed', 'Office pantry', 'Convenience store'] },
      { id: 'q3', type: 'yes_no', text: 'Do you prefer kopi over Western-style coffee?' },
    ],
  },
  {
    id: '5',
    title: 'Public Transport Experience Survey',
    description: "Help improve Singapore's public transport",
    rewardSGD: 4.00,
    durationMins: 8,
    targetResponses: 400,
    currentResponses: 0,
    status: 'active',
    audienceTag: 'Verified Only',
    createdAt: '4 Jan',
    expiresAt: '2026-04-08',
    targeting: {
      requiresVerification: true,
    },
    questions: [
      { id: 'q1', type: 'multiple_choice', text: 'Which public transport do you use most?', options: ['MRT', 'Bus', 'Both equally', 'Neither'] },
      { id: 'q2', type: 'rating', text: 'Rate MRT reliability (1-5)' },
      { id: 'q3', type: 'rating', text: 'Rate bus punctuality (1-5)' },
      { id: 'q4', type: 'text', text: 'What one improvement would make the biggest difference?' },
    ],
  },
  {
    id: '6',
    title: 'Weekend Activities in SG',
    description: 'Share how you spend your weekends',
    rewardSGD: 3.00,
    durationMins: 6,
    targetResponses: 250,
    currentResponses: 0,
    status: 'active',
    audienceTag: 'Age 21–45',
    createdAt: '4 Jan',
    expiresAt: '2026-04-02',
    targeting: {
      ageMin: 21,
      ageMax: 45,
    },
    questions: [
      { id: 'q1', type: 'multiple_choice', text: 'Where do you spend most weekends?', options: ['Outdoors/Parks', 'Shopping malls', 'Home', 'Sports facilities', 'Food & dining'] },
      { id: 'q2', type: 'multiple_choice', text: 'Typical weekend spending?', options: ['Under S$30', 'S$30-S$100', 'S$100-S$300', 'Over S$300'] },
      { id: 'q3', type: 'text', text: 'What is your favourite weekend activity in Singapore?' },
    ],
  },
  {
    id: '7',
    title: 'Beta test',
    description: 'Just testing',
    rewardSGD: 1.00,
    durationMins: 5,
    targetResponses: 600,
    currentResponses: 0,
    status: 'active',
    audienceTag: 'General Population',
    createdAt: '5 Jan',
    expiresAt: '2026-03-31',
    questions: [
      { id: 'q1', type: 'yes_no', text: 'Is this app easy to use?' },
      { id: 'q2', type: 'rating', text: 'Overall experience rating (1-5)' },
    ],
  },
];
