// models/Patient.js
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  fullname: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male','Female','Other'], default: 'Other' },
  address: { type: String, trim: true },
  complaint: { type: String, trim: true },
  preferredDoctor: { type: String, trim: true },
  preferredDate: { type: Date },
  reportFile: { type: String }, // path to uploaded file (optional)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);
