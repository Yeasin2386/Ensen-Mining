// Demo User Data
const userData = {
    balance: 150.75,
    todayEarnings: 25.50,
    totalEarnings: 345.90,
    dailyTasksCompleted: 15,
    dailyTaskLimit: 25,
    totalReferrals: 10,
    referralEarnings: 100.00,
    profileName: "ইউজার নেম",
    profileEmail: "user@example.com",
};

// Update UI
function updateUI() {
    document.getElementById('user-balance').innerHTML = `<i class="fa-solid fa-bangladeshi-taka-sign"></i> ${userData.balance.toFixed(2)}`;
    document.getElementById('today-earnings').innerHTML = `<i class="fa-solid fa-bangladeshi-taka-sign"></i>${userData.todayEarnings.toFixed(2)}`;
    document.getElementById('total-earnings').innerHTML = `<i class="fa-solid fa-bangladeshi-taka-sign"></i>${userData.totalEarnings.toFixed(2)}`;
    document.getElementById('daily-tasks').textContent = `${userData.dailyTasksCompleted}/${userData.dailyTaskLimit}`;
    document.getElementById('total-referrals-ref').textContent = userData.totalReferrals;
    document.getElementById('referral-earnings').innerHTML = `<i class="fa-solid fa-bangladeshi-taka-sign"></i>${userData.referralEarnings.toFixed(2)}`;
    document.getElementById('profile-name').textContent = userData.profileName;
    document.getElementById('profile-email').textContent = userData.profileEmail;
}

// Page switching
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    pages.forEach(page => page.classList.remove('active'));
    if(document.getElementById(pageId)) document.getElementById(pageId).classList.add('active');
    navItems.forEach(item => item.classList.remove('active'));
    const nav = document.querySelector(`.nav-item[data-page="${pageId.replace('-page', '')}"]`);
    if(nav) nav.classList.add('active');
}
document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = `${item.getAttribute('data-page')}-page`;
        showPage(pageId);
        document.getElementById('withdraw-history-section').style.display = "none";
    });
});

// Copy Referral Link
const copyBtn = document.getElementById('copy-btn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const referralLink = document.getElementById('referral-link');
        referralLink.select();
        referralLink.setSelectionRange(0, 99999);
        document.execCommand('copy');
        showCustomPopup({
            title: "কপি করা হয়েছে",
            message: `<span style="color:#b9a9ff;">রেফারেল লিংক কপি করা হয়েছে!</span>`,
            icon: `<i class="fa-solid fa-copy"></i>`
        });
    });
}
// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        showCustomPopup({
            title: "লগআউট",
            message: `<span style="color:#b9a9ff;">আপনি সফলভাবে লগআউট করেছেন।<br>(এটি শুধুই ডেমো!)</span>`,
            icon: `<i class="fa-solid fa-sign-out-alt"></i>`
        });
    });
}

// Daily Task Popup (home page)
document.getElementById("dailyTaskStartBtn").addEventListener("click", function(){
    showCustomPopup({
        title: "আজকের ভিডিও টাস্ক",
        amount: "৳5.00",
        icon: `<i class="fa-solid fa-video"></i>`,
        message: `
            <ul style="text-align:left; margin: 0 auto 14px 20px; color:#e0e0ef; font-size:16px;">
                <li>সম্পূর্ণ ভিডিও দেখুন।</li>
                <li>ভিডিও দেখার পর ডান পাশে ক্রস (✖) চিহ্নে ক্লিক করুন।</li>
                <li>তারপরই আপনার একাউন্টে টাকা যোগ হবে।</li>
                <li>স্কিপ করলে কোনো টাকা পাবেন না।</li>
            </ul>
        `,
        onOK: function() {
            // শুধুমাত্র ঠিক আছে বাটনে ক্লিক করলেই বিজ্ঞাপন চালু হবে
            show_9716498().then(() => {
                // ভিডিও দেখার পর টাকা যোগ হবে
                userData.balance += 5;
                userData.todayEarnings += 5;
                userData.totalEarnings += 5;
                userData.dailyTasksCompleted += 1;
                updateUI();
                showCustomPopup({
                    title: "অভিনন্দন!",
                    message: `<span style="color: #b9a9ff;">আপনি ভিডিও টাস্ক সফলভাবে কমপ্লিট করেছেন এবং <span style="font-size:20px;font-weight:800;color:#ffd700;"><i class="fa-solid fa-bangladeshi-taka-sign"></i> 5.00</span> অর্জন করেছেন!</span>`,
                    icon: `<i class="fa-solid fa-check-circle"></i>`
                });
            });
        }
    });
});


// All Tasks Page: Task Popup
document.querySelectorAll('.start-task-btn[data-task]').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-task');
        const amount = btn.getAttribute('data-amount') || (type === "watch-video" ? "5.00" : "3.00");
        let popupObj = {};
        if(type === 'watch-video') {
            popupObj = {
                title: "ভিডিও টাস্ক",
                amount: `৳${amount}`,
                icon: `<i class="fa-solid fa-video"></i>`,
                message: `
                    <ul style="text-align:left; margin: 0 auto 14px 20px; color:#e0e0ef; font-size:16px;">
                        <li>সম্পূর্ণ ভিডিও দেখুন।</li>
                        <li>ভিডিও দেখার পর ডান পাশে ক্রস (✖) চিহ্নে ক্লিক করুন।</li>
                        <li>তারপরই আপনার একাউন্টে টাকা যোগ হবে।</li>
                        <li>স্কিপ করলে কোনো টাকা পাবেন না।</li>
                    </ul>
                `,
                onOK: function() {
                    // শুধুমাত্র ঠিক আছে বাটনে ক্লিক করলেই বিজ্ঞাপন চালু হবে
                    show_9716498().then(() => {
                        userData.balance += 5;
                        userData.todayEarnings += 5;
                        userData.totalEarnings += 5;
                        userData.dailyTasksCompleted += 1;
                        updateUI();
                        showCustomPopup({
                            title: "অভিনন্দন!",
                            message: `<span style="color: #b9a9ff;">আপনি ভিডিও টাস্ক সফলভাবে কমপ্লিট করেছেন এবং <span style="font-size:20px;font-weight:800;color:#ffd700;"><i class="fa-solid fa-bangladeshi-taka-sign"></i> 5.00</span> অর্জন করেছেন!</span>`,
                            icon: `<i class="fa-solid fa-check-circle"></i>`
                        });
                    });
                }
            };
        } else if(type === 'visit-website') {
            popupObj = {
                title: "ওয়েবসাইট ভিজিট টাস্ক",
                amount: `৳${amount}`,
                icon: `<i class="fa-solid fa-globe"></i>`,
                message: `
                    <ul style="text-align:left; margin: 0 auto 14px 20px; color:#e0e0ef; font-size:16px;">
                        <li>ওয়েবসাইটে কমপক্ষে ৮-১০ সেকেন্ড থাকুন।</li>
                        <li>এত সময় না থাকলে কোনো টাকা পাবেন না।</li>
                        <li>সিস্টেম সন্দেহজনক অ্যাক্টিভিটি ধরতে পারলে টাকা কেটে নিতে পারে।</li>
                        <li>নিয়ম ভাঙলে একাউন্ট ব্যান হতে পারে।</li>
                    </ul>
                `,
                onOK: function() {
                    // Adsterra স্মার্ট লিংকটি এখানে যোগ করা হয়েছে
                    window.open('https://trainerunpleasantrite.com/zcj9ncamas?key=6836bdc985e54703a11582786d62f2a5', '_blank');
                    
                    // এখানে একটি বিলম্ব (delay) যুক্ত করা হয়েছে যাতে ব্যবহারকারী ওয়েবসাইট ভিজিট করে ফিরে আসার পর টাকা পায়
                    setTimeout(() => {
                        userData.balance += 3;
                        userData.todayEarnings += 3;
                        userData.totalEarnings += 3;
                        userData.dailyTasksCompleted += 1;
                        updateUI();
                        showCustomPopup({
                            title: "অভিনন্দন!",
                            message: `<span style="color: #b9a9ff;">আপনি ওয়েবসাইট ভিজিট টাস্ক সফলভাবে কমপ্লিট করেছেন এবং <span style="font-size:20px;font-weight:800;color:#ffd700;"><i class="fa-solid fa-bangladeshi-taka-sign"></i> 3.00</span> অর্জন করেছেন!</span>`,
                            icon: `<i class="fa-solid fa-check-circle"></i>`
                        });
                    }, 10000); // 10 সেকেন্ডের বিলম্ব
                }
            };
        }
        showCustomPopup(popupObj);
    });
});

// Withdraw Modal Functions
function openWithdrawModal() {
  document.getElementById('withdraw-modal').style.display = 'flex';
}
function closeWithdrawModal() {
  document.getElementById('withdraw-modal').style.display = 'none';
}
function showWithdrawHelp() {
    showCustomPopup({
        title: "উইথড্র করার নিয়ম",
        message: `
            <span style="color:#b9a9ff;display:block;margin-bottom:7px;">
                <b>সর্বনিম্ন ১০০ টাকা, সর্বোচ্চ ৫০০০ টাকা</b>
            </span>
            <ul style="text-align:left; margin: 0 auto 12px 30px; color:#e0e0ef; font-size:15px;">
              <li>বিকাশ/নগদ নাম্বার সঠিকভাবে দিন</li>
              <li>ভুল তথ্য দিলে পেমেন্ট হবে না</li>
            </ul>
            <span style="color:#e0d2ff;font-size:15px;"><b>সমস্যা হলে Admin-এর সাথে যোগাযোগ করুন।</b></span>
        `,
        icon: `<i class="fa-solid fa-wallet"></i>`
    });
}
function showPasswordHelp() {
    showCustomPopup({
        title: "পাসওয়ার্ড চেঞ্জের নিয়ম",
        message: `
            <ul style="text-align:left; margin: 0 auto 12px 30px; color:#e0e0ef; font-size:15px;">
              <li>পুরাতন পাসওয়ার্ড দিন</li>
              <li>নতুন পাসওয়ার্ড ৬ অক্ষরের বেশি হতে হবে</li>
              <li>দুইবার একই নতুন পাসওয়ার্ড দিন</li>
            </ul>
            <span style="color:#e0d2ff;font-size:15px;"><b>ভুলে গেলে বা সমস্যা হলে, Admin-এর সাথে যোগাযোগ করুন।</b></span>
        `,
        icon: `<i class="fa-solid fa-key"></i>`
    });
}
function submitWithdraw(e) {
  e.preventDefault();
  const amount = parseInt(document.getElementById('withdraw-amount').value, 10);
  const method = document.getElementById('withdraw-method').value;
  const number = document.getElementById('withdraw-number').value.trim();
  if(amount < 100 || amount > 5000) {
    showCustomPopup({
        title: "ত্রুটি",
        message: `<span style="color:#ffb3b3;">উইথড্র এমাউন্ট সর্বনিম্ন ১০০, সর্বোচ্চ ৫০০০ টাকা হতে হবে!</span>`,
        icon: `<i class="fa-solid fa-circle-exclamation"></i>`
    });
    return;
  }
  if(!/^(01[0-9]{9})$/.test(number)) {
    showCustomPopup({
        title: "ত্রুটি",
        message: `<span style="color:#ffb3b3;">সঠিক ১১ ডিজিট মোবাইল নাম্বার দিন!</span>`,
        icon: `<i class="fa-solid fa-circle-exclamation"></i>`
    });
    return;
  }
  const w = {
    id: Date.now(),
    amount,
    method,
    number,
    time: new Date().toLocaleString('bn-BD'),
    status: "Pending"
  };
  let history = JSON.parse(localStorage.getItem("withdrawHistory")||"[]");
  history.unshift(w);
  localStorage.setItem("withdrawHistory", JSON.stringify(history));
  showCustomPopup({
    title: "উইথড্র সাবমিট হয়েছে",
    message: `<span style="color:#b9a9ff;">আপনার উইথড্র রিকোয়েস্ট জমা হয়েছে। এডমিন রিভিউ করার পর স্ট্যাটাস আপডেট হবে।</span>`,
    icon: `<i class="fa-solid fa-check-circle"></i>`
  });
  closeWithdrawModal();
  document.getElementById('withdrawForm').reset();
  renderWithdrawHistory();
}
function renderWithdrawHistory() {
  const list = document.getElementById('withdraw-history-list');
  let history = JSON.parse(localStorage.getItem("withdrawHistory")||"[]");
  if(!history.length) {
    list.innerHTML = "<div style='color:#a18aff;text-align:center;padding:20px;'>এখনো কোন উইথড্র রিকোয়েস্ট নেই।</div>";
    return;
  }
  let html = `<table>
    <thead>
      <tr>
        <th>তারিখ</th>
        <th>অ্যামাউন্ট</th>
        <th>মেথড</th>
        <th>নাম্বার</th>
        <th>স্ট্যাটাস</th>
      </tr>
    </thead>
    <tbody>`;
  history.forEach(w => {
    let statusColor = w.status==="Complete" ? "#2ecc71" : w.status==="Rejected" ? "#e74c3c" : "#b9a9ff";
    html += `<tr>
      <td>${w.time}</td>
      <td><i class="fa-solid fa-bangladeshi-taka-sign"></i> ${w.amount}</td>
      <td>${w.method}</td>
      <td>${w.number}</td>
      <td style="color:${statusColor};font-weight:700;">${w.status}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  list.innerHTML = html;
}
function openWithdrawHistory() {
    showPage("withdraw-history-section");
    document.getElementById('withdraw-history-section').style.display = "block";
    renderWithdrawHistory();
}
function closeWithdrawHistory() {
    document.getElementById('withdraw-history-section').style.display = "none";
    showPage("settings-page");
}
function openPasswordModal() {
  document.getElementById('password-modal').style.display = 'flex';
}
function closePasswordModal() {
  document.getElementById('password-modal').style.display = 'none';
}
function submitPasswordChange(e) {
  e.preventDefault();
  const oldPass = document.getElementById('old-password').value;
  const newPass = document.getElementById('new-password').value;
  const confirmPass = document.getElementById('confirm-password').value;
  if(oldPass !== "123456") {
    showCustomPopup({
        title: "ত্রুটি",
        message: `<span style="color:#ffb3b3;">পুরাতন পাসওয়ার্ড ভুল!</span>`,
        icon: `<i class="fa-solid fa-circle-exclamation"></i>`
    });
    return;
  }
  if(newPass.length < 6) {
    showCustomPopup({
        title: "ত্রুটি",
        message: `<span style="color:#ffb3b3;">নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!</span>`,
        icon: `<i class="fa-solid fa-circle-exclamation"></i>`
    });
    return;
  }
  if(newPass !== confirmPass) {
    showCustomPopup({
        title: "ত্রুটি",
        message: `<span style="color:#ffb3b3;">নতুন পাসওয়ার্ড দুইবার একই দিতে হবে!</span>`,
        icon: `<i class="fa-solid fa-circle-exclamation"></i>`
    });
    return;
  }
  showCustomPopup({
    title: "সফল",
    message: `<span style="color:#b9a9ff;">পাসওয়ার্ড সফলভাবে চেঞ্জ হয়েছে।</span>`,
    icon: `<i class="fa-solid fa-check-circle"></i>`
  });
  closePasswordModal();
  document.getElementById('passwordChangeForm').reset();
}

// Settings Actions
document.getElementById('withdraw-btn').addEventListener('click', openWithdrawModal);
document.getElementById('change-pass-btn').addEventListener('click', openPasswordModal);
document.getElementById('withdraw-history-btn').addEventListener('click', openWithdrawHistory);

// Admin Contact Button (Already has link in <a>, optional: analytics)
document.getElementById('admin-contact-btn')?.addEventListener('click', function(e) {
    // Analytics or custom behavior if needed
});

// Popup functions (custom)
let popupOnOK = null; // Changed from popupOnClose
function showCustomPopup({title, message, icon, amount, onClose, onOK}) { // Added onOK to params
    document.getElementById("custom-popup-title").textContent = title || "";
    if (amount) {
        document.getElementById("custom-popup-amount").textContent = amount;
        document.querySelector(".custom-popup-box").classList.add("show-amount");
    } else {
        document.getElementById("custom-popup-amount").textContent = "";
        document.querySelector(".custom-popup-box").classList.remove("show-amount");
    }
    document.getElementById("custom-popup-message").innerHTML = message || "";
    document.getElementById("custom-popup-icon").innerHTML = icon || "";
    document.getElementById("custom-popup-overlay").classList.add("active");
    
    // Add event listener for the OK button
    document.querySelector(".popup-ok-btn").onclick = function() {
        closeCustomPopup();
        if (typeof onOK === "function") {
            setTimeout(onOK, 10);
        }
    };
    
    // Event listener for the close button
    document.querySelector(".custom-popup-close").onclick = function() {
        closeCustomPopup();
        if (typeof onClose === "function") {
            setTimeout(onClose, 10);
        }
    };
    
    // Original onClose logic kept for backwards compatibility if needed
    popupOnOK = typeof onOK === "function" ? onOK : null;
}

function closeCustomPopup() {
    document.getElementById("custom-popup-overlay").classList.remove("active");
}

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    showPage('home-page');
    renderWithdrawHistory();
});
