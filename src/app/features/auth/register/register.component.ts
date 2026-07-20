import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-split-layout">
      <!-- Left Panel: Branding & Marketing -->
      <div class="auth-brand-panel">
        <div class="brand-content">
          <img src="assets/logo-light.png" alt="SmartDesk Logo" class="brand-logo" />
          <h1 class="brand-title">Transforma tu soporte interno</h1>
          <p class="brand-subtitle">Crea tu Workspace y empieza a resolver incidentes empresariales a la velocidad de la luz.</p>
          
          <div class="brand-features">
            <div class="feature-item">
              <span class="material-symbols-outlined">insights</span>
              <span>Dashboard de IA en tiempo real</span>
            </div>
            <div class="feature-item">
              <span class="material-symbols-outlined">alt_route</span>
              <span>Enrutamiento inteligente 24/7</span>
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
            <h2 class="text-headline-lg">Crea tu Workspace</h2>
            <p class="text-body-md auth-subtitle">Comienza a optimizar tu soporte hoy</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label text-label-sm">NOMBRE COMPLETO</label>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">person</span>
                  <input type="text" formControlName="name" placeholder="Ej. Alex Rivera" class="form-input" 
                         [class.invalid]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched" />
                </div>
              </div>
              <div class="form-group flex-1">
                <label class="form-label text-label-sm">EMPRESA</label>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">domain</span>
                  <input type="text" formControlName="companyName" placeholder="Ej. Acme Corp" class="form-input" 
                         [class.invalid]="registerForm.get('companyName')?.invalid && registerForm.get('companyName')?.touched" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label text-label-sm">CORREO ELECTRÓNICO CORPORATIVO</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">mail</span>
                <input type="email" formControlName="email" placeholder="tu@empresa.com" class="form-input" 
                       [class.invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label text-label-sm">CONTRASEÑA</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">lock</span>
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Mínimo 8 caracteres" class="form-input"
                       [class.invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" />
                <button type="button" class="toggle-pwd-btn" (click)="showPassword = !showPassword">
                  <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>
            
            <div class="pwd-requirements">
              <div class="pwd-req" [class.valid]="passwordLength() >= 8">
                <span class="material-symbols-outlined">check_circle</span> 8 caracteres
              </div>
              <div class="pwd-req" [class.valid]="hasUpperCase(passwordValue())">
                <span class="material-symbols-outlined">check_circle</span> Mayúscula
              </div>
              <div class="pwd-req" [class.valid]="hasNumber(passwordValue())">
                <span class="material-symbols-outlined">check_circle</span> Número
              </div>
              <div class="pwd-req" [class.valid]="hasSpecial(passwordValue())">
                <span class="material-symbols-outlined">check_circle</span> Símbolo
              </div>
            </div>

            <button type="submit" class="submit-btn" [disabled]="registerForm.invalid || loading()">
              @if (loading()) {
                <div class="spinner"></div>
                <span>Creando Workspace...</span>
              } @else {
                <span>Comenzar Ahora</span>
                <span class="material-symbols-outlined">arrow_forward</span>
              }
            </button>
          </form>
          
          <div class="auth-footer">
            <p class="text-body-md">¿Ya tienes cuenta? <a routerLink="/auth/login" class="auth-link">Inicia sesión</a></p>
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
      overflow-y: auto;
    }

    .auth-form-container {
      width: 100%;
      max-width: 460px;
      padding: 40px 32px;
    }

    .auth-header { margin-bottom: 40px; }
    .auth-header h2 { font-family: 'Geist', sans-serif; font-weight: 700; color: var(--on-surface); }
    .auth-subtitle { color: var(--on-surface-variant); margin-top: 8px; }

    .auth-form { display: flex; flex-direction: column; gap: 24px; }
    
    .form-row { display: flex; gap: 16px; width: 100%; }
    .flex-1 { flex: 1; }

    .form-group { display: flex; flex-direction: column; }
    .form-label { color: var(--on-surface-variant); letter-spacing: 0.05em; margin-bottom: 8px; font-weight: 600; }
    
    .input-wrapper { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 16px; color: var(--on-surface-variant); opacity: 0.5; font-size: 20px; }
    
    .form-input {
      width: 100%; padding: 16px 16px 16px 48px; background: var(--surface-container-lowest);
      border: 1px solid var(--outline-variant); border-radius: 12px;
      font-family: 'Manrope', sans-serif; font-size: 15px; color: var(--on-surface); outline: none; transition: all 0.2s;
    }
    
    .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-container); }
    .form-input.invalid { border-color: var(--error); }
    
    .toggle-pwd-btn {
      position: absolute; right: 12px; background: transparent; border: none; cursor: pointer;
      color: var(--on-surface-variant); opacity: 0.5; display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s;
    }
    .toggle-pwd-btn:hover { opacity: 0.8; }
    
    .pwd-requirements { display: flex; flex-wrap: wrap; gap: 12px; margin-top: -12px; padding: 0 4px; }
    .pwd-req {
      display: flex; align-items: center; gap: 4px; font-family: 'Geist', sans-serif; font-size: 11px;
      color: var(--on-surface-variant); opacity: 0.5; transition: all 0.2s; font-weight: 600;
    }
    .pwd-req .material-symbols-outlined { font-size: 14px; }
    .pwd-req.valid { opacity: 1; color: var(--primary); }

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
      .form-row { flex-direction: column; }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  showPassword = false;
  loading = signal(false);

  registerForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    companyName: ['', Validators.required],
    password: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]]
  });

  passwordValue(): string { return this.registerForm.controls.password.value || ''; }
  passwordLength(): number { return this.passwordValue().length; }

  hasUpperCase(str: string | undefined): boolean { return /[A-Z]/.test(str || ''); }
  hasNumber(str: string | undefined): boolean { return /\d/.test(str || ''); }
  hasSpecial(str: string | undefined): boolean { return /[@$!%*?&]/.test(str || ''); }

  onSubmit() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    
    const formData = this.registerForm.getRawValue();

    // Save companyName for activation step
    localStorage.setItem('pendingCompanyName', formData.companyName);

    // Backend expects flat: { name, email, password }
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };

    this.authService.register(dataToSend).subscribe({
      next: () => {
        this.loading.set(false);
        this.notification.success('Registro exitoso. Revisa tu correo para verificar tu cuenta.');
        this.router.navigate(['/auth/verify']);
      },
      error: (err) => {
        this.loading.set(false);
        this.notification.error(err.error?.message || 'Error en el registro');
      }
    });
  }
}
