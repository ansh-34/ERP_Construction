import crypto from 'crypto';
import bcrypt from 'bcrypt';

export const OTP_EXPIRY_MINUTES = 10;
export const MAX_OTP_ATTEMPTS = 5;

export async function generateOtp(): Promise<{ raw: string; hashed: string }> {
  const raw = crypto.randomInt(100_000, 999_999).toString();
  const hashed = await bcrypt.hash(raw, 10);
  return { raw, hashed };
}


export async function verifyOtp(
  raw: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(raw, hashed);
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export function buildOtpEmail(otp: string, recipientName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1117;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1117;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#1a1d27;border-radius:12px;border:1px solid #2a2d3a;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                Construction ERP
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:400;">
                Password Reset Request
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;color:#e2e8f0;font-size:15px;line-height:1.6;">
                Hi <strong style="color:#ffffff;">${recipientName}</strong>,
              </p>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.7;">
                We received a request to reset your password. Use the verification code below to proceed. This code is valid for <strong style="color:#e2e8f0;">${OTP_EXPIRY_MINUTES} minutes</strong>.
              </p>
              <!-- OTP Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="background-color:#0f1117;border:2px solid #6366f1;border-radius:10px;padding:20px 32px;display:inline-block;">
                      <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#ffffff;font-family:'Courier New',monospace;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:28px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #2a2d3a;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">
                &copy; ${new Date().getFullYear()} Construction ERP &mdash; Infoware
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
