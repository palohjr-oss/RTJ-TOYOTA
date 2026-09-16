import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import api from '../../api/client';
import Modal from './Modal';

export default function ImportExcelModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setPreviewData([]);
    setPreviewHeaders([]);
    setParsing(false);
    setUploading(false);
    setImportResult(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (
      !selectedFile.name.endsWith('.xlsx') &&
      !selectedFile.name.endsWith('.xls')
    ) {
      setErrorMsg('Format file harus berupa Excel (.xlsx atau .xls)');
      return;
    }

    setErrorMsg('');
    setFile(selectedFile);
    setImportResult(null);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames.find(n => {
          const ln = n.toLowerCase();
          return ln.includes('data rtj') || ln.includes('return job') || ln.includes('rtj');
        }) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

        if (json && json.length > 0) {
          // Auto-detect header row by matching keywords (bisa skip judul seperti "RETURN JOB RTJ", "AGUSTUS", dll)
          const HEADER_KEYWORDS = [
            'no', 'polisi', 'nopol', 'customer', 'nama', 'tanggal', 'tgl',
            'service', 'sa', 'fo', 'teknisi', 'status', 'kategori', 'q1', 'keterangan',
            'kendala', 'hp', 'unit', 'model', 'km', 'rtj', 'wo'
          ];

          let headerRowIndex = 0;
          let bestScore = 0;

          for (let i = 0; i < Math.min(20, json.length); i++) {
            const row = json[i];
            if (!Array.isArray(row)) continue;
            const score = row.filter(cell => {
              const cellStr = String(cell || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              return HEADER_KEYWORDS.some(kw => cellStr.includes(kw));
            }).length;

            if (score > bestScore) {
              bestScore = score;
              headerRowIndex = i;
            }
          }

          const headers = json[headerRowIndex] || [];
          const allDataRows = json.slice(headerRowIndex + 1).filter(row =>
            Array.isArray(row) && row.some(cell => cell !== '' && cell !== null && cell !== undefined)
          );
          const rows = allDataRows.slice(0, 10); // preview up to 10 rows
          setPreviewHeaders(headers);
          setPreviewData(rows);
        } else {
          setErrorMsg('File Excel tidak memiliki data atau kosong.');
        }
      } catch (err) {
        console.error('Error parsing excel preview:', err);
        setErrorMsg('Gagal membaca file Excel untuk preview.');
      } finally {
        setParsing(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleConfirmImport = async () => {
    if (!file) return;

    setUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/rtj/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setImportResult(res.data);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.data.message || 'Gagal mengimpor file Excel.');
      }
    } catch (err) {
      console.error('Import upload error:', err);
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat mengunggah file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/rtj/export-template', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Template_RTJ_Wira_Toyota_Banjarmasin.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Download template error:', error);
      alert('Gagal mengunduh template Excel.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Data RTJ dari Excel Wira Toyota" maxWidth="max-w-5xl">
      <div className="space-y-5">
        {/* Template Download Prompt */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Format Kolom Excel Sesuai Standar Wira Toyota</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Kolom: <strong>No | Q1-Q5 | Tanggal Service | No. Polisi | Nama Customer | No. HP | UNIT | SERVICE | SA | FO | TEKNISI | Detail Kendala | Tanggal RTJ | Keterangan | Status RTJ</strong>
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-toyota-red bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Format (.xlsx)</span>
          </button>
        </div>

        {/* Upload Zone */}
        {!importResult && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              file ? 'border-toyota-red/50 bg-red-50/20' : 'border-slate-300 hover:border-toyota-red hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-toyota-red flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {file ? file.name : 'Klik untuk memilih file Excel RTJ atau seret file ke sini'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Mendukung format .xlsx & .xls langsung dari rekap RTJ Wira Toyota
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Client Preview Table */}
        {previewData.length > 0 && !importResult && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pratinjau Data (10 Baris Pertama)
              </p>
              <span className="text-xs text-slate-500">
                Otomatis membaca sheet & kolom
              </span>
            </div>

            <div className="overflow-x-auto max-h-64 border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0">
                  <tr>
                    {previewHeaders.map((h, i) => (
                      <th key={i} className="px-3 py-2 whitespace-nowrap bg-slate-100">
                        {h || `Kolom ${i+1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {previewHeaders.map((_, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-700">
                          {String(row[cIdx] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result Summary */}
        {importResult && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Import Selesai!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {importResult.message}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-500">Baris Berhasil</span>
                  <p className="text-lg font-bold text-emerald-600">{importResult.imported}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <span className="text-slate-500">Baris Gagal</span>
                  <p className="text-lg font-bold text-rose-600">{importResult.failed}</p>
                </div>
              </div>
            </div>

            {/* Error details */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Rincian Baris Gagal ({importResult.errors.length} baris):
                </p>
                <div className="max-h-40 overflow-y-auto border border-rose-200 rounded-xl p-2 bg-rose-50/50 text-xs space-y-1">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="p-1.5 bg-white rounded border border-rose-100 text-slate-700">
                      <span className="font-bold text-rose-600">Baris #{err.row}</span> ({err.customer} / {err.nopol}): {err.reasons.join(', ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {importResult ? 'Selesai' : 'Batal'}
          </button>

          {!importResult && (
            <button
              type="button"
              disabled={!file || uploading}
              onClick={handleConfirmImport}
              className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-toyota transition-all ${
                !file || uploading
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-toyota-red hover:bg-toyota-darkRed'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memvalidasi & Mengimpor...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Konfirmasi Import</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
