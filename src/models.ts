export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Tip {
  title: string;
  description: string;
  icon: string;
}