// utils/sendSms.js
const Twilio = require('twilio');

async function sendSms(patient, env) {
  if (!env.TWILIO_SID || !env.TWILIO_TOKEN || !env.TWILIO_FROM) return;
  const client = Twilio(env.TWILIO_SID, env.TWILIO_TOKEN);
  const body = `Appointment request received for ${patient.fullname}. Phone: ${patient.phone}. ID: ${patient._id}`;
  // send to admin(s)
  const admins = (env.ADMIN_MOBILE || '').split(',').map(s=>s.trim()).filter(Boolean);
  for (const to of admins) {
    await client.messages.create({ body, from: env.TWILIO_FROM, to });
  }
  // optional: send confirmation to patient
  if (patient.phone) {
    try {
      await client.messages.create({ body: `We received your request (ID:${patient._id}). We will call to confirm.`, from: env.TWILIO_FROM, to: patient.phone });
    } catch (e){ /* ignore patient SMS errors */ }
  }
}

module.exports = sendSms;
