import { db } from '../models/db.js';

export const getNotifications = async (req, res) => {
  try {
    const limit = req.query.limit || 40;
    const result = await db.getNotifications({ user: req.user, limit });
    return res.json({
      success: true,
      message: 'Notifikasi berhasil dimuat.',
      data: result.notifications,
      unread_count: result.unread_count,
      total: result.total
    });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil notifikasi.'
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id, all } = req.body;
    await db.markNotificationAsRead({ id, all: Boolean(all), user: req.user });
    return res.json({
      success: true,
      message: all ? 'Semua notifikasi ditandai dibaca.' : 'Notifikasi ditandai dibaca.'
    });
  } catch (error) {
    console.error('markAsRead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status notifikasi.'
    });
  }
};
