import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <!-- Nested Router Outlet for Login/Register/Verify -->
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: var(--surface);
    }
  `]
})
export class AuthLayoutComponent {
  public themeService = inject(ThemeService);
}
