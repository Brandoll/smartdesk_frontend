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
    <div class="auth-split-layout">
      <!-- Left Panel: Branding & Marketing -->
      <div class="auth-brand-panel">
        <div class="brand-content">
          <img src="assets/logo-light.png" alt="SmartDesk Logo" class="brand-logo" />
          <h1 class="brand-title">Estás a un paso de comenzar</h1>
          <p class="brand-subtitle">Verifica tu identidad y activa tu entorno de trabajo en SmartDesk.</p>
          
          <div class="brand-features">
            <div class="feature-item">
              <span class="material-symbols-outlined">security</span>
              <span>Autenticación Segura</span>
            </div>
            <div class="feature-item">
              <span class="material-symbols-outlined">rocket_launch</span>
              <span>Despliegue Inmediato</span>
            </div>
          </div>
        </div>
        <!-- Decorative Background Elements -->
        <div class="brand-decoration circle-1"></div>
        <div class="brand-decoration circle-2"></div>
      </div>

      <!-- Right Panel: Auth Form -->
      <div class="auth-form-panel">
        <div class="auth-form-container">
          <div class="auth-header">
            <h2 class="text-headline-lg">Activa tu Espacio</h2>
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
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; background: var(--surface-container-lowest); }

    .auth-split-layout {
      display: flex;
      height: 100vh;
      width: 100vw;
    }

    /* Left Panel: Branding */
    .auth-brand-panel {
      flex: 1;
      background: var(--primary-gradient);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      padding: 64px;
      color: white;
    }

    .brand-content {
      position: relative;
      z-index: 10;
      max-width: 520px;
    }

    .brand-logo {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: white;
      padding: 12px;
      margin-bottom: 40px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.1);
    }

    .brand-title {
      font-family: 'Geist', sans-serif;
      font-size: 48px;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 24px;
    }

    .brand-subtitle {
      font-family: 'Manrope', sans-serif;
      font-size: 18px;
      line-height: 1.6;
      opacity: 0.9;
      margin-bottom: 48px;
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Geist', sans-serif;
      font-size: 16px;
      font-weight: 500;
      background: rgba(255,255,255,0.1);
      padding: 12px 20px;
      border-radius: 9999px;
      backdrop-filter: blur(10px);
      width: fit-content;
    }

    .brand-decoration {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
      backdrop-filter: blur(40px);
    }

    .circle-1 { width: 600px; height: 600px; top: -200px; left: -200px; }
    .circle-2 { width: 400px; height: 400px; bottom: -100px; right: -100px; }

    /* Right Panel: Form */
    .auth-form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-container-lowest);
    }

    .auth-form-container {
      width: 100%;
      max-width: 440px;
      padding: 0 32px;
    }

    .auth-header { margin-bottom: 40px; }
    .auth-header h2 { font-family: 'Geist', sans-serif; font-weight: 700; color: var(--on-surface); }
    .auth-subtitle { color: var(--on-surface-variant); margin-top: 8px; }

    .auth-form { display: flex; flex-direction: column; gap: 24px; }

    .form-group { display: flex; flex-direction: column; }
    .form-label { color: var(--on-surface-variant); letter-spacing: 0.05em; margin-bottom: 8px; font-weight: 600; }
    .form-hint { font-size: 13px; color: var(--on-surface-variant); opacity: 0.7; margin-top: 8px; font-family: 'Manrope', sans-serif; }
    
    .input-wrapper { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 16px; color: var(--on-surface-variant); opacity: 0.5; font-size: 20px; }
    
    .form-input {
      width: 100%; padding: 16px 16px 16px 48px; background: var(--surface-container-lowest);
      border: 1px solid var(--outline-variant); border-radius: 12px;
      font-family: 'Manrope', sans-serif; font-size: 15px; color: var(--on-surface); outline: none; transition: all 0.2s;
    }
    
    .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-container); }
    
    .otp-input { text-align: center; letter-spacing: 0.3em; text-transform: uppercase; font-family: 'Geist', monospace; font-size: 18px; font-weight: 600; padding-left: 16px; }

    .submit-btn {
      margin-top: 16px; padding: 18px; background: var(--primary); color: var(--on-primary);
      border: none; border-radius: 12px; font-family: 'Geist', sans-serif; font-size: 16px; font-weight: 600;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .submit-btn:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(240, 80, 35, 0.25); transform: translateY(-2px); }
    .submit-btn:active:not(:disabled) { transform: scale(0.98); }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .spinner {
      width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .auth-footer { margin-top: 40px; text-align: center; color: var(--on-surface-variant); }
    .auth-link { color: var(--primary); font-family: 'Geist', sans-serif; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
    .auth-link:hover { opacity: 0.8; text-decoration: underline; }

    @media (max-width: 900px) {
      .auth-brand-panel { display: none; }
      .auth-form-panel { padding: 32px; }
    }
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
