/**
 * Email template: Domain Activation
 * Sent when a superAdmin seeds a new domain and the domain owner
 * needs to verify their email address.
 */

interface DomainActivationParams {
  domainName: string;
  verificationLink: string;
}

export function domainActivationEmail({
  domainName,
  verificationLink,
}: DomainActivationParams): string {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Domain</title>
</head>
<body style="margin:0;padding:0;background-color:#0c0e14;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0c0e14;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#151823;border-radius:16px;border:1px solid #1e2235;overflow:hidden;max-width:520px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%);padding:36px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;display:inline-block;line-height:52px;font-size:24px;">
                      &#x2713;
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:16px;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                      Activate Your Domain
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
                Hello,
              </p>
              <p style="margin:0 0 12px;color:#94a3b8;font-size:14px;line-height:1.7;">
                Your domain account <strong style="color:#e2e8f0;">${domainName}</strong> for Construction ERP has been created successfully.
              </p>
              <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.7;">
                Click the button below to verify your email and activate your domain. This link expires in <strong style="color:#e2e8f0;">24 hours</strong>.
              </p>
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verificationLink}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                      Verify &amp; Activate Domain
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin:24px 0 0;color:#475569;font-size:12px;line-height:1.6;word-break:break-all;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${verificationLink}" style="color:#10b981;text-decoration:none;">${verificationLink}</a>
              </p>
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
