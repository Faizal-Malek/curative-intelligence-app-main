'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEmail } from '@/hooks/useEmail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Alert component removed; using inline markup for error messages
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  firstName?: string;
  onVerified: () => void;
  onCancel?: () => void;
}

export const OTPVerification = ({ 
  email, 
  firstName, 
  onVerified, 
  onCancel 
}: OTPVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const { sendOTP, verifyOTP, isLoading, error, clearError } = useEmail();

  // Countdown timer for resend functionality
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = useCallback(async () => {
    clearError();
    setIsLocked(false);
    setAttemptsRemaining(null);
    const result = await sendOTP(email, firstName);
    if (result.success) {
      setCountdown(result.retryAfterSeconds ?? 60);
      setOtp('');
      setShowSuccess(false);
    } else if (typeof result.retryAfterSeconds === 'number') {
      setCountdown(result.retryAfterSeconds);
    }
  }, [clearError, email, firstName, sendOTP]);

  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== 6) {
      return;
    }

    clearError();
    const result = await verifyOTP(email, otp);
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 1500);
      return;
    }

    if (result.locked) {
      setIsLocked(true);
      setAttemptsRemaining(0);
      return;
    }

    if (typeof result.attemptsRemaining === 'number') {
      setAttemptsRemaining(result.attemptsRemaining);
    }
  }, [clearError, email, onVerified, otp, verifyOTP]);

  const handleOTPChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    if (error) {
      clearError();
    }
    setOtp(numericValue);
  };

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && !isLocked && !isLoading) {
      handleVerifyOTP();
    }
  }, [handleVerifyOTP, isLocked, isLoading, otp]);

  // Send initial OTP on component mount
  useEffect(() => {
    handleSendOTP();
  }, [handleSendOTP]);

  if (showSuccess) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h3 className="text-lg font-semibold text-[#2F2626]">Verified Successfully!</h3>
        <p className="text-[#2F2626]/70">Your email has been verified.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <Mail className="w-12 h-12 text-[#D2B193] mx-auto" />
        <h2 className="text-xl font-semibold text-[#2F2626]">Verify Your Email</h2>
        <p className="text-[#2F2626]/70">
          We've sent a 6-digit code to{' '}
          <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-[#2F2626] mb-2">
            Enter verification code
          </label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => handleOTPChange(e.target.value)}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            maxLength={6}
            disabled={isLoading || isLocked}
          />
          <p className="text-xs text-[#2F2626]/50 mt-1">
            Code expires in 10 minutes
          </p>
          {attemptsRemaining !== null && !isLocked && (
            <p className="text-xs text-[#2F2626]/60 mt-1">
              {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining before lockout.
            </p>
          )}
          {isLocked && (
            <div className="flex items-start gap-2 border border-amber-200 bg-amber-50 rounded-md p-2 mt-2">
              <XCircle className="h-4 w-4 text-amber-600 mt-1" />
              <p className="text-amber-700 text-sm">
                Too many incorrect attempts. Request a new code to try again.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 border border-red-200 bg-red-50 rounded-md p-2">
            <XCircle className="h-4 w-4 text-red-600 mt-1" />
            <p className="text-red-700 text-sm">
              {error}
            </p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading || isLocked}
            className="w-full bg-[#2F2626] hover:bg-[#2F2626]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-[#2F2626]/70">
              Didn't receive the code?{' '}
              {countdown > 0 ? (
                <span className="text-[#D2B193]">
                  Resend in {countdown}s
                </span>
              ) : (
                <button
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="text-[#D2B193] hover:text-[#D2B193]/80 font-medium underline"
                >
                  Resend Code
                </button>
              )}
            </p>
          </div>

          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full text-[#2F2626]/70 hover:text-[#2F2626]"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};