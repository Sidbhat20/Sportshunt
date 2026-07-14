export const EMAIL_OTP_COOLDOWN_MS = 0;

export function getEmailOtpCooldown(_email: string) {
  return 0;
}

export function startEmailOtpCooldown(_email: string, _durationMs = EMAIL_OTP_COOLDOWN_MS) {}

export type EmailOtpRequestResult = {
  ok: boolean;
  message: string;
  remainingMs?: number;
};

export async function requestEmailOtp(_email: string): Promise<EmailOtpRequestResult> {
  return {
    ok: false,
    message: 'Email OTP is disabled while shared testing login mode is enabled.',
    remainingMs: 0,
  };
}
