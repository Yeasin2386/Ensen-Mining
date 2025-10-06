/*
  Grand App - v3 (Final Home)
  Main JavaScript file for the home screen.
  
  Updates:
  - Adjusted to match new header structure.
  - Updated stats logic for "Today's Tasks" (Total Completed removed).
  - Added support for Task Page's limit display.
  - Kept modal and task completion logic.
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
      join: $("#modal-join-channel"),
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
  
  // Get all task definitions from the HTML.
  const tasksFromDOM = $$(".task-card").map(card => ({
    id: card.dataset.taskId,
    reward: Number(card.dataset.reward || 0),
    duration: card.dataset.duration ? Number(card.dataset.duration) : null,
    goButton: card.querySelector(".btn-go"),
  }));

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
   * **UPDATED** - Synchronizes tasks and calculates new stats (Removed total completed count).
   */
  function syncTasksAndStats() {
    // let totalCompletedCount = 0; // Removed
    let todayCompletedCount = 0;
    
    // Helper to check if a timestamp is from today
    const isToday = (ts) => {
        if (!ts) return false;
        const today = new Date();
        const otherDate = new Date(ts);
        return today.getFullYear() === otherDate.getFullYear() &&
               today.getMonth() === otherDate.getMonth() &&
               today.getDate() === otherDate.getDate();
    };

    tasksFromDOM.forEach(task => {
      if (!tasksState[task.id]) {
        tasksState[task.id] = { status: "pending", completed_at: null };
      }
      
      const taskState = tasksState[task.id];
      const isCompleted = taskState.status === "completed";
      
      if (isCompleted) {
        task.goButton.textContent = "Done";
        task.goButton.disabled = true;
        // totalCompletedCount++; // Removed
        // Check if it was completed today
        if (isToday(taskState.completed_at)) {
            todayCompletedCount++;
        }
      } else {
        task.goButton.textContent = "Go";
        task.goButton.disabled = false;
      }
    });

    store.set(STORE_KEYS.tasks, tasksState);
    updateStatsUI(todayCompletedCount, 0); // Passing 0 for totalCount (now unused)
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
    
    // Update on Task Page (new element)
    if (els.tasksTodayPage) els.tasksTodayPage.textContent = taskLimitText;

    if (els.referralsCount) els.referralsCount.textContent = store.get(STORE_KEYS.referrals, 0);
  }

  function completeTask(taskId) {
    const taskState = tasksState[taskId];
    const taskDef = tasksFromDOM.find(t => t.id === taskId);

    if (taskState.status === "completed" || !taskDef) return;

    taskState.status = "completed";
    taskState.completed_at = Date.now(); // Store completion timestamp
    balance += taskDef.reward;

    store.set(STORE_KEYS.tasks, tasksState);
    store.set(STORE_KEYS.balance, balance);

    syncTasksAndStats();
  }

  // --- 5. Modal & Task-Specific Logic (Remains mostly the same) ---
  
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

  function startVideoTimer(startBtn) {
    const duration = Number(startBtn.dataset.duration || 15);
    let timeLeft = duration;
    
    startBtn.disabled = true;

    videoTimer = setInterval(() => {
      timeLeft--;
      startBtn.textContent = `Waiting ${timeLeft}s...`;
      
      if (timeLeft <= 0) {
        clearInterval(videoTimer);
        videoTimer = null;
        startBtn.textContent = "Finished";
        const modal = startBtn.closest(".modal");
        const completeBtn = modal.querySelector('[data-action="confirm-task"]');
        completeBtn.disabled = false;
      }
    }, 1000);
  }

  // --- 6. Event Listeners (Remains the same) ---
  
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
      if (startVideoBtn && !startVideoBtn.disabled) startVideoTimer(startVideoBtn);
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
