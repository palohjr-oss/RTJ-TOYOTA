import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  User,
  ShieldAlert
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

export default function UserManagement() {
  const { user: currentUser, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({ username: '', password: '', nama: '', role: 'FO' });
  const [editForm, setEditForm] = useState({ nama: '', role: 'FO', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    },
    enabled: isAdmin,
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/users', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      setIsAddOpen(false);
      setAddForm({ username: '', password: '', nama: '', role: 'FO' });
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Gagal menambahkan user baru.');
    }
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/users/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      setIsEditOpen(false);
      setSelectedUser(null);
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Gagal memperbarui data user.');
    }
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Gagal menghapus user.');
    }
  });

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ nama: user.nama, role: user.role, password: '' });
    setErrorMsg('');
    setIsEditOpen(true);
  };

  const handleDelete = (id, username) => {
    if (window.confirm(`Yakin ingin menghapus user "${username}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center text-rose-700 max-w-lg mx-auto my-12">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-rose-600" />
        <h3 className="text-base font-bold">Akses Khusus Administrator</h3>
        <p className="text-xs text-rose-600 mt-1">
          Halaman ini hanya dapat diakses oleh akun dengan peran Administrator.
        </p>
      </div>
    );
  }

  const users = usersData || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-toyota-red"></span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Manajemen Pengguna & Hak Akses
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun Admin, Service Advisor (SA), dan Front Officer (FO) Wira Toyota Banjarmasin
          </p>
        </div>

        <button
          onClick={() => { setErrorMsg(''); setIsAddOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-toyota-red hover:bg-toyota-darkRed rounded-xl shadow-toyota transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* User Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs text-left">
            <thead className="bg-slate-50/80 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Pengguna</th>
                <th className="px-5 py-4">Role / Hak Akses</th>
                <th className="px-5 py-4">Tanggal Dibuat</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-5 py-8 text-center text-slate-400">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.nama}</p>
                        <p className="text-xs text-slate-500 font-mono">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.role === 'Admin'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : u.role === 'SA'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      {u.role === 'Admin' ? 'Administrator' : u.role === 'SA' ? 'Service Advisor' : 'Front Officer'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(u.created_at || Date.now()).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                        title="Edit User"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {currentUser?.id !== u.id && (
                        <button
                          onClick={() => handleDelete(u.id, u.username)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah User Baru */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah Pengguna Baru" maxWidth="max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(addForm); }} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={addForm.username}
              onChange={(e) => setAddForm({ ...addForm, username: e.target.value.toUpperCase() })}
              placeholder="Contoh: AHMAD"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 uppercase font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={addForm.nama}
              onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
              placeholder="Contoh: Ahmad Rizki (SA)"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              placeholder="Masukkan password akun"
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Peran (Role) <span className="text-red-500">*</span></label>
            <select
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-medium"
            >
              <option value="FO">FO (Front Officer / Follow-up)</option>
              <option value="SA">SA (Service Advisor)</option>
              <option value="Admin">Admin (Akses Penuh)</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-toyota-red hover:bg-toyota-darkRed rounded-xl shadow-toyota transition-all"
            >
              {createMutation.isLoading ? 'Menyimpan...' : 'Simpan User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit User */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Pengguna" maxWidth="max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: selectedUser.id, payload: editForm }); }} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
            <input
              type="text"
              disabled
              value={selectedUser?.username || ''}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={editForm.nama}
              onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Peran (Role)</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-medium"
            >
              <option value="FO">FO (Front Officer)</option>
              <option value="SA">SA (Service Advisor)</option>
              <option value="Admin">Admin (Administrator)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password Baru (Kosongkan jika tidak diubah)</label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder="Masukkan password baru..."
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 font-medium"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-toyota-red hover:bg-toyota-darkRed rounded-xl shadow-toyota transition-all"
            >
              {updateMutation.isLoading ? 'Menyimpan...' : 'Perbarui User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
