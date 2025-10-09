// Grand App - Single JS for Home (index.html) & Task (task.html)
// All UI, limit, user info, image select, daily/task logic, preloader, navigation timing, popup, etc.

(function () {
  "use strict";

  // 1. Profile images (10)
  const PROFILE_IMAGES = [
    "image/profile1.png",
    "image/profile2.png",
    "image/profile3.png",
    "image/profile4.png",
    "image/profile5.png",
    "image/profile6.png",
    "image/profile7.png",
    "image/profile8.png",
    "image/profile9.png",
    "image/profile10.png"
  ];

  // 2. LocalStorage Keys
  const STORE_KEYS = {
    balance: "grand_balance_v3",
    tasks: "grand_tasks_v3",
    referrals: "grand_referrals_v3",
    homeTask: "grand_home_task_v3",
    homeTaskDate: "grand_home_task_date",
    profileImg: "grand_profile_img",
    username: "grand_username",
    name: "grand_name",
    joinChannel: "grand_join_channel",
    videoTask: "grand_video_task_v3"
  };

  // 3. DOM Helpers
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  // 4. Page Detection
  const path = window.location.pathname.replace(/\\/g, '/');
  const isHome = /index\.html$|\/$/.test(path);
  const isTask = /task\.html$/.test(path);

  // 5. User Info/Profile ----------------------

  // Load user info from Telegram or LocalStorage
  function loadUserInfo() {
    let name = localStorage.getItem(STORE_KEYS.name) || "ইউজারের নাম";
    let username = localStorage.getItem(STORE_KEYS.username) || "@username";
    // Telegram Mini App থেকে ইনফো (নতুন ইউজার হলে)
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (user.first_name) {
        name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        localStorage.setItem(STORE_KEYS.name, name);
      }
      if (user.username) {
        username = '@' + user.username;
        localStorage.setItem(STORE_KEYS.username, username);
      }
    }
    // UI তে বসানো
    if ($("#user-name")) $("#user-name").textContent = name;
    if ($("#user-username")) $("#user-username").textContent = username;
  }
  // Profile image load/set
  function loadProfileImg() {
    let img = localStorage.getItem(STORE_KEYS.profileImg) || PROFILE_IMAGES[0];
    if ($("#user-avatar")) $("#user-avatar").src = img;
  }
  function setProfileImg(img) {
    localStorage.setItem(STORE_KEYS.profileImg, img);
    loadProfileImg();
  }
  // Name Edit Modal
  function setupNameEdit() {
    const editBtn = $("#edit-name-btn");
    const modal = $("#edit-name-modal");
    const input = $("#edit-name-input");
    const saveBtn = $("#save-name-btn");

    if (editBtn && modal && input && saveBtn) {
      editBtn.onclick = () => {
        modal.setAttribute('aria-hidden', 'false');
        input.value = $("#user-name").textContent;
        input.focus();
      };
      saveBtn.onclick = () => {
        const val = input.value.trim();
        if (val.length > 1) {
          localStorage.setItem(STORE_KEYS.name, val);
          $("#user-name").textContent = val;
          modal.setAttribute('aria-hidden', 'true');
        }
      };
      modal.querySelector('.modal-backdrop').onclick = () => modal.setAttribute('aria-hidden', 'true');
    }
  }
  // Profile Image Select Modal
  function setupProfileImgSelect() {
    const avatar = $("#user-avatar");
    const modal = $("#profile-pic-modal");
    const list = $("#profile-pic-list");

    if (avatar && modal && list) {
      avatar.style.cursor = "pointer";
      avatar.onclick = () => {
        modal.setAttribute('aria-hidden', 'false');
        list.innerHTML = "";
        PROFILE_IMAGES.forEach(img => {
          const imgEl = document.createElement('img');
          imgEl.src = img;
          imgEl.style.width = "56px";
          imgEl.style.height = "56px";
          imgEl.style.borderRadius = "50%";
          imgEl.style.cursor = "pointer";
          imgEl.style.border = img === localStorage.getItem(STORE_KEYS.profileImg) ? '2px solid #C9A741' : '2px solid transparent';
          imgEl.onclick = () => {
            setProfileImg(img);
            modal.setAttribute('aria-hidden', 'true');
          };
          list.appendChild(imgEl);
        });
      };
      modal.querySelector('.modal-backdrop').onclick = () => modal.setAttribute('aria-hidden', 'true');
    }
  }

  // 6. BALANCE ----------------------
  function getBalance() {
    return parseFloat(localStorage.getItem(STORE_KEYS.balance)) || 0.00;
  }
  function setBalance(val) {
    localStorage.setItem(STORE_KEYS.balance, val.toFixed(2));
    if ($("#balance-amount")) $("#balance-amount").textContent = val.toFixed(2);
  }

  // 7. DAILY HOME TASK (index.html) ----------------------
  function getHomeTaskState() {
    let state = localStorage.getItem(STORE_KEYS.homeTask);
    let date = localStorage.getItem(STORE_KEYS.homeTaskDate);
    return {
      done: state === "done" && date === getToday(),
      date: date || ""
    };
  }
  function completeHomeTask() {
    localStorage.setItem(STORE_KEYS.homeTask, "done");
    localStorage.setItem(STORE_KEYS.homeTaskDate, getToday());
  }
  function resetHomeTaskIfNeeded() {
    let date = localStorage.getItem(STORE_KEYS.homeTaskDate);
    if (date !== getToday()) {
      localStorage.removeItem(STORE_KEYS.homeTask);
      localStorage.setItem(STORE_KEYS.homeTaskDate, getToday());
    }
  }

  // 8. VIDEO TASK (TASK PAGE, 20/day) ----------------------
  function getVideoTaskState() {
    let state = localStorage.getItem(STORE_KEYS.videoTask);
    try { state = JSON.parse(state) || {}; } catch { state = {}; }
    if (!state.date || state.date !== getToday()) {
      state = { date: getToday(), count: 0 };
      localStorage.setItem(STORE_KEYS.videoTask, JSON.stringify(state));
    }
    return state;
  }
  function incrementVideoTask() {
    let state = getVideoTaskState();
    state.count = Math.min(20, (state.count || 0) + 1);
    localStorage.setItem(STORE_KEYS.videoTask, JSON.stringify(state));
  }

  // 9. TASK COUNTER UI ----------------------
  function updateCounters() {
    if ($("#tasks-today")) {
      let count = getVideoTaskState().count || 0;
      $("#tasks-today").textContent = `${count}/20`;
    }
    if ($("#tasks-today-page")) {
      let count = getVideoTaskState().count || 0;
      $("#tasks-today-page").textContent = `${count}/20`;
    }
  }

  // 10. PRELOADER SYSTEM ----------------------
  function showPreloader(duration = 1500) {
    const preloader = $("#preloader");
    const app = $("#app");
    if (preloader) {
      preloader.classList.remove("hidden");
      app && app.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        preloader.classList.add("hidden");
        app && app.setAttribute("aria-hidden", "false");
      }, duration);
    }
  }
  function initPreloader() {
    if (!sessionStorage.getItem("grand_first_load")) {
      sessionStorage.setItem("grand_first_load", "1");
      showPreloader(5000);
    } else {
      showPreloader(1500);
    }
  }

  // 11. MODALS ----------------------
  function openModal(id) {
    const modal = $('#' + id);
    if (modal) modal.setAttribute('aria-hidden', 'false');
  }
  function closeAllModals() {
    $$('.modal').forEach(m=>m.setAttribute('aria-hidden','true'));
  }

  // 12. VIDEO AD HANDLER (HOME + TASK PAGE) ----------------------
  // এখন শুধু Watch Now->Ad->Complete->reward (auto না)
  function handleVideoAd(taskType) {
    // taskType: 'home-daily', 'video-task'
    if (taskType === 'home-daily') {
      resetHomeTaskIfNeeded();
      if (getHomeTaskState().done) {
        alert("আপনি আজকের ডেইলি টাস্কটি ইতোমধ্যে সম্পন্ন করেছেন! নতুন করে পেতে ২৪ ঘণ্টা অপেক্ষা করুন।");
        return;
      }
    }
    if (taskType === 'video-task') {
      let state = getVideoTaskState();
      if (state.count >= 20) {
        alert("আজকের ভিডিও টাস্কের লিমিট শেষ! নতুন দিনে আবার চেষ্টা করুন।");
        return;
      }
    }
    if (typeof show_10002890 !== 'function') {
      alert("বিজ্ঞাপন সিস্টেম লোড হচ্ছে, একটু অপেক্ষা করুন বা পেজ রিফ্রেশ করুন।");
      return;
    }
    // Watch now ক্লিকে disable, এড শেষ হলে Complete Enable
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
  // Complete ক্লিকে টাকা/লিমিট বাড়াবে (automatic না)
  function handleCompleteVideoTask() {
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

  // 13. JOIN CHANNEL TASK (TASK PAGE) ----------------------
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

  // 14. EVENTS ----------------------
  function bindEvents() {
    // Video watch button (home/task)
    document.addEventListener('click', function(e){
      const btn = e.target.closest('[data-open-modal]');
      if (btn) {
        const modalId = btn.dataset.openModal;
        openModal('modal-' + modalId);
        // Set task-type on start-video btn
        const mv = $('#modal-' + modalId);
        if (mv) {
          let startBtn = mv.querySelector('[data-action="start-video"]');
          if (startBtn) startBtn.dataset.task = btn.dataset.taskType || (isHome ? 'home-daily' : 'video-task');
        }
      }
    });
    // Video ad start
    document.addEventListener('click', function(e){
      const btn = e.target.closest('[data-action="start-video"]');
      if (btn && !btn.disabled) {
        handleVideoAd(btn.dataset.task || (isHome ? 'home-daily' : 'video-task'));
      }
    });
    // Complete ভিডিও টাস্ক
    document.addEventListener('click', function(e){
      const btn = e.target.closest('[data-action="confirm-task"][data-task="watch-video"]');
      if (btn && !btn.disabled) {
        handleCompleteVideoTask();
      }
    });
    // Join channel complete (task page)
    document.addEventListener('click', function(e){
      const btn = e.target.closest('[data-action="confirm-task"][data-task="join-channel"]');
      if (btn && !btn.disabled) {
        handleJoinChannelTask();
      }
    });
    // Modal close
    document.addEventListener('click', function(e){
      const closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn) {
        closeAllModals();
      }
    });
    // নেভিগেশন লিংক ক্লিক: Home↔Task
    $$(".bottom-nav .nav-item").forEach(nav => {
      nav.addEventListener("click", function(e) {
        const href = nav.getAttribute("href");
        if (href && (href.includes("task.html") || href.includes("index.html"))) {
          e.preventDefault();
          showPreloader(1500);
          setTimeout(() => { window.location.href = href; }, 1500);
        }
      });
    });
  }

  // 15. INITIALIZE ----------------------
  function init() {
    initPreloader();
    loadUserInfo();
    loadProfileImg();
    setupProfileImgSelect();
    setupNameEdit();
    setBalance(getBalance());
    resetHomeTaskIfNeeded();
    updateCounters();
    bindEvents();
  }
  // Date helpers
  function getToday() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
  }

  document.addEventListener("DOMContentLoaded", init);

})();
