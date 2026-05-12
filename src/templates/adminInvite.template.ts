/**
 * Email template: Admin Invite
 * Sent when a new admin account is created and invited to onboard.
 */

interface AdminInviteParams {
  recipientName: string;
  loginUrl: string;
}

export function adminInviteEmail({
  recipientName,
  loginUrl,
}: AdminInviteParams): string {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Construction ERP</title>
</head>
<body style="margin:0;padding:0;background-color:#0c0e14;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0e14;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#151823;border-radius:16px;border:1px solid #1e2235;overflow:hidden;max-width:520px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#3b82f6 50%,#60a5fa 100%);padding:40px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:58px;height:58px;background:rgba(255,255,255,0.18);border-radius:16px;display:inline-block;line-height:58px;font-size:28px;">
                      🚀
                    </div>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding-top:18px;">
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                      Welcome Aboard!
                    </h1>

                    <p style="margin:10px 0 0;color:rgba(255,255,255,0.82);font-size:14px;line-height:1.6;">
                      Your Construction ERP workspace is ready to power smarter operations.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 34px;">

              <p style="margin:0 0 18px;color:#e2e8f0;font-size:15px;line-height:1.7;">
                Hi <strong style="color:#ffffff;">${recipientName}</strong>,
              </p>

              <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.8;">
                Thank you for choosing <strong style="color:#e2e8f0;">Construction ERP</strong> to manage your business operations.
              </p>

              <p style="margin:0 0 16px;color:#94a3b8;font-size:14px;line-height:1.8;">
                We’re excited to be part of your journey and help streamline your operations, improve collaboration, and support your business growth with powerful digital workflows.
              </p>

              <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.8;">
                Your admin account has been successfully created. Click below to login and complete your onboarding process to get started.
              </p>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a 
                      href="${loginUrl}"
                      style="display:inline-block;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:15px 38px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 8px 24px rgba(37,99,235,0.28);"
                    >
                      Login & Complete Onboarding
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Feature Highlights -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:34px;">
                <tr>
                  <td style="padding:18px;background-color:#111827;border:1px solid #1f2937;border-radius:14px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                      <tr>
                        <td style="padding-bottom:12px;color:#ffffff;font-size:14px;font-weight:600;">
                          What’s waiting for you:
                        </td>
                      </tr>

                      <tr>
                        <td style="color:#94a3b8;font-size:13px;line-height:2;">
                          ✅ Team & role management<br/>
                          ✅ Project and workflow tracking<br/>
                          ✅ Smart reporting and insights<br/>
                          ✅ Centralized operational management
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>

              <!-- Fallback -->
              <p style="margin:26px 0 0;color:#475569;font-size:12px;line-height:1.7;word-break:break-all;">
                If the button above doesn’t work, copy and paste this link into your browser:<br/>
                <a href="${loginUrl}" style="color:#3b82f6;text-decoration:none;">
                  ${loginUrl}
                </a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 40px 30px;border-top:1px solid #1e2235;text-align:center;">
              
              <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;line-height:1.7;">
                We look forward to helping you achieve your business goals and build more efficiently with confidence.
              </p>

              <p style="margin:0;color:#475569;font-size:12px;">
                &copy; ${year} Construction ERP — Infoware
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
