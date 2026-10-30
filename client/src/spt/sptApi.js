const API_BASE_URL = '/api';

export const sptApiService = {
  // Ambil daftar SPT dengan filter isolasi data pengguna & data konfigurasi
  async getSpt(user = null) {
    try {
      const params = new URLSearchParams();
      if (user?.nip) params.append('userNip', user.nip);
      if (user?.id) params.append('userId', user.id);
      if (user?.role || user?.sptRole) params.append('userRole', user.sptRole || user.role);
      if (user?.nama) params.append('userNama', user.nama);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const headers = {};
      if (user?.nip) headers['x-user-nip'] = user.nip;
      if (user?.role || user?.sptRole) headers['x-user-role'] = user.sptRole || user.role;
      if (user?.nama) headers['x-user-nama'] = user.nama;

      const res = await fetch(`${API_BASE_URL}/spt${qs}`, { headers });
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.error('Error fetching SPT list:', err);
      throw err;
    }
  },

  // Ambil 115 pegawai BRMP DIY
  async getPegawai() {
    try {
      const res = await fetch(`${API_BASE_URL}/spt/pegawai`);
      const json = await res.json();
      return json.data || json;
    } catch (err) {
      console.error('Error fetching pegawai:', err);
      throw err;
    }
  },

  // Ambil daftar Panitera aktif
  async getPanitera() {
    try {
      const res = await fetch(`${API_BASE_URL}/spt/panitera`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('Error fetching panitera:', err);
      return [];
    }
  },

  // Tambah Panitera baru (Admin)
  async addPanitera(pegawai, adminName = 'Administrator Sistem') {
    const res = await fetch(`${API_BASE_URL}/spt/panitera`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pegawai, adminName })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menambahkan Panitera');
    return json;
  },

  // Hapus Panitera (Admin)
  async removePanitera(identifier) {
    const res = await fetch(`${API_BASE_URL}/spt/panitera/${encodeURIComponent(identifier)}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menghapus Panitera');
    return json;
  },

  // Pengajuan SPT Baru (Hanya Panitera)
  async submitSpt(payload, user = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (user?.nip) headers['x-user-nip'] = user.nip;
    if (user?.role || user?.sptRole) headers['x-user-role'] = user.sptRole || user.role;
    if (user?.nama) headers['x-user-nama'] = user.nama;

    const bodyData = {
      ...payload,
      submitter: user ? {
        nip: user.nip,
        nama: user.nama,
        id: user.id,
        role: user.sptRole || user.role
      } : payload.paniteraPengaju
    };

    const res = await fetch(`${API_BASE_URL}/spt`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyData)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal membuat pengajuan SPT');
    return json;
  },

  // Approval SPT (Hanya Kobag TU)
  async approveSpt(id, role = 'kobag_tu', note = '', user = null) {
    const res = await fetch(`${API_BASE_URL}/spt/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        catatan: note,
        approver: user ? { nama: user.nama, nip: user.nip } : null
      })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menyetujui SPT');
    return json;
  },

  // Reject SPT
  async rejectSpt(id, role = 'kobag_tu', reason = '') {
    const res = await fetch(`${API_BASE_URL}/spt/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menolak SPT');
    return json;
  },

  // Terbitkan nomor SPT resmi & QR keaslian
  async terbitkanSpt(id, data) {
    const res = await fetch(`${API_BASE_URL}/spt/${id}/terbitkan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menerbitkan nomor SPT');
    return json;
  },

  // Upload Laporan
  async submitLaporan(id, data) {
    const res = await fetch(`${API_BASE_URL}/spt/${id}/laporan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal mengunggah laporan');
    return json;
  },

  // Simpan Menimbang
  async saveMenimbang(menimbang) {
    const res = await fetch(`${API_BASE_URL}/spt/menimbang`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menimbang })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menyimpan konsiderans menimbang');
    return json;
  },

  // Simpan Dasar
  async saveDasar(dasar) {
    const res = await fetch(`${API_BASE_URL}/spt/dasar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dasar })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Gagal menyimpan konsiderans dasar hukum');
    return json;
  }
};
