/**
 * Email template: Forgot Password OTP
 * Sent when a domain owner or user requests a password reset.
 * Replaces the old buildOtpEmail function from otp.service.ts.
 */

interface ForgotPasswordParams {
  recipientName: string;
  otp: string;
  expiryMinutes: number;
}

export function forgotPasswordEmail({
  recipientName,
  otp,
  expiryMinutes,
}: ForgotPasswordParams): string {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#0c0e14;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0e14;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#151823;border-radius:16px;border:1px solid #1e2235;overflow:hidden;max-width:520px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:36px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-block;line-height:52px;font-size:24px;">
                      &#x1F512;
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:16px;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                      Password Reset
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
                      Construction ERP Platform
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;color:#e2e8f0;font-size:15px;line-height:1.6;">
                Hi <strong style="color:#ffffff;">${recipientName}</strong>,
              </p>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.7;">
                We received a request to reset your password. Use the verification code below to proceed. This code is valid for <strong style="color:#e2e8f0;">${expiryMinutes} minutes</strong>.
              </p>
              <!-- OTP Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="background-color:#0c0e14;border:2px solid #6366f1;border-radius:12px;padding:22px 36px;display:inline-block;">
                      <span style="font-size:38px;font-weight:700;letter-spacing:14px;color:#ffffff;font-family:'Courier New',monospace;">
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
          <!-- Security notice -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1525;border-radius:10px;border:1px solid #2d2640;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;color:#a78bfa;font-size:12px;line-height:1.5;">
                      &#x26A0; <strong>Security tip:</strong> Never share this code with anyone. Our team will never ask for your OTP.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #1e2235;text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">
                &copy; ${year} Construction ERP &mdash; Infoware
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
