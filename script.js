// --- Telegram MiniApp/WebApp: User profile info from Telegram ---

function getInitials(name) {
  return name.split(' ').map(word => word[0]).join('').toUpperCase();
}

function setTelegramProfile() {
  try {
    if (
      window.Telegram &&
      Telegram.WebApp &&
      Telegram.WebApp.initDataUnsafe &&
      Telegram.WebApp.initDataUnsafe.user
    ) {
      const user = Telegram.WebApp.initDataUnsafe.user;
      const fullName = user.first_name + (user.last_name ? (' ' + user.last_name) : '');
      const userNameEl = document.getElementById('user-name');
      if (userNameEl) userNameEl.textContent = fullName;
      const avatarEl = document.getElementById('avatar-circle');
      if (avatarEl) avatarEl.textContent = getInitials(fullName);
    } else {
      const userNameEl = document.getElementById('user-name');
      if (userNameEl) userNameEl.textContent = "ইউজারের নাম";
      const avatarEl = document.getElementById('avatar-circle');
      if (avatarEl) avatarEl.textContent = "ইন";
    }
  } catch(e) {
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = "ইউজারের নাম";
    const avatarEl = document.getElementById('avatar-circle');
    if (avatarEl) avatarEl.textContent = "ইন";
  }
}

// --- Main app logic ---
document.addEventListener("DOMContentLoaded", function() {
  // Preloader hide & app show
  var preloader = document.getElementById('preloader');
  var app = document.getElementById('app');
  if(preloader) preloader.classList.add("hidden");
  if(app) app.setAttribute("aria-hidden", "false");
  setTelegramProfile();

  // ---- নিচে আগের টাস্ক, ব্যালেন্স, মডাল, ইত্যাদি কিপ করো ----
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const els = {
    balanceAmount: $("#balance-amount"),
    tasksToday: $("#tasks-today"),
    referralsCount: $("#referrals-count"),
  };
  const STORE_KEYS = {
    balance: "grand_balance_v3",
    tasks: "grand_tasks_v3",
    referrals: "grand_referrals_v3",
  };
  const TASK_LIMIT = 20;
  const TASK_REWARD = 1.00;

  function getState() {
    const today = new Date().toDateString();
    let balance = parseFloat(localStorage.getItem(STORE_KEYS.balance)) || 0.00;
    let referrals = parseInt(localStorage.getItem(STORE_KEYS.referrals)) || 0;
    let tasksState = JSON.parse(localStorage.getItem(STORE_KEYS.tasks)) || { date: today, completed: 0 };
    if (tasksState.date !== today) {
      tasksState = { date: today, completed: 0 };
    }
    return { balance, referrals, tasksState };
  }

  function saveState(state) {
    localStorage.setItem(STORE_KEYS.balance, state.balance.toFixed(2));
    localStorage.setItem(STORE_KEYS.referrals, state.referrals);
    localStorage.setItem(STORE_KEYS.tasks, JSON.stringify(state.tasksState));
  }

  function updateUI(state) {
    if (els.balanceAmount) els.balanceAmount.textContent = state.balance.toFixed(2);
    if (els.referralsCount) els.referralsCount.textContent = state.referrals;
    if (els.tasksToday) els.tasksToday.textContent = `${state.tasksState.completed}/${TASK_LIMIT}`;
  }

  function completeTask() {
    let state = getState();
    if (state.tasksState.completed >= TASK_LIMIT) {
      alert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ।");
      return;
    }
    state.balance += TASK_REWARD;
    state.tasksState.completed += 1;
    saveState(state);
    updateUI(state);
    alert(`অসাধারণ! টাস্ক সফলভাবে সম্পন্ন হয়েছে। আপনার অ্যাকাউন্টে ৳${TASK_REWARD.toFixed(2)} যোগ হয়েছে।`);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
    app.setAttribute("aria-hidden", "true");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    app.setAttribute("aria-hidden", "false");
  }

  function startVideoAd(startBtn) {
    const modal = startBtn.closest('.modal');
    let state = getState();
    if (state.tasksState.completed >= TASK_LIMIT) {
      startBtn.disabled = false;
      startBtn.textContent = 'Watch Now';
      alert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ।");
      return;
    }
    startBtn.disabled = true;
    startBtn.textContent = 'বিজ্ঞাপন লোড হচ্ছে...';
    if (typeof show_10002890 !== 'function') {
      startBtn.disabled = false;
      startBtn.textContent = 'Watch Now';
      alert('বিজ্ঞাপন সিস্টেম এখনও লোড হয়নি। অনুগ্রহ করে পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।');
      return;
    }
    show_10002890().then(() => {
      completeTask();
      startBtn.textContent = 'টাস্ক সম্পন্ন হলো! 🎉';
      setTimeout(() => {
        closeModal(modal);
      }, 1500);
    }).catch(() => {
      startBtn.disabled = false;
      startBtn.textContent = 'Watch Now';
      alert('দুঃখিত, এই মুহূর্তে বিজ্ঞাপন লোড করা সম্ভব হয়নি। দয়া করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।');
    });
  }

  function bindEvents() {
    document.addEventListener("click", (e) => {
      const openModalBtn = e.target.closest("[data-open-modal]");
      if (openModalBtn) openModal("modal-watch-video");
      const closeModalBtn = e.target.closest("[data-close-modal]");
      if (closeModalBtn) closeModal(closeModalBtn.closest(".modal"));
      const startVideoBtn = e.target.closest('[data-action="start-video"]');
      if (startVideoBtn && !startVideoBtn.disabled) startVideoAd(startVideoBtn);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const activeModal = document.querySelector('[aria-hidden="false"].modal');
        if (activeModal) closeModal(activeModal);
      }
    });
  }

  const state = getState();
  updateUI(state);
  bindEvents();
});
