import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card premium-card">
        
        <div class="auth-header">
          <img [src]="'assets/logo-light.png'" alt="SmartDesk Logo" class="auth-logo" />
          <h1 class="text-headline-md">Activa tu Espacio</h1>
          <p class="text-body-md auth-subtitle">Ingresa el código que enviamos a tu correo.</p>
        </div>

        <form [formGroup]="verifyForm" (ngSubmit)="onSubmit()" class="auth-form">
          
          <div class="form-group">
            <label class="form-label text-label-sm">NOMBRE DE EMPRESA</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">domain</span>
              <input type="text" formControlName="companyName" placeholder="Acme Corp" class="form-input" />
            </div>
            <p class="form-hint">Este será el identificador de tu entorno de trabajo.</p>
          </div>

          <div class="form-group">
            <label class="form-label text-label-sm">CÓDIGO DE ACTIVACIÓN (OTP)</label>
            <div class="input-wrapper">
              <span class="material-symbols-outlined input-icon">key</span>
              <input type="text" formControlName="token" placeholder="123456" class="form-input otp-input" />
            </div>
          </div>

          <button type="submit" class="submit-btn" [disabled]="verifyForm.invalid || isLoading()">
            @if (isLoading()) {
              <div class="spinner"></div>
              <span>Activando Entorno...</span>
            } @else {
              <span>Activar y Entrar</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            }
          </button>
        </form>
        
        <div class="auth-footer">
          <p class="text-body-md"><a routerLink="/auth/login" class="auth-link">Volver al Login</a></p>
        </div>
      </div>
      
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
    .form-hint { font-size: 12px; color: var(--on-surface-variant); opacity: 0.5; margin-top: 6px; }
    
    .input-wrapper { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 16px; color: var(--on-surface-variant); opacity: 0.5; font-size: 20px; }
    .form-input {
      width: 100%; padding: 14px 16px 14px 48px; background: var(--surface-container-lowest);
      border: 1px solid var(--outline-variant); border-radius: 12px;
      font-family: 'Manrope', sans-serif; font-size: 15px; color: var(--on-surface); outline: none; transition: all 0.2s;
    }
    .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
    .otp-input { text-align: center; letter-spacing: 0.3em; text-transform: uppercase; }

    .submit-btn {
      margin-top: 12px; padding: 16px; background: var(--primary); color: var(--on-primary);
      border: none; border-radius: 12px; font-family: 'Geist', sans-serif; font-size: 15px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s;
    }
    .submit-btn:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(0,0,0,0.15); transform: translateY(-1px); }
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
export class VerifyComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);

  isLoading = signal(false);

  verifyForm = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(3)]],
    token: ['', [Validators.required]]
  });

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const savedCompanyName = localStorage.getItem('pendingCompanyName');
    
    const patchData: any = {};
    if (token) patchData.token = token;
    if (savedCompanyName) patchData.companyName = savedCompanyName;

    if (Object.keys(patchData).length > 0) {
      this.verifyForm.patchValue(patchData);
    }
  }

  onSubmit() {
    if (this.verifyForm.invalid) return;

    this.isLoading.set(true);
    const { token, companyName } = this.verifyForm.value;
    
    this.authService.activate(token!, companyName!).subscribe({
      next: () => {
        this.notification.success('¡Entorno de empresa creado con éxito! Inicia sesión ahora.', 5000);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(err.error?.message || 'Código inválido o expirado.');
      }
    });
  }
}
