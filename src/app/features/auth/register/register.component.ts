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
    <div class="auth-container">
      <div class="auth-card premium-card">
        
        <div class="auth-header">
          <img [src]="'assets/logo-light.png'" alt="SmartDesk Logo" class="auth-logo" />
          <h1 class="text-headline-md">Crea tu Workspace</h1>
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
      
      <!-- Design Background Elements -->
      <div class="bg-blur-blob top-left"></div>
      <div class="bg-blur-blob bottom-right"></div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--surface); overflow-y: auto; }

    .auth-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; padding: 40px 20px;
    }

    .bg-blur-blob {
      position: absolute; width: 600px; height: 600px; border-radius: 50%;
      filter: blur(80px); opacity: 0.4; z-index: 0; pointer-events: none; position: fixed;
    }
    .bg-blur-blob.top-left {
      background: radial-gradient(circle, #e2e2e2 0%, transparent 70%); top: -100px; left: -100px;
    }
    .bg-blur-blob.bottom-right {
      background: radial-gradient(circle, #dad9e3 0%, transparent 70%); bottom: -100px; right: -100px;
    }

    .auth-card {
      width: 100%; max-width: 520px; padding: 48px 40px; position: relative; z-index: 10;
      background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    }

    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { width: 48px; height: 48px; border-radius: 12px; margin: 0 auto 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .auth-subtitle { color: var(--on-surface-variant); opacity: 0.7; margin-top: 8px; }

    .auth-form { display: flex; flex-direction: column; gap: 20px; }
    
    .form-row { display: flex; gap: 16px; }

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
    
    .subdomain-input { padding-right: 140px; }
    .subdomain-suffix {
      position: absolute; right: 16px; font-family: 'Geist', sans-serif; font-size: 14px;
      color: var(--on-surface-variant); opacity: 0.6; pointer-events: none;
    }
    
    .toggle-pwd-btn {
      position: absolute; right: 12px; background: transparent; border: none; cursor: pointer;
      color: var(--on-surface-variant); opacity: 0.5; display: flex; align-items: center; justify-content: center;
      transition: opacity 0.2s;
    }
    .toggle-pwd-btn:hover { opacity: 0.8; }
    
    .pwd-requirements { display: flex; flex-wrap: wrap; gap: 12px; margin-top: -12px; padding: 0 4px; }
    .pwd-req {
      display: flex; align-items: center; gap: 4px; font-family: 'Geist', sans-serif; font-size: 11px;
      color: var(--on-surface-variant); opacity: 0.5; transition: all 0.2s;
    }
    .pwd-req .material-symbols-outlined { font-size: 14px; }
    .pwd-req.valid { opacity: 1; color: #22c55e; }

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

    @media (max-width: 600px) {
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
