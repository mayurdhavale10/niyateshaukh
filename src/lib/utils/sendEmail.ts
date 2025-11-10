// src/lib/utils/sendEmail.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export type TicketEmailPayload = {
  to: string;
  name: string;
  userId: string;
  qrCode: string; // data:image/png;base64,...
  eventName: string;
  eventDate: string; // already formatted
  eventTime: string;
  venueName?: string;
  venueAddress?: string;
};

export async function sendTicketEmail(p: TicketEmailPayload): Promise<boolean> {
  const html = `
    <div style="font-family: Inter, system-ui, Arial, sans-serif">
      <h2>🎟️ Your Ticket for ${p.eventName}</h2>
      <p>Hi ${p.name},</p>
      <p>Show this QR at the entry gate (screenshot works too).</p>
      <div style="margin:16px 0">
        <img src="${p.qrCode}" alt="Ticket QR" style="width:220px;height:220px" />
      </div>
      <p><strong>Ticket ID:</strong> ${p.userId}</p>
      <p><strong>Date:</strong> ${p.eventDate} • <strong>Time:</strong> ${p.eventTime}</p>
      ${p.venueName ? `<p><strong>Venue:</strong> ${p.venueName}</p>` : ""}
      ${p.venueAddress ? `<p>${p.venueAddress}</p>` : ""}
      <p>See you at the event!</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER!,
      to: p.to,
      subject: `Your ticket • ${p.eventName}`,
      html,
    });
    return true;
  } catch (err) {
    console.error('sendTicketEmail error:', err);
    return false;
  }
}
