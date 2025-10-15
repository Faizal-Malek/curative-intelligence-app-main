import { useState } from 'react';

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  expired?: boolean;
}

export const useEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOTP = async (email: string, firstName?: string): Promise<EmailResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, firstName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        return { success: false, error: data.error };
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<EmailResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to verify OTP');
        return { 
          success: false, 
          error: data.error, 
          expired: data.expired 
        };
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeEmail = async (
    email: string, 
    firstName: string, 
    userType: 'brand' | 'influencer'
  ): Promise<EmailResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/emails/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, firstName, userType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send welcome email');
        return { success: false, error: data.error };
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send welcome email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (
    email: string, 
    resetToken: string, 
    firstName?: string
  ): Promise<EmailResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/emails/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, resetToken, firstName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send password reset email');
        return { success: false, error: data.error };
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const sendCustomEmail = async (
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<EmailResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, html, text }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send email');
        return { success: false, error: data.error };
      }

      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendOTP,
    verifyOTP,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendCustomEmail,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};