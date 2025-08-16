<?php
$file = 'users.json';
$data = json_decode(file_get_contents($file), true) ?? [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
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
            background-color: var(--card-color);
            color: var(--text-color);
        }
        .sidebar a i {
            margin-right: 10px;
        }
        .main-content {
            flex-grow: 1;
            padding: 30px;
            overflow-y: auto;
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
        .stat-card i {
            font-size: 2.5em;
            color: var(--border-color);
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
        }
        .modal-content {
            background-color: var(--card-color);
            margin: 15% auto;
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
            color: var(--button-text-color);
        }
        .modal-buttons .cancel {
            background-color: var(--secondary-text-color);
            color: var(--button-text-color);
        }
        
        @media (max-width: 768px) {
            body {
                flex-direction: column;
            }
            .sidebar {
                width: 100%;
                height: auto;
                padding: 10px;
            }
            .sidebar h2 {
                display: none;
            }
            .sidebar ul {
                display: flex;
                justify-content: space-around;
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
                    <i class="fas fa-users" style="color: #333;"></i>
                </div>
                <div class="stat-card" style="border-color: #faad14;">
                    <div>
                        <div class="value" id="pendingWithdrawals">0</div>
                        <div class="label">Pending Withdrawals</div>
                    </div>
                    <i class="fas fa-hourglass-half" style="color: #333;"></i>
                </div>
                <div class="stat-card" style="border-color: #ff4d4f;">
                    <div>
                        <div class="value" id="totalBalance">0</div>
                        <div class="label">Total Balance (BDT)</div>
                    </div>
                    <i class="fas fa-coins" style="color: #333;"></i>
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
                                    echo "<button type='submit' class='complete'>Complete</button>";
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
                                    $actionButton = ($withdrawal['status'] === 'Pending') ? "<form method='POST' style='display:inline;'><input type='hidden' name='action' value='completeWithdrawal'><input type='hidden' name='userId' value='{$user['id']}'><input type='hidden' name='withdrawalId' value='{$withdrawal['id']}'><button type='submit' class='complete'>Complete</button></form>" : "-";
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
            const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
            const pendingWithdrawals = users.flatMap(user => user.withdrawalHistory).filter(w => w.status === 'Pending').length;

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
        });
    </script>
</body>
</html>
