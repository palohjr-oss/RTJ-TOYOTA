import jwt from 'jsonwebtoken';
import { db } from '../models/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'wira_toyota_banjarmasin_rtj_secret_key_2026_super_secure';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token otentikasi tidak ditemukan. Silakan login terlebih dahulu.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Sesi pengguna tidak valid atau akun tidak ditemukan.'
      });
    }

    const { password_hash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Sesi telah kedaluwarsa atau token tidak valid. Silakan login kembali.'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses terlarang. Fitur ini hanya dapat diakses oleh Administrator.'
    });
  }
  next();
};
