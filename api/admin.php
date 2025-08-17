<?php
session_start();
$ADMIN_PASSWORD = "admin123"; 

if (isset($_POST['password']) && $_POST['password'] === $ADMIN_PASSWORD) { $_SESSION['loggedin'] = true; }
if (isset($_GET['logout'])) { session_destroy(); header('Location: admin.php'); exit; }

if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Admin Login</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f2f5;}form{background:white;padding:40px;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,0.1);}.form-group{margin-bottom:15px;}input[type=password]{width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;}input[type=submit]{width:100%;padding:10px;border:none;border-radius:4px;background:#007bff;color:white;cursor:pointer;}</style></head><body><form method="POST"><h3>Admin Login</h3><div class="form-group"><input type="password" name="password" placeholder="Password" required></div><input type="submit" value="Login"></form></body></html>';
    exit;
}

$usersFile = 'users.json';
$configFile = 'config.json';
$uploadDir = 'uploads/';

function read_json($file) { return json_decode(file_get_contents($file), true) ?? []; }
function save_json($file, $data) { file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)); }

$usersData = read_json($usersFile);
$configData = read_json($configFile);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    if ($action === 'approveActivation' || $action === 'approveFile' || $action === 'completeWithdrawal') {
        $userId = $_POST['userId'];
        $userKey = array_search($userId, array_column($usersData, 'id'));
        if ($userKey !== false) {
            if ($action === 'approveActivation') $usersData[$userKey]['status'] = 'active';
            if ($action === 'completeWithdrawal') {
                foreach($usersData[$userKey]['withdrawalHistory'] as &$w) {
                    if ($w['id'] === $_POST['withdrawalId']) $w['status'] = 'Completed';
                }
            }
            if ($action === 'approveFile') {
                $fileId = $_POST['fileId'];
                $rate = ($_POST['fileType'] === 'gmail') ? $configData['gmailRate'] : $configData['instagramRate'];
                foreach($usersData[$userKey]['submittedFiles'] as &$f) {
                    if ($f['id'] === $fileId) {
                        $f['status'] = 'approved';
                        $usersData[$userKey]['balance'] += $rate;
                    }
                }
            }
        }
        save_json($usersFile, $usersData);
    } elseif ($action === 'updateSettings') {
        foreach ($_POST as $key => $value) {
            if (isset($configData[$key])) $configData[$key] = is_numeric($value) ? (float)$value : $value;
        }
        save_json($configFile, $configData);
    }
    header("Location: admin.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><title>Admin Panel</title>
    <style>
        body { font-family: sans-serif; background: #f4f4f4; color: #333; margin:0; }
        .container { max-width: 1400px; margin: auto; padding: 20px; }
        .card { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1, h2, h3 { border-bottom: 2px solid #eee; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        button, .btn { background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; text-decoration:none; display:inline-block; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .form-group label { margin-bottom: 5px; font-weight: bold; display:block; }
        .form-group input { width:100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing:border-box;}
        .btn-approve { background: #28a745; }
        .btn-download { background: #17a2b8; }
        .btn-save { background: #ffc107; color: #333; }
        .btn-logout { background: #dc3545; }
    </style>
</head>
<body>
<div class="container">
    <h1>Admin Panel <a href="?logout=true" class="btn btn-logout">Logout</a></h1>
    <div class="card">
        <h2>Pending Activations</h2>
        <table><thead><tr><th>User</th><th>Phone</th><th>Txn ID</th><th>Action</th></tr></thead>
            <tbody><?php foreach ($usersData as $u) if ($u['status'] === 'pending_activation') echo "<tr><td>{$u['nickname']}</td><td>{$u['phone']}</td><td>{$u['activationTxId']}</td><td><form method='POST'><input type='hidden' name='action' value='approveActivation'><input type='hidden' name='userId' value='{$u['id']}'><button class='btn-approve' type='submit'>Approve</button></form></td></tr>"; ?></tbody>
        </table>
    </div>
    <div class="card">
        <h2>Submitted Files</h2>
        <table><thead><tr><th>User</th><th>Type</th><th>File</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody><?php foreach($usersData as $u) if(!empty($u['submittedFiles'])) foreach($u['submittedFiles'] as $f) echo "<tr><td>{$u['nickname']}</td><td>{$f['type']}</td><td>{$f['originalName']}</td><td>{$f['date']}</td><td>{$f['status']}</td><td><a class='btn btn-download' href='{$f['path']}' download>Download</a>".($f['status']==='pending_review' ? "<form method='POST' style='display:inline;'><input type='hidden' name='action' value='approveFile'><input type='hidden' name='userId' value='{$u['id']}'><input type='hidden' name='fileId' value='{$f['id']}'><input type='hidden' name='fileType' value='{$f['type']}'><button class='btn-approve' type='submit'>Approve</button></form>" : "")."</td></tr>"; ?></tbody>
        </table>
    </div>
    <div class="card">
        <h2>Withdrawal Requests</h2>
        <table><thead><tr><th>User</th><th>Amount</th><th>Method</th><th>Account</th><th>Date</th><th>Action</th></tr></thead>
             <tbody><?php foreach($usersData as $u) if(!empty($u['withdrawalHistory'])) foreach($u['withdrawalHistory'] as $w) if($w['status'] === 'Pending') echo "<tr><td>{$u['nickname']}</td><td>{$w['amount']}</td><td>{$w['method']}</td><td>{$w['account']}</td><td>{$w['date']}</td><td><form method='POST'><input type='hidden' name='action' value='completeWithdrawal'><input type='hidden' name='userId' value='{$u['id']}'><input type='hidden' name='withdrawalId' value='{$w['id']}'><button class='btn-approve' type='submit'>Complete</button></form></td></tr>"; ?></tbody>
        </table>
    </div>
    <div class="card">
        <h2>App Settings</h2>
        <form method="POST">
            <input type="hidden" name="action" value="updateSettings">
            <div class="form-grid"><?php foreach($configData as $k => $v) echo "<div class='form-group'><label for='{$k}'>".ucfirst(preg_replace('/(?<!^)[A-Z]/',' $0',$k))."</label><input type='text' id='{$k}' name='{$k}' value='{$v}'></div>"; ?></div><br>
            <button type="submit" class="btn-save">Save Settings</button>
        </form>
    </div>
</div>
</body>
</html>
