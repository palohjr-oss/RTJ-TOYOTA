import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../models/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'wira_toyota_banjarmasin_rtj_secret_key_2026_super_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan Password wajib diisi.'
      });
    }

    const user = await db.findUserByUsername(username.trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username atau Password tidak cocok.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau Password tidak cocok.'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password_hash, ...safeUser } = user;

    return res.json({
      success: true,
      message: `Selamat datang kembali, ${user.nama}!`,
      data: {
        user: safeUser,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat proses login.'
    });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    data: {
      user: req.user
    }
  });
};

export const logout = async (req, res) => {
  return res.json({
    success: true,
    message: 'Berhasil keluar dari sistem.'
  });
};
