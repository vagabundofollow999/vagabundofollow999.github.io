const usersJSONurl = "https://vagabundofollow999.github.io/users.json";
let users = [];

async function loadUsers() {
    try {
        const resp = await fetch(usersJSONurl + "?v=" + Date.now());
        users = await resp.json();
    } catch(e) {
        console.error("Error cargando usuarios:", e);
    }
}

const events = {
    "1": { mpd: "https://d3kzwqwnq1f7tq.cloudfront.net/out/v1/25ca218d53194065bedf6d998ace462e/index.mpd?dvr_window_length=30", key: "1c62a216a5fe423f959cb1ca02f62d83", value: "54f2fdc83c1da33cd9269bf21e08218c" },
    "2": { mpd: "URL_EVENTO2", key: "KEY2", value: "VAL2" },
    "3": { mpd: "", key: "", value: "" }
};

let player;

async function initPlayer() {
    const video = document.getElementById("youtube-theme");
    if (!video["ui"]) new shaka.ui.Overlay(new shaka.Player(video), video.parentElement, video);
    const ui = video["ui"];
    const controls = ui.getControls();
    player = controls.getPlayer();

    const videoContainer = document.querySelector(".shaka-video-container");
    const overflowContainer = document.querySelector(".shaka-overflow-container");
    if(videoContainer) Object.assign(videoContainer.style, { width:"100%", height:"100%", display:"flex", justifyContent:"center", alignItems:"center", margin:"0 auto" });
    if(overflowContainer) Object.assign(overflowContainer.style, { width:"100%", height:"100%", display:"flex", justifyContent:"center", alignItems:"center", margin:"0 auto" });

    player.addEventListener('error', (e) => {
        console.error('Shaka Error:', e.detail);
        alert("Error al cargar el evento");
        exitPlayer();
    });
}

function openFullscreen() {
    const video = document.getElementById("youtube-theme");
    if(video.requestFullscreen) video.requestFullscreen();
    else if(video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    else if(video.msRequestFullscreen) video.msRequestFullscreen();
    video.style.objectFit = "cover";
}

async function playEvent(id) {
    const ev = events[id];
    if(!ev.mpd) { alert("Evento no disponible"); return; }

    document.getElementById("event-selector").style.display = "none";
    document.getElementById("player-container").style.display = "flex";

    if (!player) await initPlayer();
    player.configure({ drm: { clearKeys: { [ev.key]: ev.value } } });
    await player.load(ev.mpd);
    openFullscreen();
}

async function exitPlayer() {
    if(player) await player.unload();
    document.getElementById("player-container").style.display = "none";
    document.getElementById("event-selector").style.display = "flex";
}

async function login() {
    await loadUsers();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const deviceId = document.getElementById("deviceId").value.trim();
    const error = document.getElementById("login-error");

    const found = users.find(u => u.user === username && u.pass === password && u.device === deviceId);
    if (!found) { error.textContent = "Credenciales incorrectas"; return; }

    const today = new Date().toISOString().split("T")[0];
    if (today > found.expire) { error.textContent = "Acceso vencido"; return; }

    localStorage.setItem("sessionUser", username);
    document.getElementById("login-container").style.display = "none";
    document.getElementById("event-selector").style.display = "flex";
}

function logout() {
    localStorage.removeItem("sessionUser");
    document.getElementById("login-container").style.display = "flex";
    document.getElementById("event-selector").style.display = "none";
    document.getElementById("player-container").style.display = "none";
}

window.onload = async function() {
    await loadUsers();
    const session = localStorage.getItem("sessionUser");
    if(session){
        document.getElementById("login-container").style.display = "none";
        document.getElementById("event-selector").style.display = "flex";
    }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js');
    }
};