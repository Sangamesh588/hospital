// utils/sendEmail.js
const nodemailer = require('nodemailer');

async function sendEmail(patient, env) {
  // env: object with SMTP settings from process.env
  if (!env.SMTP_HOST) return; // email not configured
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  const html = `
    <h3>New Appointment Request</h3>
    <p><strong>Name:</strong> ${patient.fullname}</p>
    <p><strong>Phone:</strong> ${patient.phone}</p>
    <p><strong>Doctor:</strong> ${patient.preferredDoctor || 'Any'}</p>
    <p><strong>Date:</strong> ${patient.preferredDate ? new Date(patient.preferredDate).toLocaleString() : '—'}</p>
    <p><strong>Complaint:</strong> ${patient.complaint || ''}</p>
  `;

  await transporter.sendMail({
    from: env.FROM_EMAIL || env.SMTP_USER,
    to: env.ADMIN_EMAIL, // comma separated admins
    subject: `New appointment: ${patient.fullname}`,
    html
  });
}

module.exports = sendEmail;
