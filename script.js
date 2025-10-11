/*
  Grand App - v3 (Final Home)
  Main JavaScript file for the home screen.
  
  *** আপডেটের সারসংক্ষেপ: ***
  1. FIX: Telegram User Data Acquisition (ইউজারনেম এবং নাম ইনপুট নেওয়ার সমস্যা সমাধান করা হয়েছে)।
  2. Dynamic Avatar System: ইউজারের নাম থেকে আদ্যক্ষর ও ডায়নামিক কালার জেনারেট করে UI-তে বসানো হয়েছে।
  3. Reward Automation: অ্যাড দেখা শেষ হলে "Complete" বাটনে ক্লিক করার দরকার নেই, স্বয়ংক্রিয়ভাবে পুরষ্কার যোগ হবে।
*/

// Using an IIFE (Immediately Activated Function Expression) to avoid polluting the global scope.
(() => {
  "use strict";

  // --- 1. Helper Functions ---
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  // --- NEW: Dynamic Color Generation for Avatar ---
  function getHashColor(str) {
    let hash = 0;
    // Hash the string
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate HSL color (light and soft tones)
    let hue = hash % 360; 
    let saturation = 50; // Less vibrant
    let lightness = 55;  // Slightly bright
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  // --- NEW: Get User Initials ---
  function getUserInitials(firstName, lastName) {
      const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
  }
  
  // --- NEW: Load Telegram User Data (FIXED) ---
  function getTelegramUserData() {
    let userData = {
      id: 0,
      first_name: "ইউজারের",
      last_name: "নাম",
      username: "@username", // Updated fallback username format
    };

    // Check if Telegram WebApp is initialized and user data is available
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        
        userData.id = tgUser.id;
        // FIX: Ensure both first_name and last_name are correctly retrieved.
        userData.first_name = tgUser.first_name || "ইউজার";
        userData.last_name = tgUser.last_name || "";
        
        // FIX: Ensure username is displayed with '@' if available, or a fallback is used.
        userData.username = tgUser.username ? `@${tgUser.username}` : "(No Username)"; 
    } else {
        // Fallback for testing outside Telegram Mini App environment
        console.warn("Telegram WebApp data not found. Using fallback data.");
    }
    
    // Process Initials and Color
    userData.initials = getUserInitials(userData.first_name, userData.last_name);
    // Use the full name or ID for a consistent color hash
    userData.avatarColor = getHashColor(`${userData.first_name}${userData.last_name}${userData.id}`); 
    
    return userData;
  }
  

  // --- 2. DOM Element Cache ---
  const els = {
    preloader: $("#preloader"),
    app: $("#app"),
    userName: $("#user-name"),
    userUsername: $("#user-username"),
    userAvatar: $("#user-avatar"), // এখন এটি একটি div
    balanceAmount: $("#balance-amount"),
    tasksToday: $("#tasks-today"), // Home page stat
    referralsCount: $("#referrals-count"),
    homeTaskBtn: $('[data-task-type="home-daily"]'), 
  };

  // --- 3. State Management & localStorage ---
  const STORE_KEYS = {
    balance: "grand_balance_v3",
    tasks: "grand_tasks_v3",
    referrals: "grand_referrals_v3",
    homeTaskDone: "grand_home_task_done_v3",
  };
  
  const TASK_LIMIT = 20; // মোট দৈনিক টাস্ক লিমিট
  const TASK_REWARD = 1.00;
  
  // Custom alert function (to keep consistency without structural changes)
  function showCustomAlert(message) {
    alert(message);
  }

  function getState() {
    const today = new Date().toDateString();
    
    let balance = parseFloat(localStorage.getItem(STORE_KEYS.balance)) || 0.00;
    let referrals = parseInt(localStorage.getItem(STORE_KEYS.referrals)) || 0;
    
    let tasksState = JSON.parse(localStorage.getItem(STORE_KEYS.tasks)) || { date: today, completed: 0 };
    let homeTaskDoneState = JSON.parse(localStorage.getItem(STORE_KEYS.homeTaskDone)) || { date: today, done: false };

    // --- Daily Reset Logic ---
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
    // ** টেলিগ্রাম ডেটা লোড করা **
    const USER_DATA = getTelegramUserData();

    // Display Name and Username
    // trim() ব্যবহার করা হয়েছে যাতে শুধুমাত্র first_name থাকলে অতিরিক্ত স্পেস না থাকে
    const fullName = `${USER_DATA.first_name} ${USER_DATA.last_name}`.trim();
    if (els.userName) els.userName.textContent = fullName || "ইউজার"; 
    if (els.userUsername) els.userUsername.textContent = USER_DATA.username;
    
    // ** ডায়নামিক অ্যাভাটার রেন্ডার করা **
    if (els.userAvatar) {
        els.userAvatar.textContent = USER_DATA.initials;
        els.userAvatar.style.backgroundColor = USER_DATA.avatarColor;
    }

    if (els.balanceAmount) els.balanceAmount.textContent = state.balance.toFixed(2);
    if (els.referralsCount) els.referralsCount.textContent = state.referrals;
    
    const taskCounterText = `${state.tasksState.completed}/${TASK_LIMIT}`;
    
    // For Home Page (index.html)
    if (els.tasksToday) {
      els.tasksToday.textContent = taskCounterText;
    }
    
    // For Task Page (task.html)
    const taskLimitDisplay = $("#task-limit-display");
    if (taskLimitDisplay) {
        taskLimitDisplay.textContent = taskCounterText;
    }

    // --- Task completion logic and button state ---
    const isLimitReached = state.tasksState.completed >= TASK_LIMIT;
    const taskGoButtons = $$('.task-card[data-task-id="watch-video"] .btn-go');
    const homeTaskBtn = els.homeTaskBtn;

    // Handle home page specific button
    if (homeTaskBtn) {
        const isHomeTaskDone = state.homeTaskDoneState.done;
        
        if (isLimitReached) {
            homeTaskBtn.disabled = true;
            homeTaskBtn.textContent = 'দৈনিক লিমিট শেষ';
        } else if (isHomeTaskDone) {
             homeTaskBtn.disabled = true;
             homeTaskBtn.textContent = 'আজকের ডেইলি টাস্ক সম্পন্ন';
        } else {
             homeTaskBtn.disabled = false;
             homeTaskBtn.textContent = 'Watch & Earn';
        }
    }

    // Handle task page buttons (using the generic selector)
    taskGoButtons.forEach(btn => {
        // Only apply logic to buttons that are NOT the home page button
        const isHomeTask = btn.dataset.taskType === 'home-daily';
        
        if (isLimitReached) {
            btn.disabled = true;
            btn.textContent = 'দৈনিক লিমিট শেষ';
        } else if (isHomeTask && state.homeTaskDoneState.done) {
             btn.disabled = true;
             btn.textContent = 'আজকের ডেইলি টাস্ক সম্পন্ন';
        } else {
             btn.disabled = false;
             btn.textContent = isHomeTask ? 'Watch & Earn' : 'Go';
        }
    });
    
  }

  // --- 5. Core App Logic ---
  function completeTask(taskType) {
    let state = getState();

    // 1. CRITICAL: Check the total limit again
    if (state.tasksState.completed >= TASK_LIMIT) {
      showCustomAlert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ।");
      return;
    }
    
    // 2. Check if the task being completed is the HOME TASK
    if (taskType === 'home-daily' && state.homeTaskDoneState.done) {
        showCustomAlert("আপনি আজকের ডেইলি টাস্কটি একবার সম্পন্ন করেছেন।");
        return;
    }
    
    // 3. Update Balance
    state.balance += TASK_REWARD;
    
    // 4. Update Task Count (Increments the shared 0/20 limit)
    state.tasksState.completed += 1;
    
    // 5. Update Home Task State if applicable
    if (taskType === 'home-daily') {
        state.homeTaskDoneState.done = true;
        state.homeTaskDoneState.date = new Date().toDateString(); // Ensure date is updated
    }
    
    // 6. Save and Update UI
    saveState(state);
    updateUI(state);

    // Provide professional feedback
    showCustomAlert(`অসাধারণ! টাস্ক সফলভাবে সম্পন্ন হয়েছে। আপনার অ্যাকাউন্টে ৳${TASK_REWARD.toFixed(2)} যোগ করা হয়েছে। 🎉`);
  }
  
  function openModal(id, taskType) {
    const modal = $(`#${id}`);
    if (!modal) return;
    
    let state = getState();
    
    // Pre-check limits before opening modal
    if (state.tasksState.completed >= TASK_LIMIT) {
        showCustomAlert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ। আগামীকাল আবার চেষ্টা করুন।");
        return;
    }
    
    if (taskType === 'home-daily' && state.homeTaskDoneState.done) {
        showCustomAlert("আপনি আজকের ডেইলি টাস্কটি একবার সম্পন্ন করেছেন। পরবর্তী টাস্কের জন্য ২৪ ঘণ্টা অপেক্ষা করুন।");
        return;
    }
    
    // Get the start button inside the modal
    const startBtn = modal.querySelector('[data-action="start-video"]');
    
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'Watch Now';
        // Pass the task type to the start button for use in startVideoAd
        startBtn.setAttribute('data-task', taskType || 'video'); 
    }
    
    // IMPORTANT: Hide the old 'Confirm' button as reward is now automatic
    const confirmBtn = modal.querySelector('[data-action="confirm-task"]');
    if(confirmBtn) confirmBtn.style.display = 'none'; 

    modal.setAttribute("aria-hidden", "false");
    els.app.setAttribute("aria-hidden", "true");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    els.app.setAttribute("aria-hidden", "false");
    
    // Reset modal button state when closing
    const startBtn = modal.querySelector('[data-action="start-video"]');
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'Watch Now';
    }
  }


  // Function to start the Video Ad and handle completion (UPDATED FOR MONETAG show_10002890)
  function startVideoAd(startBtn) {
      const modal = startBtn.closest('.modal');
      const taskType = startBtn.dataset.task; // Get task type

      // Check limits again just in case
      let state = getState();
      if (state.tasksState.completed >= TASK_LIMIT || (taskType === 'home-daily' && state.homeTaskDoneState.done)) {
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          showCustomAlert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ।");
          return;
      }
      
      startBtn.disabled = true;
      startBtn.textContent = 'বিজ্ঞাপন লোড হচ্ছে...'; 

      // Check if the Monetag Rewarded Interstitial function is available
      if (typeof show_10002890 !== 'function') {
           startBtn.disabled = false;
           startBtn.textContent = 'Watch Now';
           showCustomAlert('বিজ্ঞাপন সিস্টেম এখনও লোড হয়নি। অনুগ্রহ করে পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।');
           console.error("Monetag SDK function show_10002890 is not available.");
           return;
      }
      
      // *** Ad SDK Call ***
      show_10002890().then(() => { 
          // 1. Reward the user directly (Ad finished successfully)
          completeTask(taskType); 
          
          startBtn.textContent = 'টাস্ক সম্পন্ন হলো! 🎉'; // Temporary feedback on the button
          
          // 2. Close the modal after a short delay for final feedback
          setTimeout(() => {
             closeModal(modal);
          }, 1500); 
          
      }).catch((error) => {
          // Ad failed to load (no reward given)
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          console.error('Video Ad Loading Error:', error);
          showCustomAlert('দুঃখিত, এই মুহূর্তে বিজ্ঞাপন লোড করা সম্ভব হয়নি। দয়া করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন। 😔');
      });
  }


  // --- 6. Event Listeners ---
  
  function bindEvents() {
    document.addEventListener("click", (e) => {
      // 1. OPEN MODAL
      const openModalBtn = e.target.closest("[data-open-modal]");
      if (openModalBtn) {
          const taskType = openModalBtn.dataset.taskType; 
          openModal(openModalBtn.dataset.openModal, taskType);
      }
      
      // 2. CLOSE MODAL
      const closeModalBtn = e.target.closest("[data-close-modal]");
      if (closeModalBtn) closeModal(closeModalBtn.closest(".modal"));
      
      // 3. START VIDEO AD
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
  
  // --- 7. Initialization ---
  
  function init() {
    // Hide preloader
    if (els.preloader) els.preloader.classList.add("hidden");
    if (els.app) els.app.setAttribute("aria-hidden", "false");

    // Load and render initial data
    const initialState = getState();
    updateUI(initialState);
    bindEvents();
  }
  
  document.addEventListener("DOMContentLoaded", init);

})();
