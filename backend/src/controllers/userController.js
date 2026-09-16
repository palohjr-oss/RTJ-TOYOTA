import { db } from '../models/db.js';

export const getUsers = async (req, res) => {
  try {
    const users = await db.getAllUsers();
    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pengguna.'
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, nama, role } = req.body;

    if (!username || !password || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Username, Password, dan Nama Lengkap wajib diisi.'
      });
    }

    const existing = await db.findUserByUsername(username);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Username tersebut sudah terdaftar.'
      });
    }

    const newUser = await db.createUser({
      username,
      password,
      nama,
      role: role || 'FO'
    });

    return res.status(201).json({
      success: true,
      message: 'Pengguna baru berhasil ditambahkan.',
      data: newUser
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat pengguna baru.'
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, role, password } = req.body;

    const existing = await db.findUserById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    const updated = await db.updateUser(id, { nama, role, password });

    return res.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.',
      data: updated
    });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data pengguna.'
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (req.user && req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.'
      });
    }

    const deleted = await db.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    return res.json({
      success: true,
      message: 'Pengguna berhasil dihapus.'
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus pengguna.'
    });
  }
};
