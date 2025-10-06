/*
  Grand App - v3 (Final Home)
  Main JavaScript file for the home screen.
  
  Updates:
  - TELEGRAM TASK REMOVED FROM INDEX.HTML (One-Time moved to task.html).
  - Daily video task reward set to ৳1.00.
  - Manual 15s timer replaced by Monetag Ad SDK call (show_10002890).
  - Strict daily limit logic implemented based on page URL (1x for index.html, 20x for task.html).
*/

// Using an IIFE (Immediately Invoked Function Expression) to avoid polluting the global scope.
(() => {
  "use strict";

  // --- 1. Helper Functions ---
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  // --- 2. DOM Element Cache ---
  // Caching elements for better performance.
  const els = {
    preloader: $("#preloader"),
    app: $("#app"),
    userName: $("#user-name"),
    userUsername: $("#user-username"),
    userAvatar: $("#user-avatar"),
    balanceAmount: $("#balance-amount"),
    // **UPDATED** for new stats section
    tasksToday: $("#tasks-today"), // Home page stat
    referralsCount: $("#referrals-count"),
    tasksTodayPage: $("#tasks-today-page"), // Added for task.html
    // tasksCompletedTotal Removed
    modals: {
      // join: $("#modal-join-channel"), // REMOVED from index.html
      video: $("#modal-watch-video"),
    },
  };

  // --- 3. State Management & localStorage ---
  const STORE_KEYS = {
    balance: "grand_balance_v3",
    tasks: "grand_tasks_v3",
    referrals: "grand_referrals_v3",
  };

  // A simple utility for interacting with localStorage.
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
  
  // New reward map for consistency
  const TASK_REWARDS = {
    'join-channel': 5.00, 
    'watch-video': 1.00, 
  };
  
  // Get all task definitions from the HTML.
  const tasksFromDOM = $$(".task-card").map(card => ({
    id: card.dataset.taskId,
    // Use the new reward map
    reward: TASK_REWARDS[card.dataset.taskId] || 0,
    duration: card.dataset.duration ? Number(card.dataset.duration) : null,
    goButton: card.querySelector(".btn-go"),
  }));
  
  // Helper to check if a timestamp is from today
  const isToday = (ts) => {
      if (!ts) return false;
      const today = new Date();
      const otherDate = new Date(ts);
      return today.getFullYear() === otherDate.getFullYear() &&
             today.getMonth() === otherDate.getMonth() &&
             today.getDate() === otherDate.getDate();
  };

  // Helper to get today's completed count (only for 'watch-video')
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
    // This function remains the same, provides fallback user data.
    if (window.Telegram && window.Telegram.WebApp) {
      // ... (Telegram logic would go here)
    } else {
      updateUserInfo({
        name: "Guest User",
        username: "guest",
        avatarUrl: "assets/avatar-placeholder.png",
      });
    }
  }

  function updateUserInfo(user) {
    if (els.userName) els.userName.textContent = user.name;
    if (els.userUsername) els.userUsername.textContent = `@${user.username}`;
    if (els.userAvatar && user.avatarUrl) els.userAvatar.src = user.avatarUrl;
  }
  
  /**
   * **UPDATED** - Synchronizes tasks and calculates new stats (Includes 24hr reset logic for index.html).
   */
  function syncTasksAndStats() {
    let todayCompletedCount = getCompletedTasksToday();
    
    tasksFromDOM.forEach(task => {
      if (!tasksState[task.id]) {
        tasksState[task.id] = { status: "pending", completed_at: null };
      }
      
      const taskState = tasksState[task.id];
      const isCompleted = taskState.status === "completed";
      
      if (isCompleted) {
        if (task.id === 'watch-video') {
            // Home page logic (1x daily reset)
            if (document.URL.includes('index.html')) {
                if (isToday(taskState.completed_at)) {
                    task.goButton.textContent = "Done";
                    task.goButton.disabled = true;
                } else {
                    // Reset to pending if last completion was not today (24hr reset)
                    taskState.status = "pending";
                    task.goButton.textContent = "Go";
                    task.goButton.disabled = false;
                }
            } else {
                // The task page logic relies on the count (completedCount) in completeTask()
                // If it's done, but we are under the limit, we keep the button active via code in task.html
                // Since this script runs on index.html, the watch-video task here only checks for 1x completion.
                task.goButton.textContent = "Done";
                task.goButton.disabled = true;
            }
        } else if (task.id === 'join-channel') {
            // Telegram is a one-time task
            task.goButton.textContent = "Done";
            task.goButton.disabled = true;
        }
      } else {
        // Task is pending
        task.goButton.textContent = "Go";
        task.goButton.disabled = false;
      }
    });

    store.set(STORE_KEYS.tasks, tasksState);
    updateStatsUI(todayCompletedCount, 0); 
  }

  /**
   * **UPDATED** - Updates the UI with new stats format (Includes Task Page logic).
   */
  function updateStatsUI(todayCount, totalCount) {
    if (els.balanceAmount) els.balanceAmount.textContent = balance.toFixed(2);
    
    // New stats
    const taskLimitText = `${todayCount}/${DAILY_TASK_LIMIT}`;

    // Update on Home Screen
    if (els.tasksToday) els.tasksToday.textContent = taskLimitText;
    
    // Update on Task Page (new element, should be handled by the inline script there for task.html)
    // if (els.tasksTodayPage) els.tasksTodayPage.textContent = taskLimitText;

    if (els.referralsCount) els.referralsCount.textContent = store.get(STORE_KEYS.referrals, 0);
  }

  function completeTask(taskId) {
    const taskState = tasksState[taskId];
    const taskDef = tasksFromDOM.find(t => t.id === taskId);
    const todayCompletedCount = getCompletedTasksToday();

    if (!taskDef) return;

    // --- 1. Strict Limit Checks ---

    if (taskId === 'join-channel') {
        // One-Time Task Check (Even if it exists on the page, the logic applies)
        if (taskState.status === "completed") {
            alert("এই টাস্কটি (টেলিগ্রাম জয়েন) একবারই সম্পন্ন করা যাবে।");
            return;
        }
    }

    if (taskId === 'watch-video') {
        // Home Page Logic (index.html): Must be done ONLY once per day
        if (document.URL.includes('index.html')) {
            if (todayCompletedCount >= 1) {
                alert("আজকের ডেইলি টাস্ক হোমপেজ থেকে একবার সম্পন্ন করা হয়েছে।");
                return;
            }
        }
        
        // All Tasks Page Logic (task.html): Must be done ONLY 20 times per day
        if (document.URL.includes('task.html')) {
            if (todayCompletedCount >= DAILY_TASK_LIMIT) {
                alert(`আজকের টাস্ক লিমিট (${DAILY_TASK_LIMIT} টি) শেষ। এর বেশি দেখতে পারবেন না।`);
                return;
            }
        }

        // Ensure ad was started/finished before completing
        const modal = $("#modal-watch-video");
        const startBtn = modal.querySelector('[data-action="start-video"]');
        if (startBtn.textContent !== 'Finished') {
           alert('ভিডিওটি এখনো দেখা হয়নি, বা বিজ্ঞাপন লোড হচ্ছে।');
           return;
        }
    }
    
    // --- 2. Completion Logic ---
    
    // Always mark completed, syncTasksAndStats will handle the reset logic if applicable
    taskState.status = "completed";
    taskState.completed_at = Date.now();
    
    // Use the defined rewards for balance update
    balance += TASK_REWARDS[taskId]; 

    store.set(STORE_KEYS.tasks, tasksState);
    store.set(STORE_KEYS.balance, balance);

    syncTasksAndStats();
  }

  // --- 5. Modal & Task-Specific Logic (Updated for Monetag) ---
  
  let videoTimer = null; // Timer variable remains for compatibility

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
   * **NEW FUNCTION** - Replaces startVideoTimer with Monetag Rewarded Interstitial logic.
   */
  function startMonetagAd(startBtn) {
      if (typeof show_10002890 !== 'function') {
          alert("বিজ্ঞাপন লোড হচ্ছে, কিছুক্ষণ অপেক্ষা করুন বা পেজ রিফ্রেশ করুন।");
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          return;
      }

      startBtn.disabled = true;
      startBtn.textContent = 'Ad Loading...';

      // Call the Monetag SDK function
      show_10002890().then(() => {
          // Ad shown successfully - Give the user the reward completion capability
          startBtn.textContent = "Finished";
          const modal = startBtn.closest(".modal");
          const completeBtn = modal.querySelector('[data-action="confirm-task"]');
          completeBtn.disabled = false;
          alert('বিজ্ঞাপন দেখা শেষ! এখন "Complete" বাটনে ক্লিক করুন।');
      }).catch((error) => {
          // Ad showing failed
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
      // Replace manual timer with Monetag ad function
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
    syncTasksAndStats(); // Use the updated function
    bindEvents();
  }
  
  document.addEventListener("DOMContentLoaded", init);

})();
