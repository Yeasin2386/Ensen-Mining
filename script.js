// Grand App - New UI/UX & All logic (Professional Version)
// All linter rules, comments, and modern JS

(function () {
  "use strict";

  // ---- Profile Images ----
  const PROFILE_IMAGES = [
    "assets/avatar-placeholder.png", "assets/avatar2.png", "assets/avatar3.png"
  ];

  // ---- Storage Keys ----
  const STORE_KEYS = {
    balance: "grand_balance_v4",
    videoTask: "grand_video_task_v4",
    homeTask: "grand_home_task_v4",
    homeTaskDate: "grand_home_task_date_v4",
    joinChannel: "grand_join_channel_v4",
    name: "grand_name_v4",
    username: "grand_username_v4",
    profileImg: "grand_profile_img_v4"
  };

  // ---- Helpers ----
  const $ = (sel, p = document) => p.querySelector(sel);
  const $$ = (sel, p = document) => Array.from(p.querySelectorAll(sel));
  const page = location.pathname.split("/").pop();

  // ---- Preloader ----
  function showPreloader(ms = 1500) {
    const pre = $("#preloader");
    const app = $("#app");
    if (!pre) return;
    pre.classList.remove("hidden");
    if (app) app.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      pre.classList.add("hidden");
      if (app) app.setAttribute("aria-hidden", "false");
    }, ms);
  }
  function initPreloader() {
    if (!sessionStorage.getItem("grand_first_load")) {
      sessionStorage.setItem("grand_first_load", "1");
      showPreloader(2900);
    } else {
      showPreloader(1200);
    }
  }

  // ---- User Info ----
  function loadUserInfo() {
    let name = localStorage.getItem(STORE_KEYS.name) || "ইউজারের নাম";
    let username = localStorage.getItem(STORE_KEYS.username) || "@username";
    if ($("#user-name")) $("#user-name").textContent = name;
    if ($("#user-username")) $("#user-username").textContent = username;
    if ($("#user-avatar")) $("#user-avatar").src = localStorage.getItem(STORE_KEYS.profileImg) || PROFILE_IMAGES[0];
  }

  // ---- Balance ----
  function getBalance() {
    return parseFloat(localStorage.getItem(STORE_KEYS.balance)) || 0;
  }
  function setBalance(v) {
    localStorage.setItem(STORE_KEYS.balance, v.toFixed(2));
    if ($("#balance-amount")) $("#balance-amount").textContent = v.toFixed(2);
  }

  // ---- Video Tasks ----
  function getVideoTaskState() {
    let state = localStorage.getItem(STORE_KEYS.videoTask);
    try { state = JSON.parse(state) || {}; } catch { state = {}; }
    if (!state.date || state.date !== todayStr()) {
      state = { date: todayStr(), count: 0 };
      localStorage.setItem(STORE_KEYS.videoTask, JSON.stringify(state));
    }
    return state;
  }
  function incrementVideoTask() {
    let state = getVideoTaskState();
    state.count = Math.min(20, (state.count || 0) + 1);
    localStorage.setItem(STORE_KEYS.videoTask, JSON.stringify(state));
  }

  // ---- Home Task (Daily only 1) ----
  function getHomeTaskState() {
    let state = localStorage.getItem(STORE_KEYS.homeTask);
    let date = localStorage.getItem(STORE_KEYS.homeTaskDate);
    return {
      done: state === "done" && date === todayStr(),
      date: date || ""
    };
  }
  function completeHomeTask() {
    localStorage.setItem(STORE_KEYS.homeTask, "done");
    localStorage.setItem(STORE_KEYS.homeTaskDate, todayStr());
  }
  function resetHomeTaskIfNeeded() {
    let date = localStorage.getItem(STORE_KEYS.homeTaskDate);
    if (date !== todayStr()) {
      localStorage.removeItem(STORE_KEYS.homeTask);
      localStorage.setItem(STORE_KEYS.homeTaskDate, todayStr());
    }
  }

  // ---- Join Channel ----
  function handleJoinChannelTask() {
    if (localStorage.getItem(STORE_KEYS.joinChannel) === "done") {
      alert("আপনি ইতোমধ্যে চ্যানেলে জয়েন টাস্কটি সম্পন্ন করেছেন।");
      return false;
    }
    setBalance(getBalance() + 5);
    localStorage.setItem(STORE_KEYS.joinChannel, "done");
    alert("অভিনন্দন! টেলিগ্রাম চ্যানেলে জয়েন করার জন্য ৳5 পেয়েছেন।");
    updateCounters();
    closeAllModals();
    return true;
  }

  // ---- Counters ----
  function updateCounters() {
    let count = getVideoTaskState().count || 0;
    if ($("#tasks-today")) $("#tasks-today").textContent = `${count}/20`;
    if ($("#tasks-today-page")) $("#tasks-today-page").textContent = `${count}/20`;
  }

  // ---- Modal ----
  function openModal(id) {
    const modal = $("#" + id);
    if (modal) modal.setAttribute("aria-hidden", "false");
  }
  function closeAllModals() {
    $$(".modal").forEach(m => m.setAttribute("aria-hidden", "true"));
  }

  // ---- Video Ad Handler ----
  function handleVideoAd(taskType) {
    if (taskType === 'home-daily') {
      resetHomeTaskIfNeeded();
      if (getHomeTaskState().done) {
        alert("আপনি আজকের ডেইলি টাস্কটি ইতোমধ্যে সম্পন্ন করেছেন!");
        return;
      }
    }
    if (taskType === 'video-task') {
      let state = getVideoTaskState();
      if (state.count >= 20) {
        alert("আজকের ভিডিও টাস্কের লিমিট শেষ!");
        return;
      }
    }
    if (typeof show_10002890 !== 'function') {
      alert("বিজ্ঞাপন লোড হচ্ছে, একটু অপেক্ষা করুন বা রিফ্রেশ করুন।");
      return;
    }
    const modal = $("#modal-watch-video");
    const completeBtn = modal?.querySelector('[data-action="confirm-task"][data-task="watch-video"]');
    const watchBtn = modal?.querySelector('[data-action="start-video"]');
    if (watchBtn) watchBtn.disabled = true;
    if (completeBtn) completeBtn.disabled = true;
    show_10002890().then(() => {
      if (completeBtn) completeBtn.disabled = false;
      if (watchBtn) watchBtn.disabled = false;
      alert('ভিডিও দেখা শেষ! এখন "Complete" বাটনে ক্লিক করুন।');
    }).catch(() => {
      if (watchBtn) watchBtn.disabled = false;
      alert("বিজ্ঞাপন লোড হয়নি!");
    });
  }
  function handleCompleteVideoTask(taskType) {
    if (taskType === "home-daily") {
      if (getHomeTaskState().done) {
        alert("আজকের ডেইলি টাস্ক শেষ!");
        return false;
      }
      completeHomeTask();
      setBalance(getBalance() + 1);
      alert("অভিনন্দন! ডেইলি টাস্ক সম্পন্ন হয়েছে, ৳1 পেয়েছেন।");
      updateCounters();
      closeAllModals();
      return true;
    }
    if (taskType === "video-task") {
      let state = getVideoTaskState();
      if (state.count >= 20) {
        alert("আজকের ভিডিও টাস্কের লিমিট শেষ!");
        return false;
      }
      incrementVideoTask();
      setBalance(getBalance() + 1);
      alert("অভিনন্দন! টাস্ক সম্পন্ন হয়েছে, ৳1 পেয়েছেন।");
      updateCounters();
      closeAllModals();
      return true;
    }
  }

  // ---- Events ----
  function bindEvents() {
    // Modal open
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-open-modal]');
      if (btn) {
        const modalId = btn.dataset.openModal;
        openModal('modal-' + modalId);
        const mv = $('#modal-' + modalId);
        if (mv) {
          let startBtn = mv.querySelector('[data-action="start-video"]');
          if (startBtn) startBtn.dataset.task = btn.dataset.taskType || (page === "index.html" ? 'home-daily' : 'video-task');
        }
      }
    });
    // Watch Now
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-action="start-video"]');
      if (btn && !btn.disabled) {
        handleVideoAd(btn.dataset.task || (page === "index.html" ? 'home-daily' : 'video-task'));
      }
    });
    // Complete
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-action="confirm-task"][data-task="watch-video"]');
      if (btn && !btn.disabled) {
        handleCompleteVideoTask(page === "index.html" ? "home-daily" : "video-task");
      }
      const btn2 = e.target.closest('[data-action="confirm-task"][data-task="join-channel"]');
      if (btn2 && !btn2.disabled) {
        handleJoinChannelTask();
      }
    });
    // Modal close
    document.addEventListener('click', function (e) {
      const closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn) closeAllModals();
    });
    // Bottom nav navigation
    $$(".bottom-nav .nav-item").forEach(nav => {
      nav.addEventListener("click", function (e) {
        const href = nav.getAttribute("href");
        if (href && (href.includes("task.html") || href.endsWith("index.html"))) {
          e.preventDefault();
          showPreloader(1100);
          setTimeout(() => { window.location.href = href; }, 1100);
        }
      });
    });
  }

  // ---- Date ----
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
  }

  // ---- Init ----
  function init() {
    initPreloader();
    loadUserInfo();
    setBalance(getBalance());
    resetHomeTaskIfNeeded();
    updateCounters();
    bindEvents();
  }
  document.addEventListener("DOMContentLoaded", init);

})();
