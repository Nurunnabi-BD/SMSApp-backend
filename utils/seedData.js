const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Ambulance = require('../models/Ambulance');
const MedicalRecord = require('../models/MedicalRecord');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`\x1b[32m✔ MongoDB Connected for Seeding: ${conn.connection.host}\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m✖ MongoDB Connection Error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

const seedData = async () => {
  await connectDB();

  try {
    console.log('\x1b[33mClearing existing collections...\x1b[0m');
    await User.deleteMany();
    await DoctorProfile.deleteMany();
    await Appointment.deleteMany();
    await Notification.deleteMany();
    await Ambulance.deleteMany();
    await MedicalRecord.deleteMany();

    console.log('\x1b[34mCreating demo users...\x1b[0m');

    // 1. Admin Account
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@smartmedical.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 555-0199',
      bloodGroup: 'O+',
      gender: 'Male',
      address: 'Admin Headquarters, Metro City',
      isVerified: true,
    });

    // 2. Patient Account
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@smartmedical.com',
      password: 'patient123',
      role: 'patient',
      phone: '+1 555-0100',
      bloodGroup: 'A+',
      gender: 'Male',
      dateOfBirth: '1995-06-15',
      address: '742 Evergreen Terrace, Springfield',
      isVerified: true,
    });

    // 3. Main Doctor Account (Dr. Michael Lee)
    const doctorUser1 = await User.create({
      name: 'Dr. Michael Lee',
      email: 'doctor@smartmedical.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1 555-0145',
      bloodGroup: 'B+',
      gender: 'Male',
      address: 'Cardiology Center, Suite 402',
      isVerified: true,
    });

    const docProfile1 = await DoctorProfile.create({
      user: doctorUser1._id,
      specialization: 'Cardiologist',
      qualifications: ['MBBS', 'MD (Cardiology)', 'FACC'],
      experienceYears: 12,
      consultationFee: 75,
      hospital: 'Smart Central Heart Institute',
      rating: 4.9,
      reviewsCount: 128,
      patientsCount: 840,
      bio: 'Board-certified cardiologist specializing in preventive cardiology, echocardiography, and hypertension management with over a decade of clinical experience.',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
      isApproved: true,
      licenseNumber: 'BMDC-78451',
    });

    // 4. Additional Doctors for realistic experience
    const doctorUser2 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@smartmedical.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1 555-0182',
      bloodGroup: 'O+',
      gender: 'Female',
      address: 'Pediatric Pavilion, Room 102',
      isVerified: true,
    });

    const docProfile2 = await DoctorProfile.create({
      user: doctorUser2._id,
      specialization: 'Pediatrician',
      qualifications: ['MBBS', 'DCH', 'MD (Pediatrics)'],
      experienceYears: 8,
      consultationFee: 50,
      hospital: 'Children & Family Care Clinic',
      rating: 4.8,
      reviewsCount: 94,
      patientsCount: 520,
      bio: 'Compassionate pediatrician focusing on child growth, developmental milestones, vaccinations, and pediatric emergency care.',
      availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      timeSlots: ['10:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '04:00 PM'],
      isApproved: true,
      licenseNumber: 'BMDC-45210',
    });

    const doctorUser3 = await User.create({
      name: 'Dr. James Wilson',
      email: 'james.wilson@smartmedical.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1 555-0193',
      bloodGroup: 'AB+',
      gender: 'Male',
      address: 'Dermatology Wing, Floor 3',
      isVerified: true,
    });

    const docProfile3 = await DoctorProfile.create({
      user: doctorUser3._id,
      specialization: 'Dermatologist',
      qualifications: ['MBBS', 'DDVL', 'FCPS (Dermatology)'],
      experienceYears: 10,
      consultationFee: 60,
      hospital: 'Skin & Laser Wellness Center',
      rating: 4.7,
      reviewsCount: 82,
      patientsCount: 430,
      bio: 'Specialist in clinical dermatology, acne treatments, hair restoration, eczema, and skin cancer screenings.',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      timeSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
      isApproved: true,
      licenseNumber: 'BMDC-96321',
    });

    const doctorUser4 = await User.create({
      name: 'Dr. Emily Taylor',
      email: 'emily.taylor@smartmedical.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+1 555-0167',
      bloodGroup: 'A-',
      gender: 'Female',
      address: 'Neurosciences Institute, Floor 5',
      isVerified: true,
    });

    const docProfile4 = await DoctorProfile.create({
      user: doctorUser4._id,
      specialization: 'Neurologist',
      qualifications: ['MBBS', 'MD (Neurology)', 'FRCP'],
      experienceYears: 15,
      consultationFee: 90,
      hospital: 'Metropolitan Neuroscience Center',
      rating: 5.0,
      reviewsCount: 160,
      patientsCount: 920,
      bio: 'Leading consultant neurologist treating migraine, epilepsy, stroke rehabilitation, and neuromuscular disorders.',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      timeSlots: ['10:00 AM', '12:00 PM', '02:30 PM', '04:00 PM'],
      isApproved: true,
      licenseNumber: 'BMDC-11223',
    });

    // 5. Sample Appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);

    const appt1 = await Appointment.create({
      patient: patientUser._id,
      doctor: doctorUser1._id,
      doctorProfile: docProfile1._id,
      appointmentDate: tomorrow,
      appointmentTime: '10:00 AM',
      problemDescription: 'Routine cardiac checkup and blood pressure monitoring.',
      status: 'confirmed',
      fee: 75,
      isPaid: true,
    });

    const appt2 = await Appointment.create({
      patient: patientUser._id,
      doctor: doctorUser3._id,
      doctorProfile: docProfile3._id,
      appointmentDate: nextWeek,
      appointmentTime: '02:00 PM',
      problemDescription: 'Skin allergy and redness on forehead.',
      status: 'pending',
      fee: 60,
      isPaid: false,
    });

    // 6. Assistant User (assigned to Dr. Michael Lee)
    const assistantUser = await User.create({
      name: 'Kamrul Hasan (Assistant)',
      email: 'assistant@smartmedical.com',
      password: 'assistant123',
      role: 'assistant',
      phone: '+880 1812-345678',
      chamberLocation: 'Room 402, Central Heart Institute',
      assignedDoctor: doctorUser1._id,
      isVerified: true,
    });

    // 7. Seed Ambulances (Managed by Admin, called via phone dialpad)
    await Ambulance.create([
      {
        name: 'ICU Cardiac Emergency Ambulance - 01',
        phone: '+8801711223344',
        driverName: 'Mohammad Al-Amin',
        address: 'Dhanmondi / Panthapath Zone, Dhaka',
        type: 'ICU',
        isAvailable: true,
      },
      {
        name: 'AC Life Support Ambulance - 02',
        phone: '+8801822334455',
        driverName: 'Rafiqul Islam',
        address: 'Mohakhali / Gulshan Hub, Dhaka',
        type: 'AC',
        isAvailable: true,
      },
      {
        name: 'Standard Rapid Response Ambulance - 03',
        phone: '+8801933445566',
        driverName: 'Abdul Karim',
        address: 'Uttara Sector 3 Stand, Dhaka',
        type: 'Standard',
        isAvailable: true,
      },
    ]);

    // 8. Seed Medical Records & Prescriptions
    await MedicalRecord.create([
      {
        patient: patientUser._id,
        doctor: doctorUser1._id,
        doctorName: 'Dr. Michael Lee',
        type: 'prescription',
        title: 'Prescription for Hypertension & Cardiac Checkup',
        hospital: 'Smart Central Heart Institute',
        diagnosis: 'Stage 1 Hypertension & Mild Angina',
        medications: [
          { name: 'Tab. Rosuvastatin', dosage: '10mg', frequency: '0+0+1', duration: '30 days' },
          { name: 'Tab. Bisoprolol', dosage: '2.5mg', frequency: '1+0+0', duration: '30 days' },
        ],
        fileFormat: 'PDF',
        fileSizeMb: 1.15,
      },
      {
        patient: patientUser._id,
        type: 'report',
        title: 'Complete Blood Count (CBC) & Lipid Profile',
        hospital: 'Popular Diagnostic Center',
        diagnosis: 'Cholesterol slightly elevated. Normal Hb%.',
        fileFormat: 'JPG',
        fileSizeMb: 1.82,
      },
    ]);

    // 9. Notifications
    await Notification.create({
      recipient: patientUser._id,
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. Michael Lee is confirmed for tomorrow at 10:00 AM.`,
      type: 'appointment',
      relatedId: appt1._id,
      isRead: false,
    });

    await Notification.create({
      recipient: patientUser._id,
      title: 'Welcome to Smart Medical!',
      message: 'Explore qualified specialists, book instant appointments, and manage your health records.',
      type: 'system',
      isRead: true,
    });

    console.log('\x1b[32m✔ Database successfully seeded with demo accounts & appointments!\x1b[0m');
    console.log('\x1b[36m---------------------------------------------------\x1b[0m');
    console.log('📌 Patient Login:    patient@smartmedical.com / patient123');
    console.log('📌 Doctor Login:     doctor@smartmedical.com / doctor123');
    console.log('📌 Assistant Login:  assistant@smartmedical.com / assistant123');
    console.log('📌 Admin Login:      admin@smartmedical.com / admin123');
    console.log('\x1b[36m---------------------------------------------------\x1b[0m');

    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m✖ Seeding error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  try {
    await User.deleteMany();
    await DoctorProfile.deleteMany();
    await Appointment.deleteMany();
    await Notification.deleteMany();
    console.log('\x1b[31m✔ All database collections destroyed!\x1b[0m');
    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m✖ Error destroying data: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
