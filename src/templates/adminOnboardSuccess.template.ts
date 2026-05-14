/**
 * Email template: Onboarding Completion
 * Sent after a user/domain successfully completes onboarding.
 */

interface OnboardingCompletionParams {
  recipientName?: string;
  companyName?: string;
  platformName?: string;
  dashboardLink?: string;
}

export function onboardingCompletionEmail({
  recipientName,
  platformName = 'Construction ERP',
  dashboardLink,
}: OnboardingCompletionParams): string {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome Aboard</title>
</head>

<body style="margin:0;padding:0;background-color:#0b1120;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1120;padding:40px 16px;">
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="560"
          cellpadding="0"
          cellspacing="0"
          style="
            width:100%;
            max-width:560px;
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
                background:linear-gradient(135deg,#7c3aed 0%,#2563eb 100%);
                padding:48px 40px;
              "
            >

              <div
                style="
                  width:72px;
                  height:72px;
                  background:rgba(255,255,255,0.15);
                  border-radius:20px;
                  line-height:72px;
                  text-align:center;
                  font-size:34px;
                  color:#ffffff;
                  margin:0 auto;
                "
              >
                🎉
              </div>

              <h1
                style="
                  margin:24px 0 10px;
                  font-size:30px;
                  line-height:1.2;
                  color:#ffffff;
                  font-weight:700;
                  letter-spacing:-0.5px;
                "
              >
                Welcome Aboard!
              </h1>

              <p
                style="
                  margin:0;
                  color:rgba(255,255,255,0.82);
                  font-size:15px;
                  line-height:1.7;
                "
              >
                Your onboarding is now successfully completed
              </p>

            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:42px 40px;">

              <p
                style="
                  margin:0 0 18px;
                  color:#f3f4f6;
                  font-size:15px;
                  line-height:1.8;
                "
              >
                Hello${recipientName ? ` ${recipientName}` : ''},
              </p>

              <p
                style="
                  margin:0 0 18px;
                  color:#9ca3af;
                  font-size:14px;
                  line-height:1.9;
                "
              >
                Congratulations! Your account has been successfully configured and is now ready to use.
              </p>

              <p
                style="
                  margin:0 0 18px;
                  color:#9ca3af;
                  font-size:14px;
                  line-height:1.9;
                "
              >
                We’re excited to be a part of your business journey and are committed to helping you streamline, simplify, and optimize your day-to-day operations through a smarter and more connected workflow experience.
              </p>

              <p
                style="
                  margin:0 0 28px;
                  color:#9ca3af;
                  font-size:14px;
                  line-height:1.9;
                "
              >
                Our goal is not just to provide software — but to build a long-term partnership that empowers your team with smoother processes, better visibility, improved efficiency, and reliable operational support every step of the way.
              </p>

              <!-- Feature Highlight Box -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  margin:0 0 30px;
                  background-color:#0f172a;
                  border:1px solid #1e293b;
                  border-radius:16px;
                "
              >
                <tr>
                  <td style="padding:22px 24px;">

                    <p
                      style="
                        margin:0 0 14px;
                        color:#ffffff;
                        font-size:15px;
                        font-weight:600;
                      "
                    >
                      What You Can Expect From Us
                    </p>

                    <p
                      style="
                        margin:0;
                        color:#94a3b8;
                        font-size:14px;
                        line-height:2;
                      "
                    >
                      ✔ Streamlined business operations<br/>
                      ✔ Faster and more organized workflows<br/>
                      ✔ Better team coordination and visibility<br/>
                      ✔ Reliable support and continuous improvements<br/>
                      ✔ Scalable solutions for your growing business
                    </p>

                  </td>
                </tr>
              </table>

              ${
                dashboardLink
                  ? `
              <!-- CTA -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="margin:0 0 24px;"
              >
                <tr>
                  <td align="center">

                    <a
                      href="${dashboardLink}"
                      style="
                        display:inline-block;
                        background:linear-gradient(135deg,#7c3aed,#2563eb);
                        color:#ffffff;
                        text-decoration:none;
                        padding:15px 34px;
                        border-radius:12px;
                        font-size:15px;
                        font-weight:600;
                        letter-spacing:0.2px;
                      "
                    >
                      Go To Dashboard
                    </a>

                  </td>
                </tr>
              </table>
              `
                  : ''
              }

              <!-- Closing -->
              <p
                style="
                  margin:0;
                  color:#6b7280;
                  font-size:13px;
                  line-height:1.9;
                "
              >
                Thank you for choosing
                <strong style="color:#d1d5db;">
                  ${platformName}
                </strong>.
                We truly appreciate your trust and look forward to supporting your success.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding:24px 40px 32px;
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
                Need help getting started? Our team is always here to assist you.
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
