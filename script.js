/*
  Grand App - v3 (Final Home)
  Main JavaScript file for the home screen.
  
  Updates:
  - Daily video task reward set to ৳1.00.
  - Manual 15s timer replaced by Monetag Ad SDK call (show_10002890).
  - Strict daily limit logic implemented based on page URL (1x for index.html, 20x for task.html).
  - CRITICAL FIX: Enhanced completion logic to prevent incorrect task state reset.
*/

// Using an IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope.
(() => {
  "use strict";

  // --- 1. Helper Functions ---
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  // --- 2. DOM Element Cache ---
  const els = {
    preloader: $("#preloader"),
    app: $("#app"),
    userName: $("#user-name"),
    userUsername: $("#user-username"),
    userAvatar: $("#user-avatar"),
    balanceAmount: $("#balance-amount"),
    tasksToday: $("#tasks-today"), // Home page stat
    referralsCount: $("#referrals-count"),
    modals: { video: $("#modal-watch-video") },
  };

  // --- 3. State Management & localStorage ---
  const STORE_KEYS = {
    balance: "grand_balance_v3",
    tasks: "grand_tasks_v3",
    referrals: "grand_referrals_v3",
  };

  const store = {
    get: (key, fallback = null) => {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error("Failed to save to localStorage", e);
      }
    },
  };

  let balance = store.get(STORE_KEYS.balance, 0);
  let tasksState = store.get(STORE_KEYS.tasks, {});
  const DAILY_TASK_LIMIT = 20;
  
  const TASK_REWARDS = {
    'join-channel': 5.00, 
    'watch-video': 1.00, 
  };
  
  const tasksFromDOM = $$(".task-card").map(card => ({
    id: card.dataset.taskId,
    reward: TASK_REWARDS[card.dataset.taskId] || 0,
    duration: card.dataset.duration ? Number(card.dataset.duration) : null,
    goButton: card.querySelector(".btn-go"),
  }));
  
  const isToday = (ts) => {
      if (!ts) return false;
      const today = new Date();
      const otherDate = new Date(ts);
      return today.getFullYear() === otherDate.getFullYear() &&
             today.getMonth() === otherDate.getMonth() &&
             today.getDate() === otherDate.getDate();
  };

  function getCompletedTasksToday() {
      let todayCompletedCount = 0;
      for (const taskId in tasksState) {
          if (taskId === 'watch-video' && tasksState[taskId].status === 'completed' && isToday(tasksState[taskId].completed_at)) {
              todayCompletedCount++;
          }
      }
      return todayCompletedCount;
  }

  // --- 4. Core Functions ---

  function handlePreloader() {
    setTimeout(() => {
      els.preloader.classList.add("hidden");
      els.app.setAttribute("aria-hidden", "false");
    }, 1500);
  }
  
  function initUser() {
    updateUserInfo({
        name: "Guest User",
        username: "guest",
        avatarUrl: "assets/avatar-placeholder.png",
    });
  }

  function updateUserInfo(user) {
    if (els.userName) els.userName.textContent = user.name;
    if (els.userUsername) els.userUsername.textContent = `@${user.username}`;
    if (els.userAvatar && user.avatarUrl) els.userAvatar.src = user.avatarUrl;
  }
  
  /**
   * **UPDATED** - Synchronizes tasks for the home page (1x daily limit).
   */
  function syncTasksAndStats() {
    let todayCompletedCount = getCompletedTasksToday();
    
    tasksFromDOM.forEach(task => {
      if (!tasksState[task.id]) {
        tasksState[task.id] = { status: "pending", completed_at: null };
      }
      
      const taskState = tasksState[task.id];
      const isCompleted = taskState.status === "completed";
      
      if (task.id === 'watch-video') {
        // Home page logic: If done once today, mark as Done. Reset if not today.
        if (isCompleted && isToday(taskState.completed_at)) {
            task.goButton.textContent = "Done";
            task.goButton.disabled = true;
        } else if (isCompleted && !isToday(taskState.completed_at)) {
            // Reset state if not completed today
            taskState.status = "pending";
            taskState.completed_at = null;
            task.goButton.textContent = "Go";
            task.goButton.disabled = false;
        } else {
            task.goButton.textContent = "Go";
            task.goButton.disabled = false;
        }
      }
      // Note: Telegram task logic is removed from index.html DOM logic as per previous instruction.
    });

    store.set(STORE_KEYS.tasks, tasksState);
    updateStatsUI(todayCompletedCount); 
  }

  function updateStatsUI(todayCount) {
    if (els.balanceAmount) els.balanceAmount.textContent = balance.toFixed(2);
    
    // Show 1/1 limit for home screen (based on the single task philosophy)
    const homeLimit = todayCount >= 1 ? "1/1" : "0/1"; 
    if (els.tasksToday) els.tasksToday.textContent = homeLimit;
    
    if (els.referralsCount) els.referralsCount.textContent = store.get(STORE_KEYS.referrals, 0);
  }

  /**
   * **FIXED** - Completion logic with strict Monetag Ad check.
   */
  function completeTask(taskId) {
    const taskState = tasksState[taskId];
    const todayCompletedCount = getCompletedTasksToday();

    if (taskId === 'watch-video') {
        // Home Page Logic (index.html): Must be done ONLY once per day
        if (document.URL.includes('index.html')) {
            if (todayCompletedCount >= 1) {
                alert("আজকের ডেইলি টাস্ক হোমপেজ থেকে একবার সম্পন্ন করা হয়েছে।");
                return;
            }
        }
        
        // --- AD COMPLETION CHECK (CRITICAL) ---
        const modal = $("#modal-watch-video");
        const startBtn = modal.querySelector('[data-action="start-video"]');
        if (startBtn.textContent !== 'Finished') {
           alert('ভিডিওটি সম্পূর্ণ দেখা হয়নি বা বিজ্ঞাপন লোড হচ্ছে। "Watch Now" বাটনে ক্লিক করে বিজ্ঞাপনটি শেষ করুন।');
           return;
        }
    }
    
    // --- Completion Logic ---
    
    taskState.status = "completed";
    taskState.completed_at = Date.now();
    
    // Use the defined rewards for balance update
    balance += TASK_REWARDS[taskId]; 

    store.set(STORE_KEYS.tasks, tasksState);
    store.set(STORE_KEYS.balance, balance);

    syncTasksAndStats();
  }

  // --- 5. Modal & Task-Specific Logic (Monetag Integration) ---
  
  let videoTimer = null; 

  function openModal(modalId) {
    const modal = $(`#modal-${modalId}`);
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (modalId === "watch-video") {
      const completeBtn = modal.querySelector('[data-action="confirm-task"]');
      const startBtn = modal.querySelector('[data-action="start-video"]');
      completeBtn.disabled = true;
      startBtn.disabled = false;
      startBtn.textContent = "Watch Now";
    }
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (videoTimer) {
      clearInterval(videoTimer);
      videoTimer = null;
    }
  }
  
  function startMonetagAd(startBtn) {
      if (typeof show_10002890 !== 'function') {
          alert("বিজ্ঞাপন লোড হচ্ছে, কিছুক্ষণ অপেক্ষা করুন বা পেজ রিফ্রেশ করুন।");
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          return;
      }

      startBtn.disabled = true;
      startBtn.textContent = 'Ad Loading...';

      show_10002890().then(() => {
          startBtn.textContent = "Finished";
          const modal = startBtn.closest(".modal");
          const completeBtn = modal.querySelector('[data-action="confirm-task"]');
          completeBtn.disabled = false;
          alert('বিজ্ঞাপন দেখা শেষ! এখন "Complete" বাটনে ক্লিক করুন।');
      }).catch((error) => {
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          console.error('Monetag Ad Error:', error);
          alert('বিজ্ঞাপনটি লোড হতে পারেনি। আবার চেষ্টা করুন।');
      });
  }


  // --- 6. Event Listeners ---
  
  function bindEvents() {
    document.addEventListener("click", (e) => {
      const openModalBtn = e.target.closest("[data-open-modal]");
      if (openModalBtn) openModal(openModalBtn.dataset.openModal);
      
      const closeModalBtn = e.target.closest("[data-close-modal]");
      if (closeModalBtn) closeModal(closeModalBtn.closest(".modal"));
      
      const confirmBtn = e.target.closest('[data-action="confirm-task"]');
      if (confirmBtn && !confirmBtn.disabled) {
        completeTask(confirmBtn.dataset.task);
        closeModal(confirmBtn.closest(".modal"));
      }

      const startVideoBtn = e.target.closest('[data-action="start-video"]');
      if (startVideoBtn && !startVideoBtn.disabled) startMonetagAd(startVideoBtn);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const activeModal = $('[aria-hidden="false"].modal');
        if (activeModal) closeModal(activeModal);
      }
    });
  }
  
  // --- 7. Initialization ---
  
  function init() {
    handlePreloader();
    initUser();
    syncTasksAndStats();
    bindEvents();
  }
  
  document.addEventListener("DOMContentLoaded", init);

})();
