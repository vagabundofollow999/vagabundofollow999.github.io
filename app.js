const usersJSONurl = "https://vagabundofollow999.github.io/users.json";
let users = [];
let player;

// Cargar usuarios
async function loadUsers(){
    const resp = await fetch(usersJSONurl + "?v=" + Date.now());
    users = await resp.json();
}

// EVENTOS
const events = {
    "1": {
        mpd: "https://d3kzwqwnq1f7tq.cloudfront.net/out/v1/25ca218d53194065bedf6d998ace462e/index.mpd?dvr_window_length=30",
        key: "1c62a216a5fe423f959cb1ca02f62d83",
        value: "54f2fdc83c1da33cd9269bf21e08218c"
    }
};

// INIT PLAYER CON DISEÑO
async function initPlayer(){
    const video = document.getElementById("youtube-theme");

    if (!video["ui"]) {
        new shaka.ui.Overlay(new shaka.Player(video), video.parentElement, video);
    }

    const ui = video["ui"];

    ui.configure({
        seekBarColors: {
            base: "rgba(255,255,255,.2)",
            buffered: "rgba(255,255,255,.4)",
            played: "red"
        }
    });

    const controls = ui.getControls();
    player = controls.getPlayer();

    player.addEventListener("error", e=>{
        console.error(e);
        alert("Error en el stream");
    });
}

// RESPONSIVE
function adaptPlayer(){
    const v = document.getElementById("youtube-theme");
    const w = window.innerWidth;

    if(w < 768){
        v.style.objectFit="contain";
    } else {
        v.style.objectFit="cover";
    }
}

// PLAY
async function playEvent(id){
    const ev = events[id];
    document.getElementById("event-selector").style.display="none";
    document.getElementById("player-container").style.display="flex";

    if(!player) await initPlayer();

    player.configure({ drm:{ clearKeys:{ [ev.key]:ev.value } } });
    await player.load(ev.mpd);

    adaptPlayer();
    openFullscreen();
}

// FULLSCREEN
function openFullscreen(){
    const v=document.getElementById("youtube-theme");
    if(v.requestFullscreen) v.requestFullscreen();
}

// EXIT
async function exitPlayer(){
    if(player) await player.unload();
    document.getElementById("player-container").style.display="none";
    document.getElementById("event-selector").style.display="flex";
}

// LOGIN
async function login(){
    await loadUsers();
    const u=document.getElementById("username").value;
    const p=document.getElementById("password").value;
    const d=document.getElementById("deviceId").value;

    const f=users.find(x=>x.user===u && x.pass===p && x.device===d);
    if(!f){ document.getElementById("login-error").innerText="Error"; return;}

    localStorage.setItem("sessionUser",u);
    document.getElementById("login-container").style.display="none";
    document.getElementById("event-selector").style.display="flex";
}

// LOGOUT
function logout(){
    localStorage.clear();
    location.reload();
}

// INIT
window.onload=async ()=>{
    await loadUsers();
    if(localStorage.getItem("sessionUser")){
        document.getElementById("login-container").style.display="none";
        document.getElementById("event-selector").style.display="flex";
    }
};

window.addEventListener("resize",adaptPlayer);