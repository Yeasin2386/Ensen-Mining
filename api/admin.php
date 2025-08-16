<?php
session_start();
// ফাইলের পথ ঠিক করা হয়েছে
$file = __DIR__ . '/users.json';
$data = json_decode(file_get_contents($file), true) ?? [];

// Authentication Credentials
$valid_username = 'Yeasin23863268';
$valid_password = 'Anita99Yeasin2386';

// Handle login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_username'])) {
    $username = $_POST['login_username'];
    $password = $_POST['login_password'];

    if ($username === $valid_username && $password === $valid_password) {
        $_SESSION['logged_in'] = true;
        header("Location: admin.php");
        exit;
    } else {
        $login_error = "Invalid username or password.";
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header("Location: admin.php");
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // Show login form
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <style>
            :root {
                --bg-color: #121212;
                --card-color: #2c2c2c;
                --text-color: #f0f0f0;
                --accent-color: #00d68f;
                --button-hover: #00a87a;
                --secondary-text-color: #b0b0b0;
            }
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                background-color: var(--bg-color);
                color: var(--text-color);
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
            }
            .login-container {
                background-color: var(--card-color);
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                width: 90%;
                max-width: 400px;
                text-align: center;
            }
            .login-container h2 {
                color: var(--accent-color);
                margin-bottom: 25px;
            }
            .login-container .input-group {
                margin-bottom: 20px;
                text-align: left;
            }
            .login-container .input-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: bold;
                color: var(--secondary-text-color);
            }
            .login-container .input-group input {
                width: 100%;
                padding: 12px;
                border: 1px solid #444;
                background-color: #333;
                color: var(--text-color);
                border-radius: 8px;
                box-sizing: border-box;
            }
            .login-container button {
                width: 100%;
                padding: 15px;
                border: none;
                background-color: var(--accent-color);
                color: #1a1a1a;
                font-size: 1.1em;
                font-weight: bold;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            .login-container button:hover {
                background-color: var(--button-hover);
            }
            .login-container .error-message {
                color: #ff4d4f;
                margin-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h2>Admin Login</h2>
            <?php if (isset($login_error)): ?>
                <div class="error-message"><?php echo $login_error; ?></div>
            <?php endif; ?>
            <form action="admin.php" method="POST">
                <div class="input-group">
                    <label for="login_username">Username</label>
                    <input type="text" id="login_username" name="login_username" required>
                </div>
                <div class="input-group">
                    <label for="login_password">Password</label>
                    <input type="password" id="login_password" name="login_password" required>
                </div>
                <button type="submit">Log In</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Handle POST requests after login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Handle Balance Update
    if ($action === 'updateBalance') {
        $userId = $_POST['userId'];
        $newBalance = (int)$_POST['balance'];
        
        foreach ($data as $key => $user) {
            if ($user['id'] === $userId) {
                $data[$key]['balance'] = $newBalance;
                break;
            }
        }
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        header("Location: admin.php");
        exit;
    }
    
    // Handle Withdrawal Completion
    if ($action === 'completeWithdrawal') {
        $userId = $_POST['userId'];
        $withdrawalId = $_POST['withdrawalId'];

        foreach ($data as $key => $user) {
            if ($user['id'] === $userId) {
                foreach ($user['withdrawalHistory'] as $wKey => $withdrawal) {
                    if ($withdrawal['id'] === $withdrawalId) {
                        $data[$key]['withdrawalHistory'][$wKey]['status'] = 'Completed';
                        break;
                    }
                }
                break;
            }
        }
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
        header("Location: admin.php");
        exit;
    }
    
    // Handle Password Reset
    if ($action === 'resetPassword') {
        $username = $_POST['username'];
        $newPassword = $_POST['newPassword'];
        
        foreach ($data as $key => $user) {
            if ($user['username'] === $username) {
                $data[$key]['transactionPassword'] = $newPassword;
                file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
                header("Location: admin.php?success=password_reset");
                exit;
            }
        }
        header("Location: admin.php?error=user_not_found");
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Sleek Mini App</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        :root {
            --bg-color: #121212;
            --sidebar-color: #1e1e1e;
            --card-color: #2c2c2c;
            --text-color: #f0f0f0;
            --secondary-text-color: #b0b0b0;
            --accent-color: #00d68f;
            --danger-color: #ff4d4f;
            --warning-color: #faad14;
            --border-color: #444;
            --link-hover-bg: #383838;
        }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
            display: flex;
            min-height: 100vh;
        }
        .sidebar {
            width: 250px;
            background-color: var(--sidebar-color);
            padding: 20px;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 100;
        }
        .sidebar h2 {
            text-align: center;
            color: var(--accent-color);
            margin-bottom: 30px;
        }
        .sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0;
            flex-grow: 1;
        }
        .sidebar li {
            margin-bottom: 10px;
        }
        .sidebar a {
            display: block;
            padding: 15px;
            color: var(--secondary-text-color);
            text-decoration: none;
            border-radius: 8px;
            transition: background-color 0.3s, color 0.3s;
        }
        .sidebar a:hover, .sidebar a.active {
            background-color: var(--link-hover-bg);
            color: var(--text-color);
        }
        .sidebar a i {
            margin-right: 10px;
        }
        .main-content {
            flex-grow: 1;
            padding: 30px;
            overflow-y: auto;
            margin-left: 250px; /* To account for fixed sidebar */
        }
        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        .dashboard-header h1 {
            margin: 0;
            color: #fff;
        }
        .dashboard-header .logout-button {
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            background-color: var(--danger-color);
            color: #fff;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .dashboard-header .logout-button:hover {
            background-color: #d63031;
        }
        .stat-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background-color: var(--card-color);
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 4px solid var(--accent-color);
        }
        .stat-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: var(--accent-color);
        }
        .stat-card .label {
            color: var(--secondary-text-color);
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .card {
            background-color: var(--card-color);
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            margin-bottom: 25px;
        }
        .card h3 {
            margin-top: 0;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .table-container {
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            white-space: nowrap;
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        th {
            color: var(--secondary-text-color);
            text-transform: uppercase;
            font-size: 0.9em;
        }
        tr:hover {
            background-color: #383838;
        }
        .status-badge {
            padding: 5px 10px;
            border-radius: 50px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .status-pending {
            background-color: var(--warning-color);
            color: #333;
        }
        .status-completed {
            background-color: var(--accent-color);
            color: #333;
        }
        .action-buttons button {
            background-color: var(--accent-color);
            border: none;
            color: #1a1a1a;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .action-buttons button.complete {
            background-color: var(--accent-color);
        }
        .action-buttons button.decline {
            background-color: var(--danger-color);
        }
        .action-buttons button:hover {
            opacity: 0.8;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.6);
            padding-top: 60px;
        }
        .modal-content {
            background-color: var(--card-color);
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 400px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        }
        .close-button {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close-button:hover, .close-button:focus {
            color: var(--text-color);
            text-decoration: none;
            cursor: pointer;
        }
        .modal-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }
        .modal-buttons button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .modal-buttons .submit {
            background-color: var(--accent-color);
            color: #1a1a1a;
        }
        .modal-buttons .cancel {
            background-color: var(--secondary-text-color);
            color: #1a1a1a;
        }
        
        @media (max-width: 768px) {
            body {
                flex-direction: column;
            }
            .sidebar {
                width: 100%;
                height: auto;
                padding: 10px;
                position: static;
                margin-left: 0;
                box-shadow: none;
            }
            .sidebar h2 {
                display: none;
            }
            .sidebar ul {
                display: flex;
                justify-content: space-around;
            }
            .sidebar li {
                margin-bottom: 0;
            }
            .sidebar a {
                padding: 10px;
                text-align: center;
            }
            .sidebar a span {
                display: none;
            }
            .main-content {
                padding: 20px;
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2>Admin Panel</h2>
        <ul>
            <li><a href="#" class="active" onclick="showSection('dashboard', this)"><i class="fas fa-tachometer-alt"></i> <span>Dashboard</span></a></li>
            <li><a href="#" onclick="showSection('users', this)"><i class="fas fa-users"></i> <span>Users</span></a></li>
            <li><a href="#" onclick="showSection('withdrawals', this)"><i class="fas fa-money-bill-wave"></i> <span>Withdrawals</span></a></li>
            <li><a href="#" onclick="showSection('password-reset', this)"><i class="fas fa-key"></i> <span>Password Reset</span></a></li>
            <li><a href="?logout"><i class="fas fa-sign-out-alt"></i> <span>Logout</span></a></li>
        </ul>
    </div>
    <div class="main-content">
        
        <div id="dashboard" class="content-section active">
            <div class="dashboard-header">
                <h1>Dashboard</h1>
            </div>
            <div class="stat-cards">
                <div class="stat-card" style="border-color: #00d68f;">
                    <div>
                        <div class="value" id="totalUsers">0</div>
                        <div class="label">Total Users</div>
                    </div>
                    <i class="fas fa-users" style="color: var(--secondary-text-color);"></i>
                </div>
                <div class="stat-card" style="border-color: #faad14;">
                    <div>
                        <div class="value" id="pendingWithdrawals">0</div>
                        <div class="label">Pending Withdrawals</div>
                    </div>
                    <i class="fas fa-hourglass-half" style="color: var(--secondary-text-color);"></i>
                </div>
                <div class="stat-card" style="border-color: #ff4d4f;">
                    <div>
                        <div class="value" id="totalBalance">0</div>
                        <div class="label">Total Balance (BDT)</div>
                    </div>
                    <i class="fas fa-coins" style="color: var(--secondary-text-color);"></i>
                </div>
            </div>

            <div class="card">
                <h3>Latest Withdrawal Requests</h3>
                <div class="table-container">
                    <table id="latestWithdrawalsTable">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Account</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                                $pendingWithdrawals = [];
                                foreach ($data as $user) {
                                    foreach ($user['withdrawalHistory'] as $withdrawal) {
                                        if ($withdrawal['status'] === 'Pending') {
                                            $pendingWithdrawals[] = ['user' => $user, 'withdrawal' => $withdrawal];
                                        }
                                    }
                                }
                                usort($pendingWithdrawals, function($a, $b) {
                                    return strtotime($b['withdrawal']['date']) - strtotime($a['withdrawal']['date']);
                                });

                                foreach ($pendingWithdrawals as $item) {
                                    $user = $item['user'];
                                    $withdrawal = $item['withdrawal'];
                                    echo "<tr>";
                                    echo "<td>{$user['nickname']}</td>";
                                    echo "<td>{$withdrawal['amount']} BDT</td>";
                                    echo "<td>{$withdrawal['method']}</td>";
                                    echo "<td>{$withdrawal['account']}</td>";
                                    echo "<td>{$withdrawal['date']}</td>";
                                    echo "<td>";
                                    echo "<form method='POST' style='display:inline;'>";
                                    echo "<input type='hidden' name='action' value='completeWithdrawal'>";
                                    echo "<input type='hidden' name='userId' value='{$user['id']}'>";
                                    echo "<input type='hidden' name='withdrawalId' value='{$withdrawal['id']}'>";
                                    echo "<button type='submit' class='action-buttons complete'>Complete</button>";
                                    echo "</form>";
                                    echo "</td>";
                                    echo "</tr>";
                                }
                            ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="users" class="content-section">
            <div class="dashboard-header">
                <h1>Users</h1>
            </div>
            <div class="card">
                <h3>All Users</h3>
                <div class="table-container">
                    <table id="usersTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Nickname</th>
                                <th>Phone</th>
                                <th>Balance (BDT)</th>
                                <th>Ads Watched</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($data as $user): ?>
                                <tr>
                                    <td><?php echo $user['id']; ?></td>
                                    <td><?php echo $user['username']; ?></td>
                                    <td><?php echo $user['nickname']; ?></td>
                                    <td><?php echo $user['phone']; ?></td>
                                    <td><?php echo $user['balance']; ?></td>
                                    <td><?php echo $user['tasks']['adsWatched']; ?></td>
                                    <td>
                                        <button onclick="showEditBalanceModal('<?php echo $user['id']; ?>', '<?php echo $user['nickname']; ?>', '<?php echo $user['balance']; ?>')">Edit Balance</button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div id="password-reset" class="content-section">
            <div class="dashboard-header">
                <h1>Password Reset</h1>
            </div>
            <div class="card">
                <form method="POST">
                    <input type="hidden" name="action" value="resetPassword">
                    <div class="input-group">
                        <label for="resetUsername">Username</label>
                        <input type="text" id="resetUsername" name="username" required>
                    </div>
                    <div class="input-group">
                        <label for="resetNewPassword">New Password</label>
                        <input type="text" id="resetNewPassword" name="newPassword" required>
                    </div>
                    <button type="submit" class="action-buttons complete">Reset Password</button>
                </form>
            </div>
        </div>


        <div id="withdrawals" class="content-section">
            <div class="dashboard-header">
                <h1>Withdrawals</h1>
            </div>
            <div class="card">
                <h3>All Withdrawal Requests</h3>
                <div class="table-container">
                    <table id="allWithdrawalsTable">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Account</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                                $allWithdrawals = [];
                                foreach ($data as $user) {
                                    foreach ($user['withdrawalHistory'] as $withdrawal) {
                                        $allWithdrawals[] = ['user' => $user, 'withdrawal' => $withdrawal];
                                    }
                                }
                                usort($allWithdrawals, function($a, $b) {
                                    return strtotime($b['withdrawal']['date']) - strtotime($a['withdrawal']['date']);
                                });

                                foreach ($allWithdrawals as $item) {
                                    $user = $item['user'];
                                    $withdrawal = $item['withdrawal'];
                                    $statusClass = $withdrawal['status'] === 'Pending' ? 'status-pending' : 'status-completed';
                                    $actionButton = ($withdrawal['status'] === 'Pending') ? "<form method='POST' style='display:inline;'><input type='hidden' name='action' value='completeWithdrawal'><input type='hidden' name='userId' value='{$user['id']}'><input type='hidden' name='withdrawalId' value='{$withdrawal['id']}'><button type='submit' class='action-buttons complete'>Complete</button></form>" : "-";
                                    echo "<tr>";
                                    echo "<td>{$user['nickname']}</td>";
                                    echo "<td>{$withdrawal['amount']} BDT</td>";
                                    echo "<td>{$withdrawal['method']}</td>";
                                    echo "<td>{$withdrawal['account']}</td>";
                                    echo "<td><span class='status-badge {$statusClass}'>{$withdrawal['status']}</span></td>";
                                    echo "<td>{$withdrawal['date']}</td>";
                                    echo "<td>{$actionButton}</td>";
                                    echo "</tr>";
                                }
                            ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div id="editBalanceModal" class="modal">
        <div class="modal-content">
            <span class="close-button" onclick="closeModal()">&times;</span>
            <h3>Edit Balance for <span id="modalUsername"></span></h3>
            <form id="editBalanceForm" method="POST">
                <input type="hidden" name="action" value="updateBalance">
                <input type="hidden" id="modalUserId" name="userId">
                <div class="input-group">
                    <label for="newBalance">New Balance (BDT)</label>
                    <input type="number" id="newBalance" name="balance" required>
                </div>
                <div class="modal-buttons">
                    <button type="button" class="cancel" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="submit">Save</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        function showSection(sectionId, element) {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
            
            document.querySelectorAll('.sidebar a').forEach(nav => {
                nav.classList.remove('active');
            });
            element.classList.add('active');
        }

        function showEditBalanceModal(userId, username, balance) {
            document.getElementById('modalUsername').textContent = username;
            document.getElementById('modalUserId').value = userId;
            document.getElementById('newBalance').value = balance;
            document.getElementById('editBalanceModal').style.display = 'block';
        }

        function closeModal() {
            document.getElementById('editBalanceModal').style.display = 'none';
        }

        // Dashboard stats calculation using PHP data
        document.addEventListener('DOMContentLoaded', () => {
            const users = <?php echo json_encode($data); ?>;
            const totalUsers = users.length;
            const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
            const pendingWithdrawals = users.flatMap(user => user.withdrawalHistory || []).filter(w => w.status === 'Pending').length;

            document.getElementById('totalUsers').textContent = totalUsers;
            document.getElementById('totalBalance').textContent = totalBalance.toLocaleString();
            document.getElementById('pendingWithdrawals').textContent = pendingWithdrawals;

            // This part handles the initial view
            const currentSection = window.location.hash.substring(1) || 'dashboard';
            const navItem = document.querySelector(`.sidebar a[onclick*="${currentSection}"]`);
            if (navItem) {
                showSection(currentSection, navItem);
            } else {
                showSection('dashboard', document.querySelector('.sidebar a.active'));
            }
            
            // Check for URL parameters after password reset
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('success') === 'password_reset') {
                alert('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।');
                history.replaceState({}, document.title, window.location.pathname);
            } else if (urlParams.get('error') === 'user_not_found') {
                alert('এই ইউজারনেম দিয়ে কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।');
                history.replaceState({}, document.title, window.location.pathname);
            }
        });
    </script>
</body>
</html>
