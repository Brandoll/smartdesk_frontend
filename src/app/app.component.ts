import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastComponent } from './shared/ui/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  // Inject the theme service to initialize dark mode on startup
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Theme is automatically initialized in the service constructor,
    // but injecting it ensures it runs when the app starts.
  }
}
