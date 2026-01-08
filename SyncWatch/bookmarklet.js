// SyncWatch Bookmarklet Payload
(async function () {
    console.log("🚀 SyncWatch Injecting...");

    // 1. Load Firebase SDKs
    if (!window.firebase) {
        await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js");
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    const firebaseConfig = {
        apiKey: "AIzaSyCoV6nEmjFgh8NpIt0DQVWfs9Sg-sKcl7A",
        authDomain: "syncwatch-cfebe.firebaseapp.com",
        projectId: "syncwatch-cfebe",
        storageBucket: "syncwatch-cfebe.firebasestorage.app",
        messagingSenderId: "190048428128",
        appId: "1:190048428128:web:759b08e4d0d1f096c5a305",
        measurementId: "G-YZZKB5LVF3"
    };

    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'fixed', bottom: '20px', right: '20px',
        width: '250px', padding: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', color: 'white',
        borderRadius: '12px', zIndex: '999999',
        fontFamily: 'sans-serif', boxShadow: '0 0 15px rgba(0,0,0,0.5)',
        border: '1px solid #3b82f6'
    });
    panel.innerHTML = `
        <h3 style="margin:0 0 10px 0;color:#60a5fa">SyncWatch Overlay</h3>
        <input id="sw-room" placeholder="Enter Room Code" style="width:100%;padding:5px;margin-bottom:10px;background:#333;border:1px solid #555;color:white">
        <button id="sw-conn" style="width:100%;padding:8px;background:#3b82f6;border:none;border-radius:4px;color:white;cursor:pointer">Connect</button>
        <div id="sw-status" style="margin-top:10px;font-size:12px;color:#aaa">Ready to connect...</div>
    `;
    document.body.appendChild(panel);

    const roomInput = panel.querySelector('#sw-room');
    const connectBtn = panel.querySelector('#sw-conn');
    const statusDiv = panel.querySelector('#sw-status');

    const savedRoom = localStorage.getItem('sw_last_room');
    if (savedRoom) roomInput.value = savedRoom;

    let currentRoomId = null;
    let userId = Math.random().toString(36).substring(2, 8);
    let videoEl = document.querySelector('video');
    let isRemoteUpdate = false;

    setInterval(() => {
        if (!videoEl) {
            videoEl = document.querySelector('video');
            if (videoEl) statusDiv.textContent = "Video found! Connect to sync.";
        }
    }, 2000);

    connectBtn.onclick = () => {
        const roomId = roomInput.value.trim().toUpperCase();
        if (!roomId) return alert("Enter a room code!");

        currentRoomId = roomId;
        localStorage.setItem('sw_last_room', roomId);
        connectToRoom(roomId);
        connectBtn.disabled = true;
        connectBtn.textContent = "Connected";
        panel.style.border = '1px solid #22c55e';
    };

    function connectToRoom(roomId) {
        statusDiv.textContent = `Joined Room: ${roomId}`;

        const roomRef = db.ref(`rooms/${roomId}`);

        roomRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) syncVideo(data);
        });

        if (videoEl) attachListeners();
    }

    function attachListeners() {
        if (!videoEl) return;

        videoEl.addEventListener('play', () => sendUpdate('playing'));
        videoEl.addEventListener('pause', () => sendUpdate('paused'));
        videoEl.addEventListener('seeked', () => sendUpdate(videoEl.paused ? 'paused' : 'playing'));
        statusDiv.textContent = "Synced & Ready!";
    }

    function sendUpdate(state) {
        if (isRemoteUpdate) return;

        db.ref(`rooms/${currentRoomId}`).update({
            state: state,
            currentTime: videoEl.currentTime,
            lastUpdatedBy: userId,
            timestamp: Date.now()
        });
    }

    function syncVideo(data) {
        if (!videoEl) return;
        if (data.lastUpdatedBy === userId) return;
        if (Date.now() - data.timestamp > 2000) return;

        isRemoteUpdate = true;
        const tolerance = 0.5;

        if (Math.abs(videoEl.currentTime - data.currentTime) > tolerance) {
            videoEl.currentTime = data.currentTime;
        }

        if (data.state === 'playing' && videoEl.paused) {
            videoEl.play().catch(e => console.log("Autoplay blocked"));
        } else if (data.state === 'paused' && !videoEl.paused) {
            videoEl.pause();
        }

        statusDiv.textContent = `Remote: ${data.state.toUpperCase()}`;
        setTimeout(() => isRemoteUpdate = false, 500);
    }
})();
