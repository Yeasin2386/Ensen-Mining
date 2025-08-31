// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDmJ8wsK6sYlRX2DWYTFmxwZONCL9nsmos",
    authDomain: "ensen-mining-bd-4882b.firebaseapp.com",
    databaseURL: "https://ensen-mining-bd-4882b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ensen-mining-bd-4882b",
    storageBucket: "ensen-mining-bd-4882b.firebasestorage.app",
    messagingSenderId: "1006758844776",
    appId: "1:1006758844776:web:df590613a79e1e9eed1edd",
    measurementId: "G-8YKDVM1W8B"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const firestore = firebase.firestore();

// IMPORTANT: This user ID should come from your login/authentication system.
// For now, we'll use a hardcoded ID for demonstration.
const userId = 'user_001';

document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const userBalanceEl = document.getElementById('user-balance');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Home tab buttons
    const homeWithdrawBtn = document.getElementById('home-withdraw-btn');
    const historyBtn = document.getElementById('history-btn');
    const dailyVideoBtn = document.getElementById('watch-video-btn');
    const dailyWebsiteBtn = document.getElementById('visit-website-btn');
    
    // All tasks tab buttons
    const allVideoBtn = document.getElementById('watch-video-btn-all');
    const allWebsiteBtn = document.getElementById('visit-website-btn-all');
    const submitWithdrawBtn = document.getElementById('submit-withdraw-btn');

    const messageModal = document.getElementById('message-modal');
    const messageTitleEl = document.getElementById('message-title');
    const messageTextEl = document.getElementById('message-text');
    const messageOkBtn = document.getElementById('message-ok-btn');

    const tasksCompletedEl = document.getElementById('tasks-completed');
    const tasksRemainingEl = document.getElementById('tasks-remaining');
    
    // Settings menu buttons
    const mailIcon = document.getElementById('mail-icon');
    const settingsWithdrawBtn = document.getElementById('settings-withdraw-btn');
    const settingsMailBtn = document.getElementById('settings-mail-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

    // Referral elements
    const copyReferralBtn = document.getElementById('copy-referral-btn');
    const referralLinkDisplay = document.getElementById('referral-link-display');
    const copyConfirmModal = document.getElementById('copy-confirm-modal');
    const copyConfirmOkBtn = document.getElementById('copy-confirm-ok-btn');

    // Profile elements
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    // Referral Stats
    const totalReferralsEl = document.querySelector('.referral-stats .stat-box:nth-child(1) .stat-value');
    const activeReferralsEl = document.querySelector('.referral-stats .stat-box:nth-child(2) .stat-value');
    const totalEarningsEl = document.querySelector('.referral-stats .stat-box:nth-child(3) .stat-value');
    const pendingBonusEl = document.querySelector('.referral-stats .stat-box:nth-child(4) .stat-value');

    const dailyTaskLimit = 5;
    const allTaskLimit = 40; 
    let tasksCompletedToday = {}; 

    let userRef = db.ref('users/' + userId);
    let firestoreUsersRef = firestore.collection('users');
    let firestoreWithdrawalsRef = firestore.collection('withdrawals');

    // Load all user data from Firebase and update UI
    userRef.on('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            // Update Balance
            userBalanceEl.textContent = `৳ ${userData.balance.toFixed(2)}`;

            // Update Profile
            if (fullNameInput) fullNameInput.value = userData.fullName || 'N/A';
            if (emailInput) emailInput.value = userData.email || 'N/A';
            if (phoneInput) phoneInput.value = userData.phone || 'N/A';

            // Update Referral Stats
            if (totalReferralsEl) totalReferralsEl.textContent = userData.referrals?.total || 0;
            if (activeReferralsEl) activeReferralsEl.textContent = userData.referrals?.active || 0;
            if (totalEarningsEl) totalEarningsEl.textContent = `৳${userData.referrals?.earnings || 0}`;
            if (pendingBonusEl) pendingBonusEl.textContent = `৳${userData.referrals?.pending || 0}`;

            // Update Task counts
            tasksCompletedToday = userData.tasks || {
                'dailyVideo': 0,
                'dailyWebsite': 0,
                'allVideo': 0,
                'allWebsite': 0
            };
            updateAllTaskCounter();
        } else {
            // Initialize new user data if it doesn't exist
            // This is where you would set default values for a new user after registration
            userRef.set({
                balance: 0,
                fullName: 'Md. Exmaple Name', // This should come from registration form
                email: 'example@email.com',  // This should come from registration form
                phone: '01700000000',        // This should come from registration form
                referrals: {
                    total: 0,
                    active: 0,
                    earnings: 0,
                    pending: 0
                },
                tasks: {
                    'dailyVideo': 0,
                    'dailyWebsite': 0,
                    'allVideo': 0,
                    'allWebsite': 0
                }
            });
            userBalanceEl.textContent = `৳ 0.00`;
            updateAllTaskCounter();
        }
    });

    function updateBalance(amount) {
        userRef.child('balance').transaction((currentBalance) => {
            return (currentBalance || 0) + amount;
        });
    }

    function updateTaskCount(taskType) {
        const taskRef = userRef.child('tasks').child(taskType);
        taskRef.transaction((currentCount) => {
            return (currentCount || 0) + 1;
        });
    }

    function showPopup(title, message, onOk) {
        messageTitleEl.textContent = title;
        messageTextEl.textContent = message;
        messageModal.style.display = 'flex';
        currentActionOk = onOk;
    }

    messageOkBtn.addEventListener('click', () => {
        messageModal.style.display = 'none';
        if (currentActionOk) {
            currentActionOk();
            currentActionOk = null;
        }
    });

    function switchTab(tabId) {
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            }
        });

        if (tabId !== 'settings-tab') {
            showSettingsPage('settings-menu');
        }
    }
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Referral Copy button functionality
    if (copyReferralBtn) {
        copyReferralBtn.addEventListener('click', function() {
            const referralLink = referralLinkDisplay.textContent;
            navigator.clipboard.writeText(referralLink).then(() => {
                copyConfirmModal.style.display = 'flex';
            }).catch(err => {
                console.error('Failed to copy referral link: ', err);
                showPopup('Error', 'Failed to copy link. Please try again.');
            });
        });
    }

    copyConfirmOkBtn.addEventListener('click', () => {
        copyConfirmModal.style.display = 'none';
    });


    function updateAllTaskCounter() {
        const totalCompleted = tasksCompletedToday.allVideo + tasksCompletedToday.allWebsite;
        tasksCompletedEl.textContent = totalCompleted;
        tasksRemainingEl.textContent = allTaskLimit - totalCompleted;

        if (totalCompleted >= allTaskLimit) {
            allVideoBtn.disabled = true;
            allWebsiteBtn.disabled = true;
            allVideoBtn.textContent = 'Completed';
            allWebsiteBtn.textContent = 'Completed';
        } else {
            allVideoBtn.disabled = false;
            allWebsiteBtn.disabled = false;
            allVideoBtn.textContent = '+৳25';
            allWebsiteBtn.textContent = '+৳25';
        }
    }

    // Handle History Button
    historyBtn.addEventListener('click', () => {
        window.location.href = 'history.html';
    });

    // Handle clicks for Daily Tasks
    dailyVideoBtn.addEventListener('click', () => {
        if (tasksCompletedToday.dailyVideo >= dailyTaskLimit) {
            showPopup('দৈনিক সীমা অতিক্রম হয়েছে', 'আজকের জন্য আপনার ভিডিও দেখার দৈনিক সীমা অতিক্রম হয়েছে।');
            return;
        }

        loadingSpinner.style.display = 'flex';
        show_9716498().then(() => { 
            loadingSpinner.style.display = 'none';
            updateBalance(5);
            updateTaskCount('dailyVideo');
            showPopup('টাস্ক সম্পন্ন হয়েছে', 'অভিনন্দন! আপনার অ্যাকাউন্টে ৳5 যোগ করা হয়েছে।');
        }).catch(e => {
            loadingSpinner.style.display = 'none';
            showPopup('বিজ্ঞাপন ত্রুটি', 'বিজ্ঞাপন লোড করা যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।');
        });
    });

    dailyWebsiteBtn.addEventListener('click', () => {
        if (tasksCompletedToday.dailyWebsite >= dailyTaskLimit) {
            showPopup('দৈনিক সীমা অতিক্রম হয়েছে', 'আজকের জন্য আপনার ওয়েবসাইট ভিজিটের দৈনিক সীমা অতিক্রম হয়েছে।');
            return;
        }

        const smartlink = 'https://viaanswerwillow.com/zcj9ncamas?key=6836bdc985e54703a11582786d62f2a5';
        showPopup('ওয়েবসাইট ভিজিট করুন', 'টাকা পেতে অনুগ্রহ করে "OK" ক্লিক করে ওয়েবসাইটটি ভিজিট করুন এবং ১৫ সেকেন্ড অপেক্ষা করুন।', () => {
            window.open(smartlink, '_blank');
            setTimeout(() => {
                updateBalance(3);
                updateTaskCount('dailyWebsite');
                showPopup('টাস্ক সম্পন্ন হয়েছে', 'অভিনন্দন! আপনার অ্যাকাউন্টে ৳3 যোগ করা হয়েছে।');
            }, 10000); 
        });
    });

    // Handle clicks for All Tasks
    allVideoBtn.addEventListener('click', () => {
        const currentCompleted = tasksCompletedToday.allVideo + tasksCompletedToday.allWebsite;
        if (currentCompleted >= allTaskLimit) {
            showPopup('দৈনিক সীমা অতিক্রম হয়েছে', 'আজকের জন্য আপনি সব 40টি টাস্ক সম্পন্ন করেছেন।');
            return;
        }

        loadingSpinner.style.display = 'flex';
        show_9716498().then(() => { 
            loadingSpinner.style.display = 'none';
            updateBalance(25);
            updateTaskCount('allVideo');
            updateAllTaskCounter();
            showPopup('টাস্ক সম্পন্ন হয়েছে', 'অভিনন্দন! আপনার অ্যাকাউন্টে ৳25 যোগ করা হয়েছে।');
        }).catch(e => {
            loadingSpinner.style.display = 'none';
            showPopup('বিজ্ঞাপন ত্রুটি', 'বিজ্ঞাপন লোড করা যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।');
        });
    });

    allWebsiteBtn.addEventListener('click', () => {
        const currentCompleted = tasksCompletedToday.allVideo + tasksCompletedToday.allWebsite;
        if (currentCompleted >= allTaskLimit) {
            showPopup('দৈনিক সীমা অতিক্রম হয়েছে', 'আজকের জন্য আপনি সব 40টি টাস্ক সম্পন্ন করেছেন।');
            return;
        }

        const smartlink = 'https://viaanswerwillow.com/zcj9ncamas?key=6836bdc985e54703a11582786d62f2a5';
        showPopup('ওয়েবসাইট ভিজিট করুন', 'টাকা পেতে অনুগ্রহ করে "OK" ক্লিক করে ওয়েবসাইটটি ভিজিট করুন এবং ১৫ সেকেন্ড অপেক্ষা করুন।', () => {
            window.open(smartlink, '_blank');
            setTimeout(() => {
                updateBalance(25);
                updateTaskCount('allWebsite');
                updateAllTaskCounter();
                showPopup('টাস্ক সম্পন্ন হয়েছে', 'অভিনন্দন! আপনার অ্যাকাউন্টে ৳25 যোগ করা হয়েছে।');
            }, 10000); 
        });
    });

    // Handle Withdraw Request
    submitWithdrawBtn.addEventListener('click', () => {
        const withdrawAmount = document.getElementById('withdraw-amount').value;
        const accountNumber = document.getElementById('account-number').value;
        const selectedMethod = document.querySelector('.withdraw-method.selected').dataset.method;
        const balance = parseFloat(userBalanceEl.textContent.replace('৳ ', ''));

        if (!withdrawAmount || !accountNumber) {
            showPopup('ত্রুটি', 'দয়া করে পরিমাণ এবং অ্যাকাউন্ট নম্বর লিখুন।');
            return;
        }
        if (parseFloat(withdrawAmount) > balance) {
            showPopup('ব্যালেন্স অপর্যাপ্ত', 'আপনার অ্যাকাউন্টে যথেষ্ট ব্যালেন্স নেই।');
            return;
        }
        if (parseFloat(withdrawAmount) < 100) {
            showPopup('কম পরিমাণ', 'সর্বনিম্ন উইথড্রয়াল পরিমাণ ৳100।');
            return;
        }

        // Add to Firestore
        firestoreWithdrawalsRef.add({
            userId: userId,
            amount: parseFloat(withdrawAmount),
            method: selectedMethod,
            accountNumber: accountNumber,
            status: 'Pending',
            date: new Date().toISOString()
        }).then(() => {
            // Deduct from balance in Realtime Database
            updateBalance(-parseFloat(withdrawAmount));
            showPopup('অনুরোধ পাঠানো হয়েছে', 'আপনার উইথড্রয়াল রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে।');
        }).catch(error => {
            console.error("Error adding withdrawal request: ", error);
            showPopup('ত্রুটি', 'উইথড্রয়াল রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        });
    });

    // --- Logout Logic ---
    logoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'flex';
    });

    cancelLogoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });

    confirmLogoutBtn.addEventListener('click', () => {
        // Clear local data if any
        localStorage.clear();
        // Redirect to login page
        window.location.href = 'login.html'; 
    });

    // --- Existing JavaScript for Settings Tab ---
    const settingsItems = document.querySelectorAll('.settings-item[data-target]');
    const backButtons = document.querySelectorAll('.back-btn');
    const settingsPages = document.querySelectorAll('.settings-page');

    function showSettingsPage(pageId) {
        settingsPages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    settingsItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPageId = item.getAttribute('data-target');
            showSettingsPage(targetPageId);
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            showSettingsPage('settings-menu');
        });
    });

    mailIcon.addEventListener('click', () => {
        switchTab('settings-tab');
        showSettingsPage('mail-page');
    });

    homeWithdrawBtn.addEventListener('click', () => {
        switchTab('settings-tab');
        showSettingsPage('withdraw-page');
    });

    settingsWithdrawBtn.addEventListener('click', () => {
        showSettingsPage('withdraw-page');
    });

    settingsMailBtn.addEventListener('click', () => {
        showSettingsPage('mail-page');
    });

    // Withdraw method selection
    const withdrawMethods = document.querySelectorAll('.withdraw-method');
    const accountNumberInput = document.getElementById('account-number');
    withdrawMethods.forEach(method => {
        method.addEventListener('click', () => {
            withdrawMethods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            if (method.dataset.method === 'bkash') {
                accountNumberInput.placeholder = "e.g., 01700000000 (Bkash Number)";
            } else {
                accountNumberInput.placeholder = "e.g., Your Binance Pay ID or Address";
            }
        });
    });
});
