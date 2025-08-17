<?php
header('Content-Type: application/json');

$usersFile = 'users.json';
$configFile = 'config.json';
$uploadDir = 'uploads/';

if (!is_dir($uploadDir)) { @mkdir($uploadDir, 0777, true); }
if (!file_exists($usersFile)) { file_put_contents($usersFile, '[]'); }
if (!file_exists($configFile)) { file_put_contents($configFile, '{}'); }

function read_json($file) { return json_decode(file_get_contents($file), true) ?? []; }
function save_json($file, $data) { file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)); }

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_POST['action'] ?? null;

$usersData = read_json($usersFile);
$configData = read_json($configFile);

$userId = $input['userId'] ?? $_POST['userId'] ?? null;
$userKey = null;
if ($userId) {
    $userKey = array_search($userId, array_column($usersData, 'id'));
}

switch ($action) {
    case 'getConfig':
        echo json_encode(['status' => 'success', 'config' => $configData]);
        break;

    case 'registerUser':
        $newUser = $input['user'];
        foreach ($usersData as $user) {
            if ($user['username'] === $newUser['username'] || $user['phone'] === $newUser['phone']) {
                echo json_encode(['status' => 'error', 'message' => 'Username or Phone already exists.']);
                exit;
            }
        }
        
        $newUser['id'] = 'user_' . uniqid();
        $newUser['balance'] = 0;
        $newUser['status'] = 'registered';
        $newUser['registrationDate'] = date('Y-m-d H:i:s');
        $newUser['tasks'] = ['adsWatched' => 0, 'accountsSold' => 0, 'totalEarnings' => 0];
        $newUser['submittedFiles'] = [];
        $newUser['withdrawalHistory'] = [];

        $usersData[] = $newUser;
        save_json($usersFile, $usersData);
        echo json_encode(['status' => 'success', 'message' => 'Registration successful.', 'userId' => $newUser['id']]);
        break;

    case 'submitActivation':
        if ($userKey !== false) {
            $usersData[$userKey]['status'] = 'pending_activation';
            $usersData[$userKey]['activationTxId'] = $input['activationTxId'];
            save_json($usersFile, $usersData);
            echo json_encode(['status' => 'success', 'message' => 'Activation request submitted.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        }
        break;

    case 'getUserData':
        echo json_encode(['status' => 'success', 'user' => ($userKey !== false) ? $usersData[$userKey] : null]);
        break;
        
    case 'updateBalance':
        if ($userKey !== false) {
            $taskType = $input['taskType'];
            $amount = 0;
            if ($taskType === 'adWatch') {
                $amount = $configData['adRate'] ?? 0;
                $usersData[$userKey]['tasks']['adsWatched'] += 1;
            }
            $usersData[$userKey]['balance'] += $amount;
            $usersData[$userKey]['tasks']['totalEarnings'] += $amount;
            save_json($usersFile, $usersData);
            echo json_encode(['status' => 'success', 'message' => "You earned {$amount} BDT!", 'user' => $usersData[$userKey]]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        }
        break;

    case 'requestWithdraw':
        if ($userKey !== false) {
            $user = $usersData[$userKey];
            $amount = $input['amount'];
            if ($user['transactionPassword'] !== $input['password']) {
                echo json_encode(['status' => 'error', 'message' => 'Invalid transaction password.']); exit;
            }
            if ($user['balance'] < $amount) {
                echo json_encode(['status' => 'error', 'message' => 'Insufficient balance.']); exit;
            }

            $usersData[$userKey]['balance'] -= $amount;
            $usersData[$userKey]['withdrawalHistory'][] = ['id' => uniqid(), 'amount' => $amount, 'method' => $input['method'], 'account' => $input['account'], 'date' => date('Y-m-d H:i:s'), 'status' => 'Pending'];
            save_json($usersFile, $usersData);
            echo json_encode(['status' => 'success', 'message' => 'Withdrawal request submitted.', 'user' => $usersData[$userKey]]);
        } else {
             echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        }
        break;

    case 'submitFile':
        if ($userKey !== false && isset($_FILES['file'])) {
            $file = $_FILES['file'];
            $type = $_POST['type'];
            $fileName = $userId . '_' . $type . '_' . time() . '_' . basename($file['name']);
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $usersData[$userKey]['submittedFiles'][] = ['id' => uniqid(), 'type' => $type, 'path' => $targetPath, 'originalName' => basename($file['name']), 'date' => date('Y-m-d H:i:s'), 'status' => 'pending_review'];
                save_json($usersFile, $usersData);
                echo json_encode(['status' => 'success', 'message' => 'File submitted for review.']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to upload file.']);
            }
        } else {
             echo json_encode(['status' => 'error', 'message' => 'User not found or file not provided.']);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
        break;
}
?>
