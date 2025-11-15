// routes/patients.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Patient = require('../models/Patient');
const sendEmail = require('../utils/sendEmail');
const sendSms = require('../utils/sendSms');

const router = express.Router();

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '');
    cb(null, `${ts}_${safe}`);
  }
});
const upload = multer({ storage });

function parseDate(value){
  if(!value) return undefined;
  const d = new Date(value);
  if(isNaN(d.getTime())) return undefined;
  return d;
}

// Create patient (accepts multipart/form-data)
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const {
      fullname, phone, email, age, gender, address, complaint, doctor, date
    } = req.body;

    if (!fullname || !phone) {
      return res.status(400).json({ message: 'fullname and phone are required' });
    }

    const patientData = {
      fullname,
      phone,
      email: email || undefined,
      age: age ? Number(age) : undefined,
      gender: gender || 'Other',
      address: address || undefined,
      complaint: complaint || undefined,
      preferredDoctor: doctor || undefined,
      preferredDate: parseDate(date)
    };

    if (req.file) {
      patientData.reportFile = `/uploads/${req.file.filename}`;
    }

    const patient = new Patient(patientData);
    await patient.save();

    // send notifications in background (do not block response)
    (async () => {
      try { await sendEmail(patient, process.env); } catch(e){ console.error('sendEmail error', e); }
      try { await sendSms(patient, process.env); } catch(e){ console.error('sendSms error', e); }
    })();

    res.status(201).json({ message: 'Patient saved', patient });
  } catch (err) {
    next(err);
  }
});

// List patients
router.get('/', async (req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 }).limit(500);
    res.json(patients);
  } catch (err) {
    next(err);
  }
});

// Get single patient
router.get('/:id', async (req, res, next) => {
  try {
    const p = await Patient.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
