const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse {
  success: boolean;
  message: string;
}

export async function sendVerificationCode(phoneNumber: string): Promise<ApiResponse> {
  try {
    console.log('📱 [CLIENT] Enviando código de verificación...');
    console.log('   Número:', phoneNumber);
    console.log('   API URL:', API_URL);

    const response = await fetch(`${API_URL}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    console.log('   Respuesta:', response.status, response.statusText);
    const data = await response.json();
    console.log('   Data:', data);
    return data;
  } catch (error) {
    console.error('❌ [CLIENT] Error sending verification code:', error);
    return {
      success: false,
      message: 'Error de conexión. Verifica tu internet.',
    };
  }
}

export async function verifyCode(phoneNumber: string, code: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, code }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying code:', error);
    return {
      success: false,
      message: 'Error de conexión. Verifica tu internet.',
    };
  }
}
