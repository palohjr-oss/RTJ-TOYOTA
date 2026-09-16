import { db } from '../models/db.js';

export const getSummary = async (req, res) => {
  try {
    const { sa, fo, status, periode_mulai, periode_selesai } = req.query;
    const summary = await db.getDashboardSummary({ sa, fo, status, periode_mulai, periode_selesai });

    return res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('getSummary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data ringkasan dashboard.'
    });
  }
};

export const getChartData = async (req, res) => {
  try {
    const { sa, fo, periode_mulai, periode_selesai } = req.query;
    const charts = await db.getDashboardCharts({ sa, fo, periode_mulai, periode_selesai });

    return res.json({
      success: true,
      data: charts
    });
  } catch (error) {
    console.error('getChartData error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data grafik dashboard.'
    });
  }
};
