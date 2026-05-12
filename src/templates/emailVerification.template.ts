/**
 * Email template: OTP Verification
 * Sent when a user requests an OTP for login,
 * signup, password reset, or email verification.
 */

interface OtpVerificationParams {
  recipientName?: string;
  otp: string | number;
  platformName?: string;
  expiryMinutes?: number;
}

export function otpVerificationEmail({
  recipientName,
  otp,
  platformName = 'Construction ERP',
  expiryMinutes = 10,
}: OtpVerificationParams): string {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code</title>
</head>

<body style="margin:0;padding:0;background-color:#0b1120;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1120;padding:40px 16px;">
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="520"
          cellpadding="0"
          cellspacing="0"
          style="
            width:100%;
            max-width:520px;
            background-color:#111827;
            border:1px solid #1f2937;
            border-radius:20px;
            overflow:hidden;
          "
        >

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                background:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);
                padding:42px 32px;
              "
            >

              <div
                style="
                  width:64px;
                  height:64px;
                  background:rgba(255,255,255,0.15);
                  border-radius:18px;
                  line-height:64px;
                  text-align:center;
                  font-size:28px;
                  color:#ffffff;
                  margin:0 auto;
                "
              >
                🔐
              </div>

              <h1
                style="
                  margin:22px 0 10px;
                  font-size:26px;
                  line-height:1.2;
                  color:#ffffff;
                  font-weight:700;
                "
              >
                Verification Code
              </h1>

              <p
                style="
                  margin:0;
                  color:rgba(255,255,255,0.8);
                  font-size:14px;
                  line-height:1.6;
                "
              >
                Secure verification for your ${platformName} account
              </p>

            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">

              <p
                style="
                  margin:0 0 18px;
                  color:#f3f4f6;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                Hello${recipientName ? ` ${recipientName}` : ''},
              </p>

              <p
                style="
                  margin:0 0 26px;
                  color:#9ca3af;
                  font-size:14px;
                  line-height:1.8;
                "
              >
                Use the verification code below to continue securely.
              </p>

              <!-- OTP Box -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  margin:0 0 28px;
                  background-color:#0f172a;
                  border:1px dashed #334155;
                  border-radius:16px;
                "
              >
                <tr>
                  <td
                    align="center"
                    style="padding:28px 16px;"
                  >

                    <p
                      style="
                        margin:0 0 10px;
                        color:#94a3b8;
                        font-size:13px;
                        letter-spacing:1px;
                        text-transform:uppercase;
                      "
                    >
                      Your OTP Code
                    </p>

                    <div
                      style="
                        color:#ffffff;
                        font-size:38px;
                        font-weight:700;
                        letter-spacing:10px;
                        font-family:'Courier New',monospace;
                      "
                    >
                      ${otp}
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Expiry -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  background-color:#172554;
                  border:1px solid #1d4ed8;
                  border-radius:12px;
                "
              >
                <tr>
                  <td style="padding:14px 18px;">

                    <p
                      style="
                        margin:0;
                        color:#dbeafe;
                        font-size:13px;
                        line-height:1.7;
                      "
                    >
                      ⏳ This OTP will expire in
                      <strong>${expiryMinutes} minutes</strong>.
                    </p>

                  </td>
                </tr>
              </table>

              <!-- Security Note -->
              <p
                style="
                  margin:26px 0 0;
                  color:#6b7280;
                  font-size:12px;
                  line-height:1.8;
                "
              >
                For security reasons, never share this code with anyone.
                If you did not request this verification, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding:22px 32px 30px;
                border-top:1px solid #1f2937;
              "
            >

              <p
                style="
                  margin:0 0 8px;
                  color:#9ca3af;
                  font-size:12px;
                "
              >
                This is an automated message. Please do not reply.
              </p>

              <p
                style="
                  margin:0;
                  color:#6b7280;
                  font-size:12px;
                "
              >
                © ${year} ${platformName} — All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}
