import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { QuizQuestion } from '../../models';

type QuizState = 'loading' | 'active' | 'finished';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class QuizComponent implements OnDestroy {
  private geminiService = inject(GeminiService);

  quizState = signal<QuizState>('loading');
  questions = signal<QuizQuestion[]>([]);
  currentQuestionIndex = signal(0);
  selectedAnswer = signal<string | null>(null);
  score = signal(0);
  showExplanation = signal(false);

  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  isLastQuestion = computed(() => this.currentQuestionIndex() === this.questions().length - 1);

  constructor() {
    this.startQuiz();
  }
  
  ngOnDestroy(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  async startQuiz() {
    this.quizState.set('loading');
    this.questions.set([]);
    this.questions.set(await this.geminiService.generateQuiz());
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(null);
    this.score.set(0);
    this.showExplanation.set(false);
    this.quizState.set('active');
  }

  selectAnswer(answer: string) {
    if (this.selectedAnswer()) return;

    this.selectedAnswer.set(answer);
    this.showExplanation.set(true);
    
    const isCorrect = answer === this.currentQuestion().correctAnswer;
    if (isCorrect) {
      this.score.update(s => s + 1);
      this.speak(`Correto! ${this.currentQuestion().explanation}`);
    } else {
      this.speak(`Incorreto. ${this.currentQuestion().explanation}`);
    }
  }
  
  speak(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  }

  nextQuestion() {
    window.speechSynthesis.cancel();
    if (this.isLastQuestion()) {
      this.quizState.set('finished');
    } else {
      this.currentQuestionIndex.update(i => i + 1);
      this.selectedAnswer.set(null);
      this.showExplanation.set(false);
    }
  }
  
  getButtonClass(option: string): string {
    if (!this.selectedAnswer()) {
      return 'bg-white dark:bg-neutral-700 hover:bg-primary-light dark:hover:bg-neutral-600 text-primary-dark dark:text-white';
    }
    const isCorrect = option === this.currentQuestion().correctAnswer;
    const isSelected = option === this.selectedAnswer();

    if (isCorrect) return 'bg-green-500 text-white';
    if (isSelected && !isCorrect) return 'bg-red-500 text-white';
    return 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed';
  }
}