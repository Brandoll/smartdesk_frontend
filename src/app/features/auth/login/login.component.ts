import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card premium-card">
        
        <div class="auth-header">
          <img [src]="'assets/logo-light.png'" alt="SmartDesk Logo" class="auth-logo" />
          <h1 class="text-headline-md">Inicia Sesión</h1>
          <p class="text-body-md auth-subtitle">Bienvenido de vuelta a SmartDesk AI</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          
          <div class="form-group">
            <label class="form-label text-label-sm">CORREO ELECTRÓNICO</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">mail</span>
              <input 
                type="email" 
                formControlName="email" 
                placeholder="tu@empresa.com" 
                class="form-input" 
                [class.invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              />
            </div>
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <span class="error-msg text-label-sm">Correo inválido</span>
            }
          </div>

          <div class="form-group">
            <div class="flex justify-between items-center mb-1">
              <label class="form-label text-label-sm" style="margin-bottom:0">CONTRASEÑA</label>
              <a href="#" class="forgot-link text-label-sm">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">lock</span>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password" 
                placeholder="••••••••" 
                class="form-input"
                [class.invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              />
              <button type="button" class="toggle-pwd-btn" (click)="showPassword = !showPassword">
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <button type="submit" class="submit-btn" [disabled]="loginForm.invalid || loading()">
            @if (loading()) {
              <div class="spinner"></div>
              <span>Verificando...</span>
            } @else {
              <span>Ingresar al Sistema</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            }
          </button>
        </form>
        
        <div class="auth-footer">
          <p class="text-body-md">¿No tienes cuenta? <a routerLink="/auth/register" class="auth-link">Regístrate aquí</a></p>
        </div>
      </div>
      
      <!-- Design Background Elements -->
      <div class="bg-blur-blob top-left"></div>
      <div class="bg-blur-blob bottom-right"></div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; background: var(--surface); overflow: hidden; }

    .auth-container {
      height: 100vh; display: flex; align-items: center; justify-content: center; position: relative;
    }

    .bg-blur-blob {
      position: absolute; width: 600px; height: 600px; border-radius: 50%;
      filter: blur(80px); opacity: 0.4; z-index: 0; pointer-events: none;
    }
    .bg-blur-blob.top-left {
      background: radial-gradient(circle, #e2e2e2 0%, transparent 70%); top: -200px; left: -200px;
    }
    .bg-blur-blob.bottom-right {
      background: radial-gradient(circle, #dad9e3 0%, transparent 70%); bottom: -200px; right: -200px;
    }

    .auth-card {
      width: 100%; max-width: 440px; padding: 48px 40px; position: relative; z-index: 10;
      background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    }

    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .auth-subtitle { color: var(--on-surface-variant); opacity: 0.7; margin-top: 8px; }

    .auth-form { display: flex; flex-direction: column; gap: 20px; }

    .form-group { display: flex; flex-direction: column; }
    .form-label { color: var(--on-surface-variant); letter-spacing: 0.05em; margin-bottom: 8px; }
    
    .input-wrapper { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 16px; color: var(--on-surface-variant); opacity: 0.5; font-size: 20px; }
    .form-input {
      width: 100%; padding: 14px 16px 14px 48px; background: var(--surface-container-lowest);
      border: 1px solid var(--outline-variant); border-radius: 12px;
      font-family: 'Manrope', sans-serif; font-size: 15px; color: var(--on-surface); outline: none; transition: all 0.2s;
    }
    .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
    .form-input.invalid { border-color: var(--error); }
    
    .toggle-pwd-btn {
      position: absolute; right: 12px; background: transparent; border: none; cursor: pointer;
      color: var(--on-surface-variant); opacity: 0.5; display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s;
    }
    .toggle-pwd-btn:hover { opacity: 0.8; }
    
    .error-msg { color: var(--error); margin-top: 6px; font-weight: 500; }
    
    .forgot-link { color: var(--primary); text-decoration: none; opacity: 0.7; transition: opacity 0.2s; }
    .forgot-link:hover { opacity: 1; text-decoration: underline; }

    .submit-btn {
      margin-top: 12px; padding: 16px; background: var(--primary); color: var(--on-primary);
      border: none; border-radius: 12px; font-family: 'Geist', sans-serif; font-size: 15px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s;
    }
    .submit-btn:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(0,0,0,0.15); transform: translateY(-1px); }
    .submit-btn:active:not(:disabled) { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

    .spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-footer { margin-top: 32px; text-align: center; color: var(--on-surface-variant); }
    .auth-link { color: var(--primary); font-family: 'Geist', sans-serif; font-weight: 600; text-decoration: none; }
    .auth-link:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  showPassword = false;
  loading = signal(false);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/app/dashboard']);
        this.notification.success('Bienvenido a SmartDesk');
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Error de autenticación');
      }
    });
  }
}
