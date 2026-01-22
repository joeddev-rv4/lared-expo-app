import { useState, useEffect, useCallback } from 'react';
import { sendVerificationCode, verifyCode } from '@/lib/verification-api';

const CODE_EXPIRY_SECONDS = 300; // 5 minutos

export function usePhoneVerification(phoneNumber: string) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(CODE_EXPIRY_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const sendCode = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setCanResend(false);
    setTimeRemaining(CODE_EXPIRY_SECONDS);

    try {
      const result = await sendVerificationCode(phoneNumber);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al enviar el código');
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber]);

  const verify = useCallback(async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return false;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyCode(phoneNumber, code);
      if (result.success) {
        setSuccess(true);
        return true;
      } else {
        setError(result.message);
        return false;
      }
    } catch (err) {
      setError('Error al verificar el código');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, code]);

  const resend = useCallback(async () => {
    setCode('');
    setError('');
    setSuccess(false);
    await sendCode();
  }, [sendCode]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    code,
    setCode,
    isLoading,
    error,
    success,
    timeRemaining,
    canResend,
    sendCode,
    verify,
    resend,
    formatTime: () => formatTime(timeRemaining),
  };
}
