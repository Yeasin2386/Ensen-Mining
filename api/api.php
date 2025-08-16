<?php
header('Content-Type: application/json');
// Fix the file path to ensure it works on Vercel
$file = __DIR__ . '/users.json';
$data = json_decode(file_get_contents($file), true) ?? [];

function save_data($data, $file) {
    file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? $_GET['action'] ?? null;
$userId = $input['userId'] ?? $_GET['userId'] ?? null;

if (!$action) {
    echo json_encode(['status' => 'error', 'message' => 'No action specified.']);
    exit;
}

switch ($action) {
    case 'registerUser':
        $newUser = $input['user'];
        $newUser['id'] = uniqid();
        $newUser['balance'] = 0;
        $newUser['totalReferrals'] = 0;
        $newUser['tasks'] = [
            'adsWatched' => 0,
            'accountsSold' => 0,
            'totalEarnings' => 0
        ];
        $newUser['referrals'] = [];
        $newUser['withdrawalHistory'] = [];

        // Check for duplicate username or phone
        foreach ($data as $user) {
            if ($user['username'] === $newUser['username'] || $user['phone'] === $newUser['phone']) {
                echo json_encode(['status' => 'error', 'message' => 'Username or Phone already exists.']);
                exit;
            }
        }
        
        $data[] = $newUser;
        save_data($data, $file);
        echo json_encode(['status' => 'success', 'message' => 'Registration successful.', 'userId' => $newUser['id']]);
        break;

    case 'getUserData':
        $foundUser = null;
        foreach ($data as $user) {
            if ($user['id'] === $userId) {
                $foundUser = $user;
                break;
            }
        }
        if ($foundUser) {
            echo json_encode(['status' => 'success', 'user' => $foundUser]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        }
        break;

    case 'updateBalance':
        $amount = $input['amount'] ?? 0;
        $taskType = $input['taskType'] ?? '';
        $foundUserKey = null;

        foreach ($data as $key => $user) {
            if ($user['id'] === $userId) {
                $foundUserKey = $key;
                break;
            }
        }

        if ($foundUserKey !== null) {
            $data[$foundUserKey]['balance'] += $amount;
            $data[$foundUserKey]['tasks']['totalEarnings'] += $amount;
            
            if ($taskType === 'adWatch') {
                $data[$foundUserKey]['tasks']['adsWatched'] += 1;
            }
            if ($taskType === 'gmail' || $taskType === 'instagram') {
                $data[$foundUserKey]['tasks']['accountsSold'] += 1;
            }
            
            save_data($data, $file);
            echo json_encode(['status' => 'success', 'message' => 'Balance updated.', 'user' => $data[$foundUserKey]]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        }
        break;

    case 'requestWithdraw':
        $amount = $input['amount'];
        $method = $input['method'];
        $account = $input['account'];
        $password = $input['password'];
        $foundUserKey = null;

        foreach ($data as $key => $user) {
            if ($user['id'] === $userId) {
                $foundUserKey = $key;
                break;
            }
        }

        if ($foundUserKey !== null) {
            $user = $data[$foundUserKey];
            if ($user['transactionPassword'] !== $password) {
                echo json_encode(['status' => 'error', 'message' => 'Invalid transaction password.']);
                exit;
            }
            if ($user['balance'] < $amount) {
                echo json_encode(['status' => 'error', 'message' => 'Insufficient balance.']);
                exit;
            }

            // Deduct balance and add withdrawal request
            $data[$foundUserKey]['balance'] -= $amount;
            $withdrawal = [
                'id' => uniqid(),
                'amount' => $amount,
                'method' => $method,
                'account' => $account,
                'date' => date('Y-m-d H:i:s'),
                'status' => 'Pending'
            ];
            $data[$foundUserKey]['withdrawalHistory'][] = $withdrawal;

            save_data($data, $file);
            echo json_encode(['status' => 'success', 'message' => 'Withdrawal request submitted successfully.', 'user' => $data[$foundUserKey]]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        }
        break;

    case 'changePassword':
        $oldPassword = $input['oldPassword'];
        $newPassword = $input['newPassword'];
        $foundUserKey = null;

        foreach ($data as $key => $user) {
            if ($user['id'] === $userId) {
                $foundUserKey = $key;
                break;
            }
        }
        
        if ($foundUserKey !== null) {
            if ($data[$foundUserKey]['transactionPassword'] !== $oldPassword) {
                echo json_encode(['status' => 'error', 'message' => 'Incorrect old password.']);
                exit;
            }
            $data[$foundUserKey]['transactionPassword'] = $newPassword;
            save_data($data, $file);
            echo json_encode(['status' => 'success', 'message' => 'Password changed successfully.', 'user' => $data[$foundUserKey]]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action.']);
        break;
}
?>
