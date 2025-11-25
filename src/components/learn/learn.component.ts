import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { Tip } from '../../models';

@Component({
  selector: 'app-learn',
  templateUrl: './learn.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class LearnComponent implements OnDestroy {
  private geminiService = inject(GeminiService);
  
  tips = signal<Tip[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  speakingTip = signal<string | null>(null);

  constructor() {
    this.loadTips();
  }

  ngOnDestroy(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  async loadTips() {
    this.loading.set(true);
    this.error.set(null);
    this.tips.set([]);
    try {
      const tips = await this.geminiService.generateTips();
      this.tips.set(tips);
    } catch (e) {
      this.error.set('Falha ao carregar as dicas. Por favor, tente novamente.');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  toggleSpeak(tip: Tip, event: Event): void {
    event.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta a leitura de texto.');
      return;
    }

    if (this.speakingTip() === tip.title) {
      window.speechSynthesis.cancel();
      this.speakingTip.set(null);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = `${tip.title}. ${tip.description}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';
      utterance.onstart = () => this.speakingTip.set(tip.title);
      utterance.onend = () => this.speakingTip.set(null);
      utterance.onerror = () => this.speakingTip.set(null);
      window.speechSynthesis.speak(utterance);
    }
  }
}