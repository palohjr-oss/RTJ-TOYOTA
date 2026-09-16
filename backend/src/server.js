import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import dotenv from 'dotenv';
import { requireAuth, requireAdmin } from './middleware/auth.js';
import * as authController from './controllers/authController.js';
import * as rtjController from './controllers/rtjController.js';
import * as dashboardController from './controllers/dashboardController.js';
import * as userController from './controllers/userController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Multer for memory upload (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xlsx / .xls) yang diperbolehkan!'), false);
    }
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RTJ Web API - Wira Toyota Banjarmasin'
  });
});

// ==========================================
// AUTH ROUTES
// ==========================================
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', requireAuth, authController.logout);
app.get('/api/auth/me', requireAuth, authController.getMe);

// ==========================================
// DASHBOARD & STATS ROUTES
// ==========================================
app.get('/api/dashboard/summary', requireAuth, dashboardController.getSummary);
app.get('/api/dashboard/chart', requireAuth, dashboardController.getChartData);

// ==========================================
// RTJ ROUTES
// ==========================================
app.get('/api/rtj/export-template', rtjController.exportTemplate);
app.post('/api/rtj/import', requireAuth, upload.single('file'), rtjController.importExcel);
app.delete('/api/rtj', requireAuth, requireAdmin, rtjController.deleteAllRTJ);
app.get('/api/rtj', requireAuth, rtjController.getRTJList);
app.get('/api/rtj/:id', requireAuth, rtjController.getRTJById);
app.post('/api/rtj', requireAuth, rtjController.createRTJ);
app.put('/api/rtj/:id', requireAuth, rtjController.updateRTJ);
app.delete('/api/rtj/:id', requireAuth, rtjController.deleteRTJ);

// ==========================================
// USER MANAGEMENT ROUTES (Admin only)
// ==========================================
app.get('/api/users', requireAuth, requireAdmin, userController.getUsers);
app.post('/api/users', requireAuth, requireAdmin, userController.createUser);
app.put('/api/users/:id', requireAuth, requireAdmin, userController.updateUser);
app.delete('/api/users/:id', requireAuth, requireAdmin, userController.deleteUser);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.'
  });
});

// Start Server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚗 RTJ Wira Toyota Banjarmasin Backend API Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🔒 Initial Accounts:`);
    console.log(`   - HENDRI (Admin)   [PW: BISMILLAH]`);
    console.log(`   - DEBBY  (FO/SA)   [PW: 1]`);
    console.log(`====================================================`);
  });
}

export default app;
