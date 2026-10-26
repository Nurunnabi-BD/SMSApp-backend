const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ambulanceRoutes = require('./routes/ambulanceRoutes');
const recordRoutes = require('./routes/recordRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const medicineRoutes = require('./routes/medicineRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    message: 'Smart Medical Services API is running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/medicines', medicineRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\x1b[32m✔ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}\x1b[0m`);
  console.log(`\x1b[36m👉 Health Check: http://localhost:${PORT}/api/health\x1b[0m`);
});
