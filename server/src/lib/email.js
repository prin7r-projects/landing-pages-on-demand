// Email helper for DropHouse status notifications
// Primary rail: Postmark. Falls back to structured stdout logging.

const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@drophouse.com';
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://drophouse.com/dashboard';

/**
 * Send a status update email to a customer.
 * @param {Object} options
 * @param {string} options.to           Recipient email address
 * @param {string} options.briefId      Brief ID
 * @param {string} options.status       Brief status (e.g. 'live')
 * @param {string} [options.liveUrl]    Live site URL (required when status === 'live')
 */
export async function sendStatusEmail({ to, briefId, status, liveUrl }) {
  if (!to) {
    console.warn('[email] No recipient provided; skipping send');
    return;
  }

  const subject = status === 'live'
    ? `Your DropHouse site is live: ${liveUrl || ''}`
    : `DropHouse brief update: ${status}`;

  const dashboardLink = `${DASHBOARD_URL}/briefs/${briefId}`;

  const textBody = status === 'live'
    ? `Your DropHouse site is now live.\n\nLive URL: ${liveUrl}\nDashboard: ${dashboardLink}\n\nBrief ID: ${briefId}`
    : `Your DropHouse brief status has been updated to: ${status}\n\nDashboard: ${dashboardLink}\n\nBrief ID: ${briefId}`;

  const htmlBody = status === 'live'
    ? `<p>Your DropHouse site is now live.</p>
<p><a href="${liveUrl}">View Live Site</a></p>
<p><a href="${dashboardLink}">Open Dashboard</a></p>
<p style="color:#666;font-size:12px;">Brief ID: ${briefId}</p>`
    : `<p>Your DropHouse brief status has been updated to: <strong>${status}</strong>.</p>
<p><a href="${dashboardLink}">Open Dashboard</a></p>
<p style="color:#666;font-size:12px;">Brief ID: ${briefId}</p>`;

  if (!POSTMARK_SERVER_TOKEN) {
    // Structured stdout fallback
    console.log(JSON.stringify({
      event: 'email_fallback',
      to,
      subject,
      textBody,
      htmlBody,
      briefId,
      status,
      liveUrl,
    }));
    return;
  }

  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN,
      },
      body: JSON.stringify({
        From: FROM_EMAIL,
        To: to,
        Subject: subject,
        TextBody: textBody,
        HtmlBody: htmlBody,
        MessageStream: 'outbound',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Postmark ${response.status}: ${errText}`);
    }

    console.log(`[email] Sent ${status} email to ${to} for brief ${briefId}`);
  } catch (error) {
    console.error(`[email] Failed to send ${status} email to ${to}:`, error.message);
    // Do not throw — we don't want email failures to break the pipeline
  }
}
