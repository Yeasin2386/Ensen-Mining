<?php
header('Content-Type: application/json');

// Function to read data from users.json
function read_users_data() {
    $file_path = 'users.json';
    if (file_exists($file_path)) {
        $json_data = file_get_contents($file_path);
        return json_decode($json_data, true);
    }
    return [];
}

// Function to write data to users.json
function write_users_data($data) {
    $file_path = 'users.json';
    $json_data = json_encode($data, JSON_PRETTY_PRINT);
    return file_put_contents($file_path, $json_data);
}

// Get the requested action from the URL
$action = $_GET['action'] ?? '';
$data = read_users_data();
$response = ['status' => 'error', 'message' => 'Invalid action'];

switch ($action) {
    case 'login':
        $phone = $_POST['phone'] ?? '';
        $user_found = false;
        foreach ($data as $user) {
            if ($user['phone'] === $phone) {
                $response = ['status' => 'success', 'user' => $user];
                $user_found = true;
                break;
            }
        }
        if (!$user_found) {
            $response = ['status' => 'error', 'message' => 'User not found.'];
        }
        break;

    case 'register':
        $username = $_POST['username'] ?? '';
        $nickname = $_POST['nickname'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $referred_by = $_POST['referred_by'] ?? '';

        $user_exists = false;
        foreach ($data as $user) {
            if ($user['phone'] === $phone) {
                $user_exists = true;
                break;
            }
        }

        if ($user_exists) {
            $response = ['status' => 'error', 'message' => 'User with this phone number already exists.'];
        } else {
            $new_user_id = uniqid();
            $new_user = [
                'id' => $new_user_id,
                'username' => $username,
                'nickname' => $nickname,
                'phone' => $phone,
                'balance' => 0,
                'tasks' => ['accountsSold' => 0],
                'withdrawalHistory' => [],
                'referred_by' => $referred_by
            ];
            $data[] = $new_user;
            write_users_data($data);
            $response = ['status' => 'success', 'message' => 'Registration successful!'];
        }
        break;

    case 'updateBalance':
        $userId = $_POST['userId'] ?? '';
        $amount = $_POST['amount'] ?? 0;
        foreach ($data as &$user) {
            if ($user['id'] === $userId) {
                $user['balance'] += $amount;
                write_users_data($data);
                $response = ['status' => 'success', 'message' => 'Balance updated.'];
                break;
            }
        }
        break;

    case 'requestWithdrawal':
        $userId = $_POST['userId'] ?? '';
        $amount = $_POST['amount'] ?? 0;
        $method = $_POST['method'] ?? '';
        $account_info = $_POST['account_info'] ?? '';

        foreach ($data as &$user) {
            if ($user['id'] === $userId) {
                if ($user['balance'] >= $amount) {
                    $withdrawal_id = uniqid();
                    $new_withdrawal = [
                        'id' => $withdrawal_id,
                        'amount' => (float)$amount,
                        'method' => $method,
                        'account_info' => $account_info,
                        'status' => 'Pending',
                        'timestamp' => date('Y-m-d H:i:s')
                    ];
                    $user['withdrawalHistory'][] = $new_withdrawal;
                    $user['balance'] -= (float)$amount;
                    write_users_data($data);
                    $response = ['status' => 'success', 'message' => 'Withdrawal request submitted successfully.'];
                } else {
                    $response = ['status' => 'error', 'message' => 'Insufficient balance.'];
                }
                break;
            }
        }
        break;
}

echo json_encode($response);
?>
