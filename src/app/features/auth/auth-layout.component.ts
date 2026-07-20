import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
}
