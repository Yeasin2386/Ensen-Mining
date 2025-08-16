<?php
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

$users = read_users_data();

// Handle POST requests for admin actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    switch ($action) {
        case 'completeWithdrawal':
            $userId = $_POST['userId'];
            $withdrawalId = $_POST['withdrawalId'];
            foreach ($users as &$user) {
                if ($user['id'] == $userId && isset($user['withdrawalHistory'])) {
                    foreach ($user['withdrawalHistory'] as &$withdrawal) {
                        if ($withdrawal['id'] == $withdrawalId) {
                            $withdrawal['status'] = 'Completed';
                            break;
                        }
                    }
                }
            }
            break;

        case 'updateBalance':
            $userId = $_POST['userId'];
            $newBalance = $_POST['balance'];
            foreach ($users as &$user) {
                if ($user['id'] == $userId) {
                    $user['balance'] = $newBalance;
                    break;
                }
            }
            break;

        case 'deleteUser':
            $userId = $_POST['userId'];
            $users = array_filter($users, function($user) use ($userId) {
                return $user['id'] != $userId;
            });
            $users = array_values($users); // Re-index the array
            break;
    }

    write_users_data($users);
    header("Location: admin.php"); // Redirect to prevent form resubmission
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <style>
        body { font-family: sans-serif; background: #f4f4f4; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 20px; }
        .tab-buttons { display: flex; justify-content: center; margin-bottom: 20px; }
        .tab-buttons button { padding: 10px 20px; border: none; background: #ddd; cursor: pointer; margin: 0 5px; border-radius: 5px; }
        .tab-buttons button.active { background: #007BFF; color: #fff; }
        .main-content-section { display: none; }
        .main-content-section.active { display: block; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
        .form-container { margin-top: 20px; }
        .status-badge { padding: 5px 10px; border-radius: 12px; font-weight: bold; font-size: 0.8em; }
        .status-pending { background: #ffc107; color: #333; }
        .status-completed { background: #28a745; color: #fff; }
        .action-buttons { padding: 5px 10px; border: none; cursor: pointer; border-radius: 5px; margin-right: 5px; }
        .complete { background: #28a745; color: #fff; }
        .delete { background: #dc3545; color: #fff; }
        .update { background: #007BFF; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Admin Dashboard</h2>
        </div>
        <div class="tab-buttons">
            <button class="tab-button active" onclick="showSection('users')">Users</button>
            <button class="tab-button" onclick="showSection('withdrawals')">Withdrawal Requests</button>
            <button class="tab-button" onclick="showSection('accountSales')">Account Sales</button>
        </div>

        <div id="users" class="main-content-section active">
            <h3>All Users</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nickname</th>
                        <th>Balance</th>
                        <th>Referred By</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $user): ?>
                    <tr>
                        <td><?= htmlspecialchars($user['id']) ?></td>
                        <td><?= htmlspecialchars($user['nickname'] ?? 'N/A') ?></td>
                        <td><?= htmlspecialchars($user['balance'] ?? 0) ?> BDT</td>
                        <td><?= htmlspecialchars($user['referred_by'] ?? 'N/A') ?></td>
                        <td>
                            <form action="admin.php" method="POST" style="display:inline;">
                                <input type="hidden" name="action" value="updateBalance">
                                <input type="hidden" name="userId" value="<?= htmlspecialchars($user['id']) ?>">
                                <input type="number" name="balance" placeholder="New Balance" required>
                                <button type="submit" class="action-buttons update">Update Balance</button>
                            </form>
                            <form action="admin.php" method="POST" style="display:inline;">
                                <input type="hidden" name="action" value="deleteUser">
                                <input type="hidden" name="userId" value="<?= htmlspecialchars($user['id']) ?>">
                                <button type="submit" class="action-buttons delete" onclick="return confirm('Are you sure you want to delete this user?');">Delete</button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <div id="withdrawals" class="main-content-section">
            <h3>Pending Withdrawal Requests</h3>
            <table>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Details</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $user): ?>
                        <?php if (isset($user['withdrawalHistory'])): ?>
                            <?php foreach ($user['withdrawalHistory'] as $withdrawal): ?>
                                <?php if ($withdrawal['status'] === 'Pending'): ?>
                                <tr>
                                    <td><?= htmlspecialchars($user['id']) ?></td>
                                    <td><?= htmlspecialchars($withdrawal['amount']) ?> BDT</td>
                                    <td><?= htmlspecialchars($withdrawal['method']) ?></td>
                                    <td><?= htmlspecialchars($withdrawal['account_info']) ?></td>
                                    <td><span class="status-badge status-pending">Pending</span></td>
                                    <td>
                                        <form action="admin.php" method="POST">
                                            <input type="hidden" name="action" value="completeWithdrawal">
                                            <input type="hidden" name="userId" value="<?= htmlspecialchars($user['id']) ?>">
                                            <input type="hidden" name="withdrawalId" value="<?= htmlspecialchars($withdrawal['id']) ?>">
                                            <button type="submit" class="action-buttons complete">Complete</button>
                                        </form>
                                    </td>
                                </tr>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <div id="accountSales" class="main-content-section">
            <h3>Account Sales</h3>
            <p>This section lists all user-submitted accounts. You will need to implement file upload and processing logic in your `api.php` to handle this. You can add a new field to `users.json` for `uploaded_accounts` to track these.</p>
        </div>
    </div>

    <script>
        function showSection(sectionId) {
            const sections = document.querySelectorAll('.main-content-section');
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');

            const buttons = document.querySelectorAll('.tab-button');
            buttons.forEach(button => button.classList.remove('active'));
            document.querySelector(`.tab-button[onclick="showSection('${sectionId}')"]`).classList.add('active');
        }
    </script>
</body>
</html>
