import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

const FONT_SIZE_STEP = 2;
const DEFAULT_FONT_SIZE = 16;
const MAX_FONT_SIZE = 24;
const MIN_FONT_SIZE = 12;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
})
export class HeaderComponent implements OnInit {
  isMenuOpen = signal(false);
  isDarkMode = signal(false);
  currentFontSize = signal(DEFAULT_FONT_SIZE);

  ngOnInit() {
    this.initializeDarkMode();
    this.applyFontSize();
  }
  
  initializeDarkMode() {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  toggleDarkMode() {
    this.isDarkMode.update(isDark => {
      const newIsDark = !isDark;
      if (newIsDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newIsDark;
    });
  }

  increaseFontSize() {
    this.currentFontSize.update(size => Math.min(size + FONT_SIZE_STEP, MAX_FONT_SIZE));
    this.applyFontSize();
  }

  decreaseFontSize() {
    this.currentFontSize.update(size => Math.max(size - FONT_SIZE_STEP, MIN_FONT_SIZE));
    this.applyFontSize();
  }

  private applyFontSize() {
    document.documentElement.style.fontSize = `${this.currentFontSize()}px`;
  }
}