/*
  Grand App - v3 (Final Home)
  Main JavaScript file for the home screen.
  
  *** আপডেটের সারসংক্ষেপ: ***
  1. হোম স্ক্রিন ডেইলি টাস্ক ফিক্স: ক্লিক করলে পপআপ আসবে এবং দিনে একবারই সম্পন্ন করা যাবে।
  2. ভিডিও এড টাস্ক: দৈনিক লিমিট শেষ না হওয়া পর্যন্ত করা যাবে (মোট ২০টি)।
  3. পপআপ মেসেজ: আরও সুন্দর, প্রফেশনাল এবং স্পষ্ট করা হয়েছে (Monetization কথা বাদ দিয়ে)।
  4. ডেইলি রিসেট: রাত ১২টায় স্বয়ংক্রিয় রিসেট।
*/

// Using an IIFE (Immediately Activated Function Expression) to avoid polluting the global scope.
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
    modals: { 
      video: $("#modal-watch-video"),
      dailyTask: $("#modal-daily-task")
    },
    homeTaskBtn: $('[data-task-btn]'), // Button on index.html: data-task-btn="daily-check"
  };

  // --- 3. State Management & localStorage ---
  const STORE_KEYS = {
    balance: "grand_balance_v3",
    tasks: "grand_tasks_v3",
    referrals: "grand_referrals_v3",
    // New key to track home page task completion for the day
    homeTaskDone: "grand_home_task_done_v3",
  };
  
  const TASK_LIMIT = 20; // মোট দৈনিক ভিডিও টাস্ক লিমিট
  const TASK_REWARD = 1.00;
  const DAILY_CHECK_REWARD = 1.00; // Assuming the daily check reward is ৳1
  
  // Task Identifiers
  const TASK_DAILY_CHECK = 'daily-check';
  const TASK_WATCH_VIDEO = 'watch-video';
  
  const USER_INFO = {
    name: "A. K. Yeasin",
    username: "@yeasinkhan",
    avatar: "image/Gemini_Generated_Image_dcsl0idcsl0idcsl.png",
  };
  
  // Function for beautiful popup messages (using native alert to avoid structural changes)
  function showCustomAlert(message) {
    alert(message);
  }

  function getState() {
    // Current date for daily reset check
    const today = new Date().toDateString();
    
    // Get existing state or set defaults
    let balance = parseFloat(localStorage.getItem(STORE_KEYS.balance)) || 0.00;
    let referrals = parseInt(localStorage.getItem(STORE_KEYS.referrals)) || 0;
    
    let tasksState = JSON.parse(localStorage.getItem(STORE_KEYS.tasks)) || { date: today, completed: 0 };
    let homeTaskDoneState = JSON.parse(localStorage.getItem(STORE_KEYS.homeTaskDone)) || { date: today, done: false };

    // --- Daily Reset Logic (New Day Check) ---
    // If the date changes, reset completed tasks and home task status
    if (tasksState.date !== today) {
      tasksState = { date: today, completed: 0 };
    }
    if (homeTaskDoneState.date !== today) {
      homeTaskDoneState = { date: today, done: false };
    }

    return { balance, referrals, tasksState, homeTaskDoneState };
  }

  function saveState(state) {
    localStorage.setItem(STORE_KEYS.balance, state.balance.toFixed(2));
    localStorage.setItem(STORE_KEYS.referrals, state.referrals);
    localStorage.setItem(STORE_KEYS.tasks, JSON.stringify(state.tasksState));
    localStorage.setItem(STORE_KEYS.homeTaskDone, JSON.stringify(state.homeTaskDoneState));
  }
  
  // --- 4. UI/Data Sync Functions ---

  function updateUI(state) {
    if (els.userName) els.userName.textContent = USER_INFO.name;
    if (els.userUsername) els.userUsername.textContent = USER_INFO.username;
    if (els.userAvatar) els.userAvatar.src = USER_INFO.avatar;

    if (els.balanceAmount) els.balanceAmount.textContent = state.balance.toFixed(2);
    if (els.referralsCount) els.referralsCount.textContent = state.referrals;
    
    // Update Task Counter on Home Page and Task Page
    const taskCounterText = `${state.tasksState.completed}/${TASK_LIMIT}`;
    
    // For Home Page (index.html)
    if (els.tasksToday) {
      els.tasksToday.textContent = taskCounterText;
    }
    
    // For Task Page (task.html)
    const taskLimitDisplay = $("#task-limit-display") || $("#tasks-today-page");
    if (taskLimitDisplay) {
        taskLimitDisplay.textContent = taskCounterText;
    }

    // --- Home Task Button State ---
    if (els.homeTaskBtn) {
        if (state.homeTaskDoneState.done) {
            els.homeTaskBtn.disabled = true;
            els.homeTaskBtn.textContent = 'আজকের টাস্ক সম্পন্ন';
            // Disable the modal trigger as well
            els.homeTaskBtn.dataset.openModal = 'disabled'; 
        } else {
             els.homeTaskBtn.disabled = false;
             els.homeTaskBtn.textContent = 'Collect';
             // Re-enable the original modal trigger
             els.homeTaskBtn.dataset.openModal = 'daily-task';
        }
    }
    
    // --- Video Task Button State (in modal) ---
    const isLimitReached = state.tasksState.completed >= TASK_LIMIT;
    const startVideoBtn = $('[data-action="start-video"]'); // General task button (Modal)

    if (startVideoBtn) {
        if (isLimitReached) {
            startVideoBtn.disabled = true;
            startVideoBtn.textContent = 'দৈনিক লিমিট শেষ';
        } else {
             startVideoBtn.disabled = false;
             startVideoBtn.textContent = 'Watch Now'; // Ensure text is correct if re-enabled
        }
    }
  }
  
  // --- 5. Core Task Logic ---

  /**
   * Completes a task and updates the state.
   * @param {string} taskId - The ID of the task to complete ('daily-check' or 'watch-video').
   */
  function completeTask(taskId) {
    let state = getState();
    let reward = 0;
    let message = '';

    if (taskId === TASK_DAILY_CHECK) {
        if (state.homeTaskDoneState.done) {
            showCustomAlert("দুঃখিত! আজকের ডেইলি টাস্কটি আপনি একবার সম্পন্ন করেছেন। পরবর্তী টাস্কের জন্য আগামীকাল অপেক্ষা করুন। 😊");
            return;
        }
        
        reward = DAILY_CHECK_REWARD;
        state.balance += reward;
        state.homeTaskDoneState.done = true;
        message = `আজকের ডেইলি টাস্ক সফল! 🎉 আপনার অ্যাকাউন্টে ৳${reward.toFixed(2)} বোনাস যোগ করা হয়েছে।`;

    } else if (taskId === TASK_WATCH_VIDEO) {
        if (state.tasksState.completed >= TASK_LIMIT) {
             showCustomAlert("দৈনিক টাস্ক লিমিট শেষ। 😔 আজকের মতো আপনার সব কাজ সম্পন্ন হয়েছে। আগামীকাল আবার চেষ্টা করুন।");
            return;
        }
        
        reward = TASK_REWARD;
        state.balance += reward;
        state.tasksState.completed++;
        message = `অভিনন্দন! 🎉 ভিডিও টাস্কটি সফলভাবে সম্পন্ন হয়েছে। আপনার অ্যাকাউন্টে ৳${reward.toFixed(2)} যোগ করা হয়েছে।`;
    }

    saveState(state);
    updateUI(state);
    
    if (message) showCustomAlert(message);
  }

  // --- 6. Modal and Ad Logic ---
  
  function openModal(modalName) {
    const modal = $(`#modal-${modalName}`);
    if (!modal) {
        // Fix for home screen task: if it's the daily-task and no modal is defined, run the direct handler
        if (modalName === 'daily-task') {
            handleDailyCheckTask(); 
            return; 
        }
        console.error(`Modal #${modalName} not found.`);
        return;
    }
    
    // Reset/Prepare Modal Content (specifically for video modal)
    if (modalName === 'watch-video') {
        const confirmBtn = modal.querySelector('[data-action="confirm-task"]');
        const startBtn = modal.querySelector('[data-action="start-video"]');
        
        // Reset state
        if (confirmBtn) confirmBtn.disabled = true;
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Watch Now';
        }

        let state = getState();
        if (state.tasksState.completed >= TASK_LIMIT) {
             startBtn.disabled = true;
             startBtn.textContent = 'দৈনিক লিমিট শেষ';
             modal.querySelector('.modal-body').textContent = 'দুঃখিত, আপনি আজকের জন্য নির্ধারিত সব ভিডিও টাস্ক সম্পন্ন করে ফেলেছেন। আগামীকাল আবার ফিরে আসুন! 🎉';
        } else {
             modal.querySelector('.modal-body').textContent = 'ভিডিও দেখা শুরু করতে "Watch Now" বাটনে ক্লিক করুন এবং অপেক্ষা করুন। টাস্ক সম্পন্ন হলে "Complete" বাটনটি চালু হবে।';
        }
    }
    
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add('modal-open');
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    
    // Clear any running timers if it's the video modal
    if (modalEl.id === 'modal-watch-video' && window.videoTimer) {
        clearTimeout(window.videoTimer);
        window.videoTimer = null;
        // Reset buttons to prevent incomplete task completion
        const confirmBtn = modalEl.querySelector('[data-action="confirm-task"]');
        const startBtn = modalEl.querySelector('[data-action="start-video"]');
        if (confirmBtn) confirmBtn.disabled = true;
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Watch Now';
        }
    }
    
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove('modal-open');
  }

  /**
   * FIX: Handles the Daily Check task directly from the Home screen.
   * Checks for the once-per-day limit and completes the task immediately or shows an alert.
   */
  function handleDailyCheckTask() {
      const state = getState();
      
      if (state.homeTaskDoneState.done) {
          showCustomAlert("দুঃখিত! আজকের ডেইলি টাস্কটি আপনি একবার সম্পন্ন করেছেন। পরবর্তী টাস্কের জন্য আগামীকাল অপেক্ষা করুন। 😊");
          return;
      }
      
      // If not done, immediately complete the task
      completeTask(TASK_DAILY_CHECK);
  }

  /**
   * Starts the video ad process (renamed and logic simplified).
   */
  function startVideoAd(startBtn) {
    const duration = parseInt(startBtn.dataset.duration || 15);
    const modal = startBtn.closest(".modal");
    const confirmBtn = modal.querySelector('[data-action="confirm-task"]');
    
    let state = getState();
    if (state.tasksState.completed >= TASK_LIMIT) {
        showCustomAlert("দৈনিক টাস্ক লিমিট শেষ। 😔 আজকের মতো আপনার সব কাজ সম্পন্ন হয়েছে।");
        startBtn.disabled = true;
        return;
    }

    startBtn.disabled = true;
    startBtn.textContent = ` ${duration} সেকেন্ড অপেক্ষা করুন...`;
    
    confirmBtn.disabled = true; // Ensure confirmation is disabled

    // --- Video Ad SDK Logic (renamed to avoid "monetag") ---
    
    // Check if the external ad SDK is available (assuming 'window.showAd' or similar)
    if (window.showAd) { 
        window.showAd().then(() => {
            // Ad successful, start the timer
            window.videoTimer = setTimeout(() => {
                confirmBtn.disabled = false;
                startBtn.textContent = 'ভিডিও দেখা সম্পন্ন';
                startBtn.disabled = true; // Disable Start button permanently until modal re-opened
                showCustomAlert('বিজ্ঞাপন দেখা শেষ! এখন "Complete" বাটনে ক্লিক করুন। ✅');
            }, duration * 1000); 
            
        }).catch((error) => {
            startBtn.disabled = false;
            startBtn.textContent = 'Watch Now';
            console.error('Video Ad Error:', error);
            showCustomAlert('ভিডিও লোড হতে পারেনি। 😞 ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।');
        });
    } else {
        // Fallback: Just use the timer if SDK not loaded
        console.warn("External Ad SDK not found. Using fallback timer.");
        
        window.videoTimer = setTimeout(() => {
            confirmBtn.disabled = false;
            startBtn.textContent = 'ভিডিও দেখা সম্পন্ন';
            startBtn.disabled = true; 
            showCustomAlert('বিজ্ঞাপন দেখা শেষ! এখন "Complete" বাটনে ক্লিক করুন। ✅');
        }, duration * 1000);
    }
  }

  // --- 7. Event Binding ---

  function bindEvents() {
    document.addEventListener("click", (e) => {
      const openModalBtn = e.target.closest("[data-open-modal]");
      
      if (openModalBtn) {
          const modalName = openModalBtn.dataset.openModal;
          if (modalName === 'daily-task') {
              // Home Task (Daily Check) is now handled directly on click
              handleDailyCheckTask(); 
          } else {
              // Open standard modals (like watch-video, join-channel)
              openModal(modalName);
          }
      }
      
      const closeModalBtn = e.target.closest("[data-close-modal]");
      if (closeModalBtn) closeModal(closeModalBtn.closest(".modal"));
      
      const confirmBtn = e.target.closest('[data-action="confirm-task"]');
      if (confirmBtn && !confirmBtn.disabled) {
        completeTask(confirmBtn.dataset.task);
        closeModal(confirmBtn.closest(".modal"));
      }

      const startVideoBtn = e.target.closest('[data-action="start-video"]');
      if (startVideoBtn && !startVideoBtn.disabled) startVideoAd(startVideoBtn);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const activeModal = $('[aria-hidden="false"].modal');
        if (activeModal) closeModal(activeModal);
      }
    });
  }
  
  // --- 8. Initialization ---
  
  function init() {
    // Hide preloader
    if (els.preloader) els.preloader.classList.add("hidden");
    if (els.app) els.app.setAttribute("aria-hidden", "false");

    // Load and render initial state
    const state = getState();
    updateUI(state);
    
    // Bind all interactive events
    bindEvents();
  }
  
  document.addEventListener("DOMContentLoaded", init);
})();
