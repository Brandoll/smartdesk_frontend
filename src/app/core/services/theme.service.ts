import { Injectable, effect } from '@angular/core';
import { AppStateService } from '../state/app-state.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(private appState: AppStateService) {
    this.initTheme();

    // Effect that runs whenever the theme signal changes
    effect(() => {
      const theme = this.appState.theme();
      this.applyTheme(theme);
    });
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.appState.setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.appState.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  public toggleTheme(): void {
    const currentTheme = this.appState.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.appState.setTheme(newTheme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }
}
