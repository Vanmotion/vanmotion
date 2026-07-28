export type CustomerEmailLanguage =
  | "es"
  | "en";

type CustomerEmailTemplateInput = {
  language: CustomerEmailLanguage;
  preheader: string;
  eyebrow: string;
  title: string;
  introductionHtml: string;
  contentHtml: string;
  footerText: string;
  action?: {
    label: string;
    href: string;
  };
};

function escapeHtml(value: string): string {
  const characters: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return value.replace(
    /[&<>"']/g,
    (character) =>
      characters[character] ?? character,
  );
}

export function normalizeCustomerEmailLanguage(
  value: unknown,
): CustomerEmailLanguage {
  return value === "en"
    ? "en"
    : "es";
}

export function renderCustomerEmail(
  input: CustomerEmailTemplateInput,
): string {
  const isSpanish =
    input.language === "es";

  const location = isSpanish
    ? "MADRID · ESPAÑA"
    : "MADRID · SPAIN";

  const motto = isSpanish
    ? "TRABAJO REAL · MOVIMIENTO PROPIO"
    : "REAL WORK · OUR OWN MOVEMENT";

  const websiteLabel = isSpanish
    ? "VISITAR VANMOTION"
    : "VISIT VANMOTION";

  const safePreheader =
    escapeHtml(input.preheader);

  const safeEyebrow =
    escapeHtml(input.eyebrow);

  const safeTitle =
    escapeHtml(input.title);

  const safeFooterText =
    escapeHtml(input.footerText);

  const actionHtml = input.action
    ? `
      <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="margin-top:28px;"
      >
        <tr>
          <td align="left">
            <a
              href="${escapeHtml(input.action.href)}"
              style="
                display:inline-block;
                background:#d97827;
                color:#080808;
                padding:15px 20px;
                font-family:Arial,Helvetica,sans-serif;
                font-size:11px;
                font-weight:800;
                letter-spacing:1.8px;
                line-height:16px;
                text-decoration:none;
                text-transform:uppercase;
              "
            >
              ${escapeHtml(input.action.label)} →
            </a>
          </td>
        </tr>
      </table>
    `
    : "";

  return `<!doctype html>
<html lang="${input.language}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#080808;">
    <div
      style="
        display:none;
        max-height:0;
        overflow:hidden;
        opacity:0;
        color:transparent;
        line-height:1px;
        font-size:1px;
      "
    >
      ${safePreheader}
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="width:100%;background:#080808;"
    >
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width:100%;
              max-width:640px;
              border-collapse:collapse;
            "
          >
            <tr>
              <td
                style="
                  padding:0 0 18px;
                  font-family:Arial,Helvetica,sans-serif;
                "
              >
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td
                      style="
                        color:#f2efe8;
                        font-size:18px;
                        font-weight:800;
                        letter-spacing:5px;
                        line-height:24px;
                      "
                    >
                      VANMOTION
                    </td>
                    <td
                      align="right"
                      style="
                        color:#77736d;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:9px;
                        font-weight:700;
                        letter-spacing:1.6px;
                        line-height:16px;
                      "
                    >
                      ${location}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="height:4px;background:#d97827;font-size:0;line-height:0;">
                &nbsp;
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:34px 28px;
                  border:1px solid #292724;
                  border-top:0;
                  background:#0d0d0d;
                  font-family:Arial,Helvetica,sans-serif;
                "
              >
                <p
                  style="
                    margin:0 0 18px;
                    color:#d97827;
                    font-size:10px;
                    font-weight:800;
                    letter-spacing:2.5px;
                    line-height:16px;
                    text-transform:uppercase;
                  "
                >
                  ${safeEyebrow}
                </p>

                <h1
                  style="
                    margin:0;
                    color:#f2efe8;
                    font-size:38px;
                    font-weight:800;
                    letter-spacing:-1.8px;
                    line-height:40px;
                    text-transform:uppercase;
                  "
                >
                  ${safeTitle}
                </h1>

                <div
                  style="
                    margin-top:24px;
                    color:#c5c0b8;
                    font-size:15px;
                    line-height:25px;
                  "
                >
                  ${input.introductionHtml}
                </div>

                <div style="margin-top:28px;">
                  ${input.contentHtml}
                </div>

                ${actionHtml}

                <div
                  style="
                    margin-top:30px;
                    padding-top:22px;
                    border-top:1px solid #292724;
                  "
                >
                  <p
                    style="
                      margin:0;
                      color:#77736d;
                      font-size:11px;
                      line-height:18px;
                    "
                  >
                    ${safeFooterText}
                  </p>

                  <p
                    style="
                      margin:20px 0 0;
                      color:#f2efe8;
                      font-size:10px;
                      font-weight:800;
                      letter-spacing:2px;
                      line-height:16px;
                    "
                  >
                    ${motto}
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td
                align="center"
                style="
                  padding:20px 12px 0;
                  color:#66625d;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:10px;
                  line-height:18px;
                "
              >
                <a
                  href="https://www.vanmotion.es"
                  style="color:#d97827;text-decoration:none;font-weight:800;letter-spacing:1.4px;"
                >
                  ${websiteLabel}
                </a>
                <br>
                © 2026 VANMOTION
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderEmailDetails(
  rows: ReadonlyArray<{
    label: string;
    valueHtml: string;
  }>,
): string {
  return `
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width:100%;
        border:1px solid #292724;
        border-collapse:collapse;
        background:#131313;
      "
    >
      ${rows
        .map(
          (row, index) => `
            <tr>
              <td
                style="
                  padding:15px 16px;
                  ${index > 0 ? "border-top:1px solid #292724;" : ""}
                  font-family:Arial,Helvetica,sans-serif;
                "
              >
                <p
                  style="
                    margin:0 0 5px;
                    color:#77736d;
                    font-size:9px;
                    font-weight:800;
                    letter-spacing:1.6px;
                    line-height:14px;
                    text-transform:uppercase;
                  "
                >
                  ${escapeHtml(row.label)}
                </p>
                <div
                  style="
                    color:#f2efe8;
                    font-size:14px;
                    line-height:22px;
                  "
                >
                  ${row.valueHtml}
                </div>
              </td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

export function renderEmailNotice(
  label: string,
  contentHtml: string,
): string {
  return `
    <div
      style="
        margin-top:20px;
        padding:18px;
        border-left:4px solid #d97827;
        background:#f2efe8;
        color:#151515;
        font-family:Arial,Helvetica,sans-serif;
      "
    >
      <p
        style="
          margin:0 0 8px;
          font-size:9px;
          font-weight:800;
          letter-spacing:1.7px;
          line-height:14px;
          text-transform:uppercase;
        "
      >
        ${escapeHtml(label)}
      </p>
      <div style="font-size:14px;line-height:22px;">
        ${contentHtml}
      </div>
    </div>
  `;
}
