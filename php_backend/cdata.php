<?php
// =======================================================
// BRMP DIY - Native ADMS Receiver Protocol (PHP)
// Endpoint for ZKTeco & Solution Fingerprint Attendance
// =======================================================

require_once __DIR__ . '/config.php';

header("Content-Type: text/plain; charset=utf-8");
header("Pragma: no-cache");
header("Cache-Control: no-store");
header("Connection: close");

$sn = $_GET['SN'] ?? $_GET['sn'] ?? 'SN_UNKNOWN';
$options = $_GET['options'] ?? '';
$table = $_GET['table'] ?? '';
$clientIp = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

// Touch machine status in database
if ($useMysql && $pdo && !empty($sn) && $sn !== 'SN_UNKNOWN') {
    try {
        if (!empty($isSqlite)) {
            $stmt = $pdo->prepare("INSERT OR REPLACE INTO tb_adms_machines (sn, nama_mesin, ip, last_sync, status, total_logs) 
                VALUES (?, 'Mesin Absensi Lobi Utama BRMP DIY', ?, datetime('now', 'localtime'), 'Online', 0)");
            $stmt->execute([$sn, $clientIp]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO tb_adms_machines (sn, nama_mesin, ip, last_sync, status, total_logs) 
                VALUES (?, 'Mesin Absensi Lobi Utama BRMP DIY', ?, NOW(), 'Online', 0) 
                ON DUPLICATE KEY UPDATE ip = VALUES(ip), last_sync = NOW(), status = 'Online'");
            $stmt->execute([$sn, $clientIp]);
        }
    } catch (Exception $e) {}
}

// 1. GET Request: Handshake & Ping
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($options === 'all') {
        $configResponse = "GET OPTION FROM: $sn\r\n" .
            "Stamp=9999\r\n" .
            "OpStamp=None\r\n" .
            "ErrorDelay=30\r\n" .
            "Delay=10\r\n" .
            "TransTimes=00:00;14:05\r\n" .
            "TransInterval=1\r\n" .
            "TransFlag=1111111111\r\n" .
            "Realtime=1\r\n" .
            "TimeZone=7\r\n" .
            "Encrypt=0";
        echo $configResponse;
        exit;
    }
    echo "OK";
    exit;
}

// 2. POST Request: Attendance Push (ATTLOG)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (empty(trim($rawInput))) {
        echo "OK";
        exit;
    }

    $lines = explode("\n", str_replace("\r", "", $rawInput));
    $processedCount = 0;
    $admsLogPath = __DIR__ . '/admsLogs.json';
    $existingLogs = file_exists($admsLogPath) ? json_decode(file_get_contents($admsLogPath), true) : [];
    if (!is_array($existingLogs)) $existingLogs = [];

    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line)) continue;

        $parts = explode("\t", $line);
        if (count($parts) >= 2) {
            $pin = trim($parts[0]);
            $datetimeStr = trim($parts[1]);
            $statusRaw = isset($parts[2]) ? trim($parts[2]) : '0';

            $dtParts = explode(' ', $datetimeStr);
            $date = $dtParts[0] ?? date('Y-m-d');
            $time = $dtParts[1] ?? date('H:i:s');

            $isCheckIn = ($statusRaw === '0' || $statusRaw === '4');
            $statusAbsen = $isCheckIn ? 'Masuk' : 'Pulang';

            // Find matching employee
            $matched = null;
            if ($useMysql && $pdo) {
                $stmt = $pdo->prepare("SELECT * FROM tb_pegawai WHERE nip = ? OR pegawai_id = ? OR pin_mesin = ? OR nip LIKE ? LIMIT 1");
                $stmt->execute([$pin, $pin, $pin, "%$pin"]);
                $matched = $stmt->fetch();
            }

            if (!$matched) {
                $list = getFallbackPegawai();
                foreach ($list as $u) {
                    if ($u['nip'] === $pin || $u['id'] === $pin || ($u['pinMesin'] ?? '') === $pin || str_ends_with($u['nip'], $pin)) {
                        $matched = $u;
                        break;
                    }
                }
            }

            $nama = $matched['nama'] ?? "Pegawai (ID: $pin)";
            $jabatan = $matched['jabatan'] ?? "Staf Pegawai";
            $keterangan = ($statusAbsen === 'Masuk' && $time > '07:30:00') ? "Terlambat ($time)" : "Tepat Waktu ($time)";

            // Insert to MySQL if available
            if ($useMysql && $pdo) {
                try {
                    $insertStmt = $pdo->prepare("INSERT INTO tb_adms_logs (sn, pin, nama, jabatan, datetime_log, tanggal, jam, status_absen, keterangan, raw_payload) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $insertStmt->execute([$sn, $pin, $nama, $jabatan, "$date $time", $date, $time, $statusAbsen, $keterangan, $line]);
                } catch (Exception $e) {}
            }

            // Save to JSON
            array_unshift($existingLogs, [
                'id' => time() + $processedCount,
                'sn' => $sn,
                'pin' => $pin,
                'nama' => $nama,
                'jabatan' => $jabatan,
                'datetime' => "$date $time",
                'tanggal' => $date,
                'jam' => $time,
                'statusAbsen' => $statusAbsen,
                'keterangan' => $keterangan
            ]);

            $processedCount++;
        }
    }

    if ($processedCount > 0) {
        file_put_contents($admsLogPath, json_encode(array_slice($existingLogs, 0, 100), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo "OK: $processedCount";
    } else {
        echo "OK";
    }
    exit;
}

echo "OK";
