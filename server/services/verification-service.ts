import { whatsappService } from './whatsapp-service';

interface VerificationCode {
  code: string;
  phoneNumber: string;
  attempts: number;
  createdAt: number;
  expiresAt: number;
}

interface RateLimit {
  count: number;
  resetAt: number;
}

class VerificationService {
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private rateLimits: Map<string, RateLimit> = new Map();

  private readonly CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_ATTEMPTS = 3;
  private readonly RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
  private readonly MAX_CODES_PER_WINDOW = 3;

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private checkRateLimit(phoneNumber: string): boolean {
    const now = Date.now();
    const rateLimit = this.rateLimits.get(phoneNumber);

    if (!rateLimit || now >= rateLimit.resetAt) {
      this.rateLimits.set(phoneNumber, {
        count: 1,
        resetAt: now + this.RATE_LIMIT_WINDOW_MS,
      });
      return true;
    }

    if (rateLimit.count >= this.MAX_CODES_PER_WINDOW) {
      return false;
    }

    rateLimit.count++;
    return true;
  }

  private cleanupExpiredCodes(): void {
    const now = Date.now();
    this.verificationCodes.forEach((data, phone) => {
      if (now >= data.expiresAt) {
        this.verificationCodes.delete(phone);
      }
    });
  }

  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    // Limpiar códigos expirados
    this.cleanupExpiredCodes();

    // Verificar rate limit
    if (!this.checkRateLimit(phoneNumber)) {
      return {
        success: false,
        message: 'Has alcanzado el límite de códigos. Intenta nuevamente en 10 minutos.',
      };
    }

    // Generar código
    const code = this.generateCode();
    const now = Date.now();

    // Guardar código
    this.verificationCodes.set(phoneNumber, {
      code,
      phoneNumber,
      attempts: 0,
      createdAt: now,
      expiresAt: now + this.CODE_EXPIRY_MS,
    });

    // Enviar por WhatsApp
    const sent = await whatsappService.sendVerificationCode(phoneNumber, code);

    if (!sent) {
      this.verificationCodes.delete(phoneNumber);
      return {
        success: false,
        message: 'Error al enviar el código. Verifica el número de teléfono.',
      };
    }

    return {
      success: true,
      message: 'Código enviado exitosamente',
    };
  }

  verifyCode(phoneNumber: string, code: string): { success: boolean; message: string } {
    const verification = this.verificationCodes.get(phoneNumber);

    if (!verification) {
      return {
        success: false,
        message: 'No se encontró un código de verificación para este número.',
      };
    }

    const now = Date.now();

    // Verificar expiración
    if (now >= verification.expiresAt) {
      this.verificationCodes.delete(phoneNumber);
      return {
        success: false,
        message: 'El código ha expirado. Solicita uno nuevo.',
      };
    }

    // Verificar intentos
    if (verification.attempts >= this.MAX_ATTEMPTS) {
      this.verificationCodes.delete(phoneNumber);
      return {
        success: false,
        message: 'Has excedido el número máximo de intentos. Solicita un nuevo código.',
      };
    }

    // Incrementar intentos
    verification.attempts++;

    // Verificar código
    if (verification.code !== code) {
      return {
        success: false,
        message: `Código incorrecto. Te quedan ${this.MAX_ATTEMPTS - verification.attempts} intentos.`,
      };
    }

    // Código correcto - eliminar
    this.verificationCodes.delete(phoneNumber);

    return {
      success: true,
      message: 'Número verificado exitosamente',
    };
  }

  // Para pruebas/debugging (opcional)
  getCodeForTesting(phoneNumber: string): string | null {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
    const verification = this.verificationCodes.get(phoneNumber);
    return verification ? verification.code : null;
  }
}

export const verificationService = new VerificationService();
