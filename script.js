/*
  Grand App - v3 (Final Home)
  Main JavaScript file for the home screen.
  
  UPDATED LOGIC: 
  - Shared Daily Task Limit (20) for all pages.
  - Home Page (index.html) is restricted to the first task (1/20).
  - CRITICAL FIX: Daily Reset logic implemented based on timestamp.
  - Professional, Monetag-free alert messages implemented.
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
    tasks: "grand_tasks_v3", // This will now hold the daily task count
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
  // CRITICAL CHANGE: The daily limit is now a single, shared value (20)
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
  
  /**
   * Checks if the given timestamp is for today (for daily reset).
   */
  const isToday = (ts) => {
      if (!ts) return false;
      const today = new Date();
      const otherDate = new Date(ts);
      return today.getFullYear() === otherDate.getFullYear() &&
             today.getMonth() === otherDate.getMonth() &&
             today.getDate() === otherDate.getDate();
  };

  /**
   * **UPDATED:** Checks the count of completed video tasks for today.
   * Resets the count if a new day has started (daily reset logic).
   */
  function getCompletedTasksToday() {
      const videoTaskState = tasksState['watch-video'] || {};
      
      // Check if the last completion time is NOT today
      if (!videoTaskState.completed_at || !isToday(videoTaskState.completed_at)) {
          // Reset the count for the new day
          tasksState['watch-video'] = { status: "pending", completed_at: null, count: 0 };
          return 0; 
      }
      
      // Return the current count (default to 0 if count property is missing)
      return videoTaskState.count || 0;
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
   * **UPDATED** - Synchronizes tasks for the home page (now checks shared limit).
   */
  function syncTasksAndStats() {
    let todayCompletedCount = getCompletedTasksToday();
    
    tasksFromDOM.forEach(task => {
      if (!tasksState[task.id]) {
        tasksState[task.id] = { status: "pending", completed_at: null };
      }
      
      if (task.id === 'watch-video') {
        // Shared Logic: If total limit is reached (20/20), disable Go button
        if (todayCompletedCount >= DAILY_TASK_LIMIT) {
            task.goButton.textContent = "Limit End";
            task.goButton.disabled = true;
        } 
        // Home Page Specific Logic: Disable after the first completion (1/20)
        else if (todayCompletedCount >= 1) {
            task.goButton.textContent = "Done";
            task.goButton.disabled = true;
        }
        else {
            // Task is available (0/20)
            task.goButton.textContent = "Go";
            task.goButton.disabled = false;
        }
      }
    });

    store.set(STORE_KEYS.tasks, tasksState);
    updateStatsUI(todayCompletedCount); 
  }

  function updateStatsUI(todayCount) {
    if (els.balanceAmount) els.balanceAmount.textContent = balance.toFixed(2);
    
    // CRITICAL CHANGE: Show shared 0/20 limit
    if (els.tasksToday) els.tasksToday.textContent = todayCount + '/' + DAILY_TASK_LIMIT;
    
    if (els.referralsCount) els.referralsCount.textContent = store.get(STORE_KEYS.referrals, 0);
  }

  /**
   * **UPDATED** - Completion logic with strict limits and professional messages.
   */
  function completeTask(taskId) {
    let todayCompletedCount = getCompletedTasksToday();
    const videoTaskState = tasksState['watch-video'] = tasksState['watch-video'] || { status: "pending", completed_at: null, count: 0 };

    // --- 1. TOTAL LIMIT CHECK (Shared for all pages) ---
    if (todayCompletedCount >= DAILY_TASK_LIMIT) {
        // Professional message for total limit end
        alert(`দুঃখিত! আজকের (${DAILY_TASK_LIMIT}টি) ভিডিও টাস্কের লিমিট শেষ হয়েছে। নতুন টাস্কের জন্য অপেক্ষা করুন।`);
        return;
    }

    if (taskId === 'watch-video') {
        // --- 2. HOME PAGE (FIRST TASK ONLY) CHECK ---
        if (document.URL.includes('index.html') && todayCompletedCount >= 1) {
            // Professional message for Home Page Daily Bonus
            alert('আপনার আজকের দৈনিক বোনাস টাস্কটি ইতিমধ্যেই সম্পন্ন হয়েছে। অনুগ্রহ করে আগামীকাল (২৪ ঘন্টা পর) আবার চেষ্টা করুন।');
            return;
        }
        
        // --- 3. AD COMPLETION CHECK (CRITICAL) ---
        const modal = $("#modal-watch-video");
        const startBtn = modal.querySelector('[data-action="start-video"]');
        if (startBtn.textContent !== 'Finished') {
           alert('ভিডিওটি সম্পূর্ণ দেখা হয়নি বা বিজ্ঞাপন লোড হচ্ছে। "Watch Now" বাটনে ক্লিক করে বিজ্ঞাপনটি শেষ করুন।');
           return;
        }
    }
    
    // --- Completion Logic ---
    
    // Increment the shared count and update the status
    if (taskId === 'watch-video') {
        videoTaskState.count = todayCompletedCount + 1;
        videoTaskState.completed_at = Date.now(); // Update timestamp for daily reset
        videoTaskState.status = (videoTaskState.count >= DAILY_TASK_LIMIT) ? "completed" : "pending";
    } else if (taskId === 'join-channel') {
         // One-time task logic remains
         tasksState[taskId] = { status: "completed", completed_at: Date.now() };
    }
    
    // Use the defined rewards for balance update
    balance += TASK_REWARDS[taskId]; 

    store.set(STORE_KEYS.tasks, tasksState);
    store.set(STORE_KEYS.balance, balance);

    // After successful completion, close the modal
    const modal = $(`#modal-${taskId}`);
    if(modal) closeModal(modal);

    syncTasksAndStats();
  }

  // --- 5. Modal & Task-Specific Logic (Professional Messages) ---
  
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
  
  /**
   * **UPDATED:** Monetag Ad call (Monetag-free professional messages)
   */
  function startMonetagAd(startBtn) {
      // Check if SDK function is loaded
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
          // Professional, Monetag-free success message
          alert('ভিডিওটি সফলভাবে দেখা হয়েছে! টাস্কটি সম্পূর্ণ করতে এখন "Complete" বাটনে ক্লিক করুন।');
      }).catch((error) => {
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          console.error('Monetag Ad Error:', error);
          // Professional, Monetag-free error message
          alert('ভিডিওটি লোড করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
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
