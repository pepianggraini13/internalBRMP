-- =======================================================
-- DATABASE SCHEMA: BRMP DIY KEPEGAWAIAN, CUTI, & ADMS
-- Target Database: brmy4429_absensi (atau database cPanel Anda)
-- Generated for BRMP Yogyakarta
-- =======================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABEL PEGAWAI
DROP TABLE IF EXISTS tb_pegawai;
CREATE TABLE tb_pegawai (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pegawai_id VARCHAR(50) NOT NULL UNIQUE,
  nip VARCHAR(30) NOT NULL UNIQUE,
  password_year VARCHAR(10) DEFAULT '1980',
  nama VARCHAR(150) NOT NULL,
  jabatan VARCHAR(150) DEFAULT '',
  golongan VARCHAR(20) DEFAULT '',
  divisi VARCHAR(150) DEFAULT '',
  system_role ENUM('admin', 'pegawai') DEFAULT 'pegawai',
  approval_role ENUM('admin', 'pemohon', 'verifikator_1', 'verifikator_2') DEFAULT 'pemohon',
  role_label VARCHAR(100) DEFAULT 'Pegawai (Pemohon Cuti)',
  pin_mesin VARCHAR(30) DEFAULT '',
  sisa_cuti INT DEFAULT 12,
  cuti_terpakai INT DEFAULT 0,
  expired_cuti VARCHAR(20) DEFAULT '31-12-2026',
  jam_masuk VARCHAR(20) DEFAULT '',
  jam_pulang VARCHAR(20) DEFAULT '',
  jam_kerja VARCHAR(50) DEFAULT '07:30:00 - 16:00:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (nip),
  INDEX (pin_mesin),
  INDEX (approval_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL PENGAJUAN CUTI (2 TAHAP VERIFIKASI)
DROP TABLE IF EXISTS tb_cuti;
CREATE TABLE tb_cuti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cuti_code VARCHAR(50) NOT NULL UNIQUE,
  no_urut INT DEFAULT 1,
  pegawai_id VARCHAR(50) NOT NULL,
  nip VARCHAR(30) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  jabatan VARCHAR(150) DEFAULT '',
  divisi VARCHAR(150) DEFAULT '',
  tanggal_pengajuan VARCHAR(20) DEFAULT '',
  tanggal_mulai DATE NOT NULL,
  tanggal_akhir DATE NOT NULL,
  jumlah_hari INT DEFAULT 1,
  jatah_tahun VARCHAR(10) DEFAULT '2026',
  jenis_cuti VARCHAR(50) DEFAULT 'Tahunan',
  alasan TEXT,
  status VARCHAR(50) DEFAULT 'menunggu_verif_1',
  status_label VARCHAR(100) DEFAULT 'Menunggu Verifikasi 1 (Atasan Langsung)',
  verif_1_status VARCHAR(20) DEFAULT 'menunggu',
  verif_1_nama VARCHAR(150) DEFAULT '',
  verif_1_nip VARCHAR(50) DEFAULT '',
  verif_1_tanggal VARCHAR(30) DEFAULT '',
  verif_1_catatan TEXT,
  verif_2_status VARCHAR(20) DEFAULT 'menunggu',
  verif_2_nama VARCHAR(150) DEFAULT '',
  verif_2_nip VARCHAR(50) DEFAULT '',
  verif_2_tanggal VARCHAR(30) DEFAULT '',
  verif_2_catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (nip),
  INDEX (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL MESIN ADMS (FINGERPRINT SOLUTION / ZKTECO)
DROP TABLE IF EXISTS tb_adms_machines;
CREATE TABLE tb_adms_machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sn VARCHAR(50) NOT NULL UNIQUE,
  nama_mesin VARCHAR(100) NOT NULL,
  ip VARCHAR(50) DEFAULT '127.0.0.1',
  last_sync DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'Online',
  total_logs INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL LOG ABSENSI MASUK / PULANG DARI MESIN
DROP TABLE IF EXISTS tb_adms_logs;
CREATE TABLE tb_adms_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sn VARCHAR(50) DEFAULT 'UNKNOWN',
  pin VARCHAR(50) NOT NULL,
  nama VARCHAR(150) DEFAULT '',
  jabatan VARCHAR(150) DEFAULT '',
  datetime_log DATETIME NOT NULL,
  tanggal DATE NOT NULL,
  jam TIME NOT NULL,
  status_absen VARCHAR(20) DEFAULT 'Masuk',
  keterangan VARCHAR(100) DEFAULT '',
  raw_payload TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (pin),
  INDEX (tanggal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- INSERT DATA AWAL PEGAWAI RESMI BRMP DIY (116 ORANG)
-- =======================================================
INSERT INTO tb_pegawai (pegawai_id, nip, password_year, nama, jabatan, golongan, divisi, system_role, approval_role, role_label, pin_mesin, sisa_cuti, cuti_terpakai, expired_cuti, jam_masuk, jam_pulang, jam_kerja) VALUES
('PEG-ADM', '198001012005011001', '1980', 'ADMINISTRATOR KEPEGAWAIAN', 'Pranata Komputer Ahli Muda / Admin Kepegawaian', 'III/c', 'Sub Bagian Tata Usaha & Kepegawaian', 'admin', 'admin', 'Administrator Kepegawaian', '999', 12, 0, '31-12-2026', '07:15:00', '16:00:00', '07:30:00 - 16:00:00'),
('PEG-001', '197109271998031002', '1971', 'Dr. Soeharsono,S.Pt,M.Si', 'Kepala Balai', '', 'Pimpinan Balai', 'pegawai', 'verifikator_2', 'Kepala Balai', '1', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-002', '198101312009121004', '1981', 'Agung Ariyanto, SEI., M.Ec., Dev.', 'Ketua Bagian Tata Usaha', 'III/d', 'Bagian Tata Usaha', 'pegawai', 'verifikator_2', 'Verifikator 2 (Kepala Bagian TU)', '2', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-003', '198604092011012024', '1986', 'Dwi Dinia Rahayu, S.Kom, M.T.I', 'Analis Sumber Daya Manusia Aparatur Ahli Pertama', 'III/d', 'Tim Kerja Pengelolaan Sumber Daya Manusia', 'pegawai', 'verifikator_1', 'Verifikator 1 (Ketua Tim Kerja SDM)', '3', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-004', '198906012015032004', '1989', 'Devi Eka Nuvitasari, S.H.', 'Penelaah Teknis Kebijakan', 'III/b', 'Tim Kerja Pengelolaan Sumber Daya Manusia', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '4', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-005', '199005022025051006', '1990', 'Romy Husodo', 'Analis Sumber Daya Manusia Aparatur Ahli Pertama', 'III/a', 'Tim Kerja Pengelolaan Sumber Daya Manusia', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '5', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-006', '198106212006042002', '1981', 'Asri Wijayanti, SE', 'Analis Pengelolaan Keuangan APBN Ahli Pertama', 'III/d', 'Tim Kerja Keuangan dan Barang Milik Negara', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '6', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-007', '197601152007012001', '1976', 'Surantiningsih, SE', 'Pranata Keuangan APBN Mahir', 'III/b', 'Tim Kerja Keuangan dan Barang Milik Negara', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '7', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-008', '197907102009122003', '1979', 'Susanti Dwi Habsari, S.Sos', 'Penelaah Teknis Kebijakan', 'III/d', 'Tim Kerja Keuangan dan Barang Milik Negara', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '8', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-009', '198206082009122007', '1982', 'Triyana Handayani, A.Md', 'Pengolah Data Dan Informasi', 'III/c', 'Tim Kerja Keuangan dan Barang Milik Negara', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '9', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-010', '198506172011011008', '1985', 'Yulius Argo Baroto, S.T.', 'Pengolah Data Dan Informasi', 'III/d', 'Tim Kerja Keuangan dan Barang Milik Negara', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '10', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-011', '197809122009101001', '1978', 'Anindito Widinugroho, S.E.', 'Penelaah Teknis Kebijakan', 'III/d', 'Tim Kerja Keuangan dan Barang Milik Negara', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '11', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-012', '197807272009121002', '1978', 'Suka Nugraha, A. Md.', 'Penelaah Teknis Kebijakan', 'III/c', 'Tim Kerja Keuangan dan Barang Milik Negara', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '12', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-013', '198808062014032001', '1988', 'Agnita Verdiani Putri, A.Md', 'Pengolah Data Dan Informasi', 'III/b', 'Tim Kerja Keuangan dan Barang Milik Negara', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '13', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-014', '199104192015032002', '1991', 'Fajar Istiqomah', 'Pengolah Data Dan Informasi', 'III/b', 'Tim Kerja Keuangan dan Barang Milik Negara', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '14', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-015', '197106141992032001', '1971', 'Yuni Pratiwi, S.ST., Ars', 'Arisparis Ahli Muda', 'III/d', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '15', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-016', '197207091999031001', '1972', 'Sinung Rustijarno, S.PI, M.SI', 'Penelaah Teknis Kebijakan', 'IV/b', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '16', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-017', '199111042023212041', '1991', 'Novita Widiyanti, A.Md', 'Arsiparis Terampil', 'VII', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '17', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-018', '199510052025211008', '1995', 'Putranto Wachyu Hidayat, S.H.', 'Pranata Hubungan Masyarakat Ahli Pertama', 'IX', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '18', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-019', '198109162011011005', '1981', 'Iskandar, S.M.', 'Arsiparis Mahir', 'III/b', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '19', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-020', '199605252025212022', '1996', 'Eka Silvia Ninggar', 'Pengadministrasi Perkantoran', 'V', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '20', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-021', '199103102025211055', '1991', 'Redi Permana, S.Kom', 'Pranata Komputer Ahli Pertama', 'IX', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '21', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-022', '197003202000031001', '1970', 'Murdiman', 'Pengadministrasi Perkantoran', 'II/b', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '22', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-023', '197704052009101001', '1977', 'Samidi', 'Operator Layanan Operasional', 'III/a', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '23', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-024', '196809122002121001', '1968', 'Kasirin', 'Operator Layanan Operasional', 'II/d', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '24', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-025', '198211162008121002', '1982', 'Hartono', 'Operator Layanan Operasional', 'II/c', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '25', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-026', '199908202025211022', '1999', 'Fajar Surya Widiawan', 'Operator Layanan Operasional', 'V', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '26', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-027', '198306202009101001', '1983', 'Putra Jadmika', 'Pengadministrasi Perkantoran', 'III/a', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '27', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-028', '196912272008121001', '1969', 'Sukidi', 'Operator Layanan Operasional', 'II/a', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '28', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-029', '198010072025211009', '1980', 'Asnani', 'Pengadministrasi Perkantoran', 'V', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '29', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-030', '198411032025211013', '1984', 'Hariyanto', 'Operator Layanan Operasional', 'V', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '30', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-031', '198907082025211065', '1989', 'Nanang Dwi Susanto', 'Operator Layanan Operasional', 'V', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '31', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-032', '198112142025211048', '1981', 'Agung Slamet Hartanto', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '32', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-033', '199201112025211066', '1992', 'Ari Budiyono', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '33', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-034', '198209092025211089', '1982', 'Eko Wiraswanto', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '34', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-035', '199106282025211072', '1991', 'Eva Setyawan', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '35', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-036', '199006072025211079', '1990', 'Ihwan Yunianto', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '36', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-037', '199403092025211060', '1994', 'Wahana', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '37', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-038', '197812012025211063', '1978', 'Wantoro Ramihaji', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '38', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-039', '200111252025211008', '2001', 'Anton Wibowo', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '39', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-040', '198306092025211064', '1983', 'Girjo Wiyanto', 'Pengelola Umum Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '40', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-041', '198008162025211061', '1980', 'Slamet Riyadi', 'Pengelola Umum Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '41', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-042', '199801172025211045', '1998', 'Adi Saputra Kusuma', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '42', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-043', '198906142025211092', '1989', 'Rudi Baktiyar', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '43', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-044', '197204032025211034', '1972', 'Lukman Hakim', 'Operator Layanan Operasional', '', 'Tim Kerja Tata Usaha dan Rumah Tangga', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '44', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-045', '197804242008011009', '1978', 'Dr. Ahmad Yunan Arifin, M.Si.', 'Pengawas Bibit Ternak Ahli Muda', 'III/c', 'Kelompok Program dan Pengujian', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '45', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-046', '198302162011011008', '1983', 'Eko Sutardi, SE', 'Perencana Ahli Muda', 'III/d', 'Tim Kerja Program, Evaluasi, dan  Pendampingan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '46', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-047', '198101072009122005', '1981', 'Sukarmi, SE.', 'Analis Pengelolaan Keuangan Apbn Ahli Pertama', 'III/d', 'Tim Kerja Program, Evaluasi, dan  Pendampingan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '47', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-048', '199701282025052006', '1997', 'Wahyu Rizky Rahmawati, S.Si', 'Analis Pemanfaatan Ilmu Pnegetahuan dan Teknologi  Ahli Pertama', 'III/a', 'Tim Kerja Program, Evaluasi, dan  Pendampingan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '48', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-049', '198003272009101001', '1980', 'Agung Iswadi, S.Si , M.Sc', 'Analis Prasarana Dan Sarana Pertanian Ahli Muda', 'III/c', 'Tim Kerja Pengujian Teknologi Spesifik Lokasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '49', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-050', '198105192009121001', '1981', 'Eko Srihartanto, SP., M.Sc', 'Analis Prasarana Dan Sarana Pertanian Ahli Muda', 'III/d', 'Tim Kerja Pengujian Teknologi Spesifik Lokasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '50', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-051', '198807081011012020', '1988', 'Kiki Yolanda, SP., M.Sc', 'Penelaah Teknis Kebijakan', 'III/d', 'Tim Kerja Pengujian Teknologi Spesifik Lokasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '51', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-052', '198104072009122002', '1981', 'Riefna Afriani, SP.,M.P.', 'Pengawas Mutu Hasil Pertanian Ahli Muda', 'III/c', 'Tim Kerja Pengujian Teknologi Spesifik Lokasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '52', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-053', '197402062000032001', '1974', 'Dr. Fibrianty, SP, M.Si', 'Analis Prasarana Dan Sarana Pertanian Ahli Madya', 'IV/a', 'Kelompok Pendampingan Modernisasi Pertanian', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '53', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-054', '197206181999032001', '1972', 'Kurnianita Triwidiastuti, S.PI, MA', 'Analis Prasarana Dan Sarana Pertanian Ahli Muda', 'III/d', 'Tim Pendampingan Program dan Wilayah I', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '54', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-055', '198206152009101002', '1982', 'Priyanto, SST', 'Penyuluh Pertanian Ahli Muda', 'III/c', 'Tim Pendampingan Program dan Wilayah I', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '55', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-056', '198612102009122004', '1986', 'drh. Aty Purnamasari', 'Pengadministrasi Perkantoran', 'III/d', 'Tim Pendampingan Program dan Wilayah I', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '56', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-057', '199510192019022001', '1995', 'Yumaroh, S.TP', 'Pengawas Mutu Hasil Pertanian Ahli Pertama', 'III/a', 'Tim Pendampingan Program dan Wilayah I', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '57', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-058', '197912112008012012', '1979', 'Nurdeana Cahyaningrum, S.TP', 'Pengawas Mutu Hasil Pertanian Ahli Pertama', 'III/b', 'Tim Pendampingan Program dan Wilayah I', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '58', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-059', '197606072009011006', '1976', 'Utomo Bimo Bekti, SP', 'Kepala Subbagian Tata Usaha', 'III/d', 'Tim Pendampingan Program dan Wilayah II', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '59', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-060', '196806191998031002', '1968', 'Reki  Hendrata, SP', 'Analis Prasarana Dan Sarana Pertanian Ahli Muda', 'III/d', 'Tim Pendampingan Program dan Wilayah II', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '60', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-061', '197403231998032001', '1974', 'Irawati, STP., MSc.', 'Penyuluh Pertanian Ahli Madya', 'IV/b', 'Tim Pendampingan Program dan Wilayah II', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '61', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-062', '198512132009122004', '1985', 'Defiana Prastiti, S.P., M.Sc.', 'Analis Perkarantinaan Tumbuhan Ahli Pertama', 'III/c', 'Tim Pendampingan Program dan Wilayah II', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '62', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-063', '198611022009122004', '1986', 'Novita Nining W, SP., M.Gz', 'Operator Layanan Operasional', 'III/d', 'Tim Pendampingan Program dan Wilayah II', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '63', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-064', '198207052006042002', '1982', 'Dr. Christina Astri Wirasti, SP., M.Sc', 'Penelaah Teknis Kebijakan', 'III/d', 'Kelompok Penerapan dan Penilaian Kesesuaian', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '64', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-065', '198108262011012006', '1981', 'Diah Sulistyorini, SP, MP', 'Penyuluh Pertanian Ahli Muda', 'III/d', 'Tim Kerja Penerapan Diseminasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '65', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-066', '196209171987032007', '1962', 'Ir. Ari Widyastuti', 'Penyuluh Pertanian Ahli Utama', 'IV/e', 'Tim Kerja Penerapan Diseminasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '66', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-067', '197003191999032001', '1970', 'Sulasmi, S.ST', 'Penyuluh Pertanian Ahli Madya', 'IV/b', 'Tim Kerja Penerapan Diseminasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '67', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-068', '196609041995031001', '1966', 'Suparjana, S.ST', 'Penyuluh Pertanian Ahli Madya', 'IV/a', 'Tim Kerja Penerapan Diseminasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '68', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-069', '197709222011011005', '1977', 'Heru Nurwanto,S.Pt, M.M.A', 'Penyuluh Pertanian Ahli Pertama', 'III/b', 'Tim Kerja Penerapan Diseminasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '69', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-070', '198612272014032001', '1986', 'Ari Widya Handayani, SP., M.Sc.', 'Penyuluh Pertanian Ahli Pertama', 'III/b', 'Tim Kerja Penerapan Diseminasi', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '70', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-071', '198012072006042001', '1980', 'Charisnalia Listyowati, SP., M.Sc', 'Pengawas Mutu Hasil Pertanian Ahli Muda', 'III/d', 'Tim Kerja Pengelola Kerjasama, Layanan, dan Kesesuaian', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '71', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-072', '198802102019022001', '1988', 'Fera Dwi Elyana, S.TP', 'Pengawas Mutu Hasil Pertanian Ahli Pertama', 'III/b', 'Tim Kerja Pengelola Kerjasama, Layanan, dan Kesesuaian', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '72', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-073', '199510272025052002', '1995', 'Fikky Amalia, S.Si', 'Analis Pemanfaatan Ilmu Pnegetahuan dan Teknologi  Ahli Pertama', 'III/a', 'Tim Kerja Pengelola Kerjasama, Layanan, dan Kesesuaian', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '73', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-074', '196807121999031001', '1968', 'Widada, A.Md', 'Pengawas Mutu Pakan Penyelia', 'III/c', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '74', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-075', '198803072019022001', '1988', 'Ardian Prihastuti, A.Md A.K', 'Pengawas Benih Tanaman Terampil', 'II/c', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '75', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-076', '198303162009012007', '1983', 'Vitra Maya Indriyanto, S.Si.', 'Pengawas Mutu Hasil Pertanian Ahli Muda', 'III/d', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '76', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-077', '198706142014032002', '1987', 'Prasasti Wahyu Haryati, S.SI, M.Si', 'Analis Perkarantinaan Tumbuhan Ahli Muda', 'III/c', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '77', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-078', '198305122011012017', '1983', 'Niken Pawestri, A.Md', 'Pengawas Benih Tanaman Terampil', 'II/d', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '78', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-079', '198609052014031005', '1986', 'Gunawan Ari Kuncoro, Amd', 'Operator Laboratorium', 'III/b', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '79', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-080', '197601082009122001', '1976', 'Farida Susiyanti, S.P.', 'Operator Laboratorium', 'III/d', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '80', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-081', '197712062009012005', '1977', 'Dwi Indrayani Wijoyo, S.TP', 'Pengolah Data Dan Informasi', 'III/d', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '81', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-082', '196811032007012001', '1968', 'Sumisih', 'Pengadministrasi Perkantoran', 'III/a', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '82', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-083', '200110162025052005', '2001', 'Oktin Dyah Sekar Wangi, S.Si', 'Analis Pemanfaatan Ilmu Pnegetahuan dan Teknologi  Ahli Pertama', 'III/a', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '83', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-084', '200009192025052006', '2000', 'Selvia Dwi Putri Handayani, S.Si', 'Analis Pemanfaatan Ilmu Pnegetahuan dan Teknologi  Ahli Pertama', 'III/a', 'Laboratorium Pupuk, Tanah, dan Air', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '84', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-085', '198505142006042001', '1985', 'Eka Sri Wahyuningsih, SP', 'Pustakawan Ahli Muda', 'III/c', 'Perpustakaan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '85', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-086', '197508132003122001', '1975', 'Dwi Titaningsih, A.Md', 'Pustakawan Penyelia', 'III/d', 'Perpustakaan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '86', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-087', '197512062009012001', '1975', 'Purwaningsih, S.TP, M.Sc', 'Pengawas Mutu Hasil Pertanian Ahli Muda', 'III/c', 'Unit Pengelola Benih Sumber', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '87', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-088', '198308122014032001', '1983', 'Dwi Nur Susanti, S.Si.', 'Analis Perkarantinaan Tumbuhan Ahli Muda', 'III/c', 'Unit Pengelola Benih Sumber', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '88', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-089', '197603252009122003', '1976', 'Sulistiyah, S.Si., M.Si.', 'Pengelola Pengadaan Barang/Jasa Ahli Muda', 'III/d', 'Unit Pengelola Benih Sumber', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '89', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-090', '198801292015031002', '1988', 'Isro Hariadi, SP', 'Penyuluh Pertanian Ahli Pertama', 'III/b', 'Unit Pengelola Benih Sumber', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '90', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-091', '198908312025211005', '1989', 'Eka Setyadi Nugraha, SP.', 'Pengawas Mutu Hasil Pertanian Ahli Pertama', 'IX', 'Unit Pengelola Benih Sumber', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '91', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-092', '197407262008011010', '1974', 'Prabowo Lestari, S.P., M.Si.', 'Penelaah Teknis Kebijakan', 'III/d', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '92', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-093', '198106122006042001', '1981', 'drh.Anastasia Sischa J U, M.Sc', 'Medik Veteriner Ahli Muda', 'III/c', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '93', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-094', '198309052014032001', '1983', 'drh. Sutarti', 'Dokter Hewan Karantina Ahli Muda', 'III/d', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '94', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-095', '199708192019021001', '1997', 'Yoga Prasetiyo Aji, A.Md.', 'Paramedik Karantina Hewan Terampil', 'II/d', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '95', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-096', '198709202015031002', '1987', 'FX.Aribowo Septyanto', 'Paramedik Karantina Hewan Terampil', 'II/c', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '96', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-097', '197108162007011002', '1971', 'Sri Widada', 'Pengawas Mutu Pakan Terampil', 'II/d', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '97', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-098', '197211232025211011', '1972', 'Agung Utomo Tukiran', 'Pengelola Umum Operasional', '', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '98', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-099', '198508232025211040', '1985', 'Azis Harwanto', 'Penata Layanan Operasional', '', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '99', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-100', '197810092025211030', '1978', 'Eka Sumarsono', 'Operator Layanan Operasional', '', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '100', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-101', '199609022025211035', '1996', 'Abdullah Mas’úd', 'Operator Layanan Operasional', '', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '101', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-102', '198611292025211055', '1986', 'Indro Supoyo', 'Operator Layanan Operasional', '', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '102', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-103', '197710222025212019', '1977', 'Tumiyem', 'Pengelola Umum Operasional', '', 'Kebun Percobaan Banyakan', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '103', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-104', '198401312011012005', '1984', 'Agnes Purwaningsih', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '104', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-105', '198412072014021001', '1984', 'Agung Abdillah', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '105', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-106', '198408162011011007', '1984', 'Andi Bagus Dermawan', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '106', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-107', '198504202011011012', '1985', 'Apriadi Panca Nugroho Jati', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '107', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-108', '198709082014022001', '1987', 'Dian Purwanti', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '108', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-109', '198410272014021001', '1984', 'Haris Rusdiyanto', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '109', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-110', '197103272006042001', '1971', 'Mardhiyah Nur Hardjanti', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '110', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-111', '197908212011011007', '1979', 'Nata Agung Arwanta', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '111', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-112', '199510182019032017', '1995', 'Resti Sri Andriani', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '112', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-113', '198004152021212002', '1980', 'Tho''Ad Sri Biastuti', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '113', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-114', '198404152011012003', '1984', 'Utik Apriyani Dwi Rahayu', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '114', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00'),
('PEG-115', '199510172019032015', '1995', 'Sayyida Ikrima', 'Penyuluh Pertanian Lapangan', '', 'PENYULUH PERTANIAN LAPANGAN', 'pegawai', 'pemohon', 'Pegawai (Pemohon Cuti)', '115', 12, 0, '31-12-2026', '', '', '07:30:00 - 16:00:00');

-- INSERT DATA AWAL MESIN FINGERPRINT
INSERT INTO tb_adms_machines (sn, nama_mesin, ip, last_sync, status, total_logs)
VALUES ('UCR6235200084', 'Mesin Absensi Lobi Utama BRMP DIY', '192.168.2.73', NOW(), 'Online', 2);

-- INSERT SAMPLE DATA CUTI DENGAN WORKFLOW 2 VERIFIKASI
INSERT INTO tb_cuti (cuti_code, no_urut, pegawai_id, nip, nama, jabatan, divisi, tanggal_pengajuan, tanggal_mulai, tanggal_akhir, jumlah_hari, jatah_tahun, jenis_cuti, alasan, status, status_label, verif_1_status, verif_1_nama, verif_1_nip, verif_1_tanggal, verif_1_catatan, verif_2_status)
VALUES 
('CUTI-2025-001', 1, 'PEG-013', '198808062014032001', 'Agnita Verdiani Putri, A.Md', 'Pengolah Data Dan Informasi', 'Tim Kerja Keuangan dan Barang Milik Negara', '12-06-2025', '2025-06-16', '2025-06-17', 2, '2025', 'Tahunan', 'Keperluan keluarga di luar kota', 'menunggu_verif_1', 'Menunggu Verifikasi 1 (Atasan Langsung)', 'menunggu', 'Dwi Dinia Rahayu, S.Kom, M.T.I', '198604092011012024', '', '', 'menunggu'),
('CUTI-2025-002', 2, 'PEG-004', '198906012015032004', 'Devi Eka Nuvitasari, S.H.', 'Penelaah Teknis Kebijakan', 'Tim Kerja Pengelolaan Sumber Daya Manusia', '05-06-2025', '2025-06-09', '2025-06-10', 2, '2025', 'Tahunan', 'Menghadiri wisuda anggota keluarga', 'menunggu_verif_2', 'Menunggu Verifikasi 2 (Kepala Bagian TU)', 'disetujui', 'Dwi Dinia Rahayu, S.Kom, M.T.I', '198604092011012024', '06-06-2025 09:30', 'Disetujui. Tugas pengganti sudah dikoordinasikan.', 'menunggu');

SET FOREIGN_KEY_CHECKS = 1;
