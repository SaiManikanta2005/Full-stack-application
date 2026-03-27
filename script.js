const API_URL = 'http://localhost:3000';

// Element references
const loginForm = document.getElementById('login-form');
const regForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const regError = document.getElementById('reg-error');
const subError = document.getElementById('sub-error');

// Register logic
if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const age = document.getElementById('reg-age').value;

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, age })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            alert('Registration Successful! Please login.');
            document.getElementById('register-card').classList.add('hidden');
            document.getElementById('login-card').classList.remove('hidden');
        } catch (err) {
            regError.innerText = err.message;
        }
    });
}

// Login logic
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Store user in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
                return;
            }

            if (data.user.subscription_plan === 'None') {
                window.location.href = 'subscription.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } catch (err) {
            loginError.innerText = err.message;
        }
    });
}

// Plan selection logic
async function selectPlan(planType) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, plan: planType })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Update local storage user data
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(`Successfully subscribed to ${planType} plan!`);
        window.location.href = 'dashboard.html';

    } catch (err) {
        if(subError) subError.innerText = err.message;
        else alert(err.message);
    }
}

// Dashboard Loader Logic
async function loadDashboard() {
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (!localUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/user/${localUser.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        const user = data.user;
        localStorage.setItem('user', JSON.stringify(user));

        if(user.subscription_plan === 'None') {
            alert('You must select a plan to view content!');
            window.location.href = 'subscription.html';
            return;
        }

        // Setup Netflix UI Tier Check
        const badge = document.getElementById('dash-nav-plan');
        if (badge) badge.innerText = `${user.subscription_plan} PLAN`;

        const title = document.getElementById('hero-title');
        if (title) title.innerText = `Welcome back, ${user.name}!`;

        const planLevel = user.subscription_plan === 'PREMIUM' ? 3 : (user.subscription_plan === 'PRO' ? 2 : (user.subscription_plan === 'FREE' ? 1 : 0));

        // Generate rows
        function renderRow(containerId, count, requiredLevel, imagesStart) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = '';
            for(let i=0; i<count; i++) {
                const isLocked = planLevel < requiredLevel;
                const imgUrl = `https://picsum.photos/seed/${imagesStart+i}/300/170`;
                const card = document.createElement('div');
                card.className = 'video-card';
                card.innerHTML = `
                    <img src="${imgUrl}" alt="Thumbnail">
                    ${isLocked ? '<div class="lock-overlay"><i class="fa-solid fa-lock"></i><br>Upgrade required</div>' : '<div class="play-overlay"><i class="fa-solid fa-circle-play"></i></div>'}
                `;
                
                if(!isLocked) {
                   card.onclick = () => playVideo();
                } else {
                   card.onclick = () => { 
                       alert('Please upgrade your plan to watch this exclusive content.'); 
                       window.location.href='subscription.html'; 
                   }
                }
                container.appendChild(card);
            }
        }

        renderRow('row-free', 8, 1, 100);
        renderRow('row-pro', 8, 2, 200);
        renderRow('row-premium', 8, 3, 300);

    } catch (err) {
        console.error("Dashboard error", err);
        alert('Session expired or error loading profile. Please login again.');
        logout();
    }
}

// Logout logic
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Video modal logic
function playVideo() {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('app-video-player');
    const closeBtn = document.getElementById('close-modal-btn');
    const waitMsg = document.getElementById('wait-msg');
    
    if(modal && player) {
        modal.classList.remove('hidden');
        player.currentTime = 0;
        player.play();
        
        if (closeBtn && waitMsg) {
            closeBtn.style.display = 'none';
            waitMsg.style.display = 'inline-block';
            
            let timeLeft = 10;
            waitMsg.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right:5px;"></i> (Unlocks in ${timeLeft}s...)`;
            
            const timer = setInterval(() => {
                timeLeft--;
                if(timeLeft > 0) {
                    waitMsg.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right:5px;"></i> (Unlocks in ${timeLeft}s...)`;
                } else {
                    clearInterval(timer);
                    waitMsg.style.display = 'none';
                    closeBtn.style.display = 'inline-block';
                }
            }, 1000);
        }
    } else {
        alert("Playing media in full screen...");
    }
}

function closeVideo() {
    const modal = document.getElementById('video-modal');
    const player = document.getElementById('app-video-player');
    if(modal && player) {
        player.pause();
        modal.classList.add('hidden');
    }
}

// Profile Editing Logic
function toggleEditProfile() {
    const displayDiv = document.getElementById('profile-display');
    const form = document.getElementById('edit-profile-form');
    const btn = document.getElementById('edit-profile-btn');
    
    if (form.classList.contains('hidden')) {
        form.classList.remove('hidden');
        displayDiv.classList.add('hidden');
        btn.classList.add('hidden');
        
        // Populate inputs
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('edit-name').value = user.name;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-age').value = user.age;
        }
    } else {
        form.classList.add('hidden');
        displayDiv.classList.remove('hidden');
        btn.classList.remove('hidden');
    }
}

const editForm = document.getElementById('edit-profile-form');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const name = document.getElementById('edit-name').value;
        const email = document.getElementById('edit-email').value;
        const age = document.getElementById('edit-age').value;
        const errorDiv = document.getElementById('edit-error');
        
        try {
            const res = await fetch(`${API_URL}/user/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, age })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Update local storage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update display
            document.getElementById('set-name').innerText = data.user.name;
            document.getElementById('set-email').innerText = data.user.email;
            document.getElementById('set-age').innerText = data.user.age;
            
            // Close form
            toggleEditProfile();
            alert('Profile updated successfully!');
        } catch (err) {
            errorDiv.innerText = err.message;
        }
    });
}

// Dark Mode Logic
function toggleDarkMode(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
}

// Initialize Dark Mode on all pages
(function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
    
    // If we're on a page with the toggle switch, update its visual state
    window.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) {
            toggle.checked = isDark;
        }
    });
})();

// Chat Logic for Support Page
function openChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.remove('hidden');
    }
}

function closeChat() {
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.add('hidden');
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const message = input.value.trim();
    if (!message) return;

    const messagesContainer = document.getElementById('chat-messages');

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message sent fade-in';
    userMsg.innerText = message;
    messagesContainer.appendChild(userMsg);
    input.value = '';
    
    // Auto scroll
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Simulate agent typing and response
    setTimeout(() => {
        const agentMsg = document.createElement('div');
        agentMsg.className = 'message received fade-in';
        
        const lowerMsg = message.toLowerCase();
        let reply = "I'm a virtual assistant. How can I further assist you today?";
        
        if (lowerMsg.includes('upgrade') || lowerMsg.includes('plan')) {
            reply = "You can upgrade your plan by visiting the 'Upgrade' section in your dashboard. Would you like me to guide you there?";
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            reply = "Hello there! How can I help you with your ProStar account today?";
        } else if (lowerMsg.includes('cancel') || lowerMsg.includes('refund')) {
            reply = "I understand you want to discuss cancellations. Please call our 24/7 helpline at 1800-PRO-STAR for assistance with this.";
        } else if (lowerMsg.includes('thank')) {
            reply = "You're welcome! Have a great day!";
        } else if (lowerMsg.includes('password') || lowerMsg.includes('login')) {
            reply = "If you are having trouble logging in or need to reset your password, please go to the Settings page and click 'Reset Password'.";
        }

        agentMsg.innerText = reply;
        messagesContainer.appendChild(agentMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}
