// Import Firebase SDK (Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update, push, child, get, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyCoV6nEmjFgh8NpIt0DQVWfs9Sg-sKcl7A",
    authDomain: "syncwatch-cfebe.firebaseapp.com",
    projectId: "syncwatch-cfebe",
    storageBucket: "syncwatch-cfebe.firebasestorage.app",
    messagingSenderId: "190048428128",
    appId: "1:190048428128:web:759b08e4d0d1f096c5a305",
    measurementId: "G-YZZKB5LVF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- DOM Elements ---
const landingPage = document.getElementById('landing-page');
const roomPage = document.getElementById('room-page');
const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const roomCodeInput = document.getElementById('room-code-input');
const currentRoomCodeDisplay = document.getElementById('current-room-code');
const copyRoomBtn = document.getElementById('copy-room-btn');
const videoUrlInput = document.getElementById('video-url-input');
const loadVideoBtn = document.getElementById('load-video-btn');
const statusText = document.getElementById('status-text');
const videoPlaceholder = document.getElementById('video-placeholder');
const youtubePlayerDiv = document.getElementById('youtube-player');
const html5Player = document.getElementById('html5-player');

// --- State ---
let currentRoomId = null;
let userId = Math.random().toString(36).substring(2, 15);
let playerType = 'none'; // 'youtube', 'html5', 'none'
let ytPlayer = null;
let isRemoteUpdate = false; // Flag to prevent loops
let lastState = null; // To track last known state

// --- Event Listeners ---

createRoomBtn.addEventListener('click', () => {
    const newRoomId = generateRoomId();
    joinRoom(newRoomId);
});

joinRoomBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (code) {
        joinRoom(code);
    } else {
        alert("Please enter a room code.");
    }
});

copyRoomBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRoomId).then(() => {
        alert("Room code copied!");
    });
});

loadVideoBtn.addEventListener('click', () => {
    const url = videoUrlInput.value.trim();
    if (url) {
        changeVideo(url);
    }
});

// HTML5 Player Events
html5Player.addEventListener('play', () => handlePlayerStateChange('playing', html5Player.currentTime));
html5Player.addEventListener('pause', () => handlePlayerStateChange('paused', html5Player.currentTime));
html5Player.addEventListener('seeked', () => handlePlayerStateChange(html5Player.paused ? 'paused' : 'playing', html5Player.currentTime));


// --- Functions ---

function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function joinRoom(roomId) {
    currentRoomId = roomId;

    // UI Update
    landingPage.classList.add('hidden');
    roomPage.classList.remove('hidden');
    currentRoomCodeDisplay.textContent = roomId;

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('room', roomId);
    window.history.pushState({}, '', url);

    console.log(`Joined room: ${roomId}`);

    // Firebase Listeners
    const roomRef = ref(db, `rooms/${roomId}`);

    // Listen for state changes
    onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            syncState(data);
        }
    });

    // Handle presence (optional, but good for cleanup)
    const userRef = ref(db, `rooms/${roomId}/users/${userId}`);
    set(userRef, { online: true, lastSeen: Date.now() });
    onDisconnect(userRef).remove();
}

function syncState(data) {
    // 1. Check Video Source
    if (data.videoUrl && (data.videoUrl !== videoUrlInput.value || playerType === 'none')) {
        console.log("Remote: Video Changed", data.videoUrl);
        videoUrlInput.value = data.videoUrl;
        loadLocalPlayer(data.videoType, data.videoUrl, data.videoId);
    }

    // 2. Sync Playback
    // We only sync if the update is NOT from us (or if we are just joining)
    if (data.lastUpdatedBy === userId && (Date.now() - data.timestamp < 500)) {
        return; // Ignore our own immediate echoes
    }

    isRemoteUpdate = true;
    const tolerance = 0.5; // seconds

    if (playerType === 'youtube' && ytPlayer && ytPlayer.getPlayerState) {
        const playerState = ytPlayer.getPlayerState();
        const currentTime = ytPlayer.getCurrentTime();

        // Seek if needed
        if (Math.abs(currentTime - data.currentTime) > tolerance) {
            console.log("Remote: Seeking to", data.currentTime);
            ytPlayer.seekTo(data.currentTime, true);
        }

        // Play/Pause
        if (data.state === 'playing' && playerState !== YT.PlayerState.PLAYING) {
            console.log("Remote: Playing");
            ytPlayer.playVideo();
        } else if (data.state === 'paused' && playerState !== YT.PlayerState.PAUSED) {
            console.log("Remote: Pausing");
            ytPlayer.pauseVideo();
        }

    } else if (playerType === 'html5') {
        // Seek
        if (Math.abs(html5Player.currentTime - data.currentTime) > tolerance) {
            console.log("Remote: Seeking HTML5");
            html5Player.currentTime = data.currentTime;
        }

        // Play/Pause
        if (data.state === 'playing' && html5Player.paused) {
            console.log("Remote: Playing HTML5");
            html5Player.play().catch(e => console.log("Autoplay blocked:", e));
        } else if (data.state === 'paused' && !html5Player.paused) {
            console.log("Remote: Pausing HTML5");
            html5Player.pause();
        }
    }

    statusText.textContent = `Status: ${data.state.toUpperCase()} | Time: ${formatTime(data.currentTime)}`;

    setTimeout(() => { isRemoteUpdate = false; }, 500);
}

function changeVideo(url) {
    let type = 'html5';
    let videoId = '';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        type = 'youtube';
        videoId = extractYouTubeId(url);
    }

    // Update Firebase
    update(ref(db, `rooms/${currentRoomId}`), {
        videoUrl: url,
        videoType: type,
        videoId: videoId,
        state: 'paused',
        currentTime: 0,
        lastUpdatedBy: userId,
        timestamp: Date.now()
    });
}

function handlePlayerStateChange(state, time) {
    if (isRemoteUpdate) return;

    console.log(`Local: ${state} at ${time}`);

    update(ref(db, `rooms/${currentRoomId}`), {
        state: state,
        currentTime: time,
        lastUpdatedBy: userId,
        timestamp: Date.now()
    });
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function loadLocalPlayer(type, url, ytId) {
    playerType = type;
    videoPlaceholder.classList.add('hidden');

    if (type === 'youtube') {
        html5Player.classList.add('hidden');
        html5Player.pause();
        youtubePlayerDiv.classList.remove('hidden');

        if (ytPlayer) {
            ytPlayer.loadVideoById(ytId);
        } else {
            // Init YouTube Player
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                window.onYouTubeIframeAPIReady = () => {
                    createYouTubePlayer(ytId);
                };
            } else {
                createYouTubePlayer(ytId);
            }
        }
    } else {
        // HTML5
        youtubePlayerDiv.classList.add('hidden');
        if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo();

        html5Player.classList.remove('hidden');
        html5Player.src = url;
    }
}

function createYouTubePlayer(videoId) {
    ytPlayer = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'rel': 0,
            'origin': window.location.origin // Important for API security
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onYouTubeStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log("YouTube Player Ready");
}

function onYouTubeStateChange(event) {
    if (isRemoteUpdate) return;

    const time = event.target.getCurrentTime();
    let state = '';

    switch (event.data) {
        case YT.PlayerState.PLAYING:
            state = 'playing';
            break;
        case YT.PlayerState.PAUSED:
            state = 'paused';
            break;
        case YT.PlayerState.BUFFERING:
            // Optional: Sync buffering?
            break;
    }

    if (state) {
        handlePlayerStateChange(state, time);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Check URL params on load
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');
    if (room) {
        roomCodeInput.value = room;
    }
});
