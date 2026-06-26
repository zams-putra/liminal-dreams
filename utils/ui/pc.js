import { returnToFollow } from '../core/cameraDirector.js';
import { state } from '../core/state.js';

const mainPC = document.querySelector('.pc-main')


export function openPc() {
    state.pcOpen = true;
    setTimeout(() => {
        // ini sesuai ama file ini cuy /core/cameraDirector di var ini: const transitionDuration = 0.9;
        // fungsinya tuh biar doi ga langsung buka terminal jadi ada jeda animasinya gitu lah
        document.getElementById("interact-button").style.display = "none";
        document.getElementById("interact-message").style.opacity = 0;
        mainPC.style.display = 'flex';
    }, 900)
}


function closePc(){
    state.pcOpen = false
    mainPC.style.display = 'none';

    // biar balik kameranya pas close
    returnToFollow()
}







// new

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// generic win manager

let zTop = 50;

function bringToFront(el){
    el.style.zIndex = ++zTop;
}

function setActiveApp(name){
    const label = document.getElementById('taskbar-label');
    label.innerHTML = name ? `<b>dreamOS</b> · ${name}` : '<b>dreamOS</b>';
}

document
    .getElementById("pc-back-btn")
    .addEventListener("click", () => {

        if(anyWindowOpen()){
            const open = [...document.querySelectorAll('.window')]
                .filter(w=>w.style.display==="flex");

            const top = open.reduce(
                (a,b)=>(+b.style.zIndex||0)>(+a.style.zIndex||0)
                    ? b
                    : a
            );

            top.querySelector('.window-close').click();
            return;
        }

        closePc();
});

function anyWindowOpen(){
    return [...document.querySelectorAll('.window')].some(w => w.style.display === 'flex');
}

function openWindow(el, appName){
    bringToFront(el);
    el.style.display = 'flex';

    if(!el.dataset.dragged){
        const r = el.getBoundingClientRect();
        el.style.left = Math.round((innerWidth - r.width) / 2) + 'px';
        el.style.top  = Math.max(24, Math.round((innerHeight - r.height) / 2 - 16)) + 'px';
    }

    setActiveApp(appName);

    if(!reduceMotion){
        el.animate([
            { opacity:0, filter:'blur(6px)', transform:'translateY(10px) scale(.97)' },
            { opacity:1, filter:'blur(0px)', transform:'translateY(0) scale(1)' }
        ], { duration:260, easing:'cubic-bezier(.16,.8,.24,1)' });
    }
}

function closeWindow(el, after){
    const finish = () => {
        el.style.display = 'none';
        if(!anyWindowOpen()) setActiveApp(null);
        after && after();
    };

    if(reduceMotion){ finish(); return; }

    const anim = el.animate([
        { opacity:1, filter:'blur(0px)', transform:'translateY(0) scale(1)' },
        { opacity:0, filter:'blur(4px)', transform:'translateY(8px) scale(.97)' }
    ], { duration:170, easing:'ease-in' });

    anim.onfinish = finish;
}

function makeDraggable(win, handle){
    let dragging = false, startX, startY, originLeft, originTop;

    handle.addEventListener('pointerdown', (e) => {
        if(e.target.closest('.window-close')) return;
        bringToFront(win);
        dragging = true;
        const rect = win.getBoundingClientRect();
        originLeft = rect.left;
        originTop = rect.top;
        startX = e.clientX;
        startY = e.clientY;
        handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', (e) => {
        if(!dragging) return;
        win.dataset.dragged = 'true';
        win.style.left = (originLeft + e.clientX - startX) + 'px';
        win.style.top  = (originTop  + e.clientY - startY) + 'px';
    });

    handle.addEventListener('pointerup', () => { dragging = false; });

    win.addEventListener('pointerdown', () => bringToFront(win));
}

document.querySelectorAll('.window').forEach(win => {
    makeDraggable(win, win.querySelector('[data-drag]'));
});

document.addEventListener("keydown", (e)=>{

    if(e.key !== "Escape") return;

    if(anyWindowOpen()){
        const open = [...document.querySelectorAll('.window')]
            .filter(w=>w.style.display==="flex");

        const top = open.reduce(
            (a,b)=>(+b.style.zIndex||0)>(+a.style.zIndex||0)
                ? b
                : a
        );

        top.querySelector('.window-close').click();
        return;
    }

    if(state.pcOpen){
        closePc();
    }
});

// terminal app

const terminalOverlay = document.getElementById("terminal-overlay");
const terminalOutput  = document.getElementById("terminal-output");
const terminalInput   = document.getElementById("terminal-input");

const terminalFiles = {
    "note.txt": "sunyi.",
    "access.log": "[02:14] sunyi\n[02:41] hening.",
    "dream.txt": "you are not supposed to be here."
};

const commands = {

    help: () => `
help       show commands
ls         list files
cat file   read file
whoami     current user
clear      clear terminal
exit       close terminal
`,

    ls: () => Object.keys(terminalFiles).join("    "),

    whoami: () => "guest@dream",

    clear: () => {
        terminalOutput.innerHTML = "";
        return null;
    },

    exit: () => {
        closeTerminal();
        return null;
    }
};

function print(text, type = 'out'){
    if(text === null || text === undefined) return;
    const div = document.createElement("div");
    div.className = `term-line term-${type}`;
    div.textContent = text;
    terminalOutput.appendChild(div);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    if(!reduceMotion){
        div.animate([{ opacity:0, transform:'translateY(2px)' }, { opacity:1, transform:'translateY(0)' }],
                     { duration:140, easing:'ease-out' });
    }
}

function runCommand(raw){

    const input = raw.trim();

    print(`> ${input}`, 'cmd');

    let result;

    if(input.startsWith("cat ")){

        const file = input.slice(4).trim();

        result =
            terminalFiles[file] ||
            `cat: ${file}: No such file`;

    }
    else if(commands[input]){

        result = commands[input]();

    }
    else if(input === ""){

        result = null;

    }
    else{

        result = `command not found: ${input}`;

    }

    if(result){
        print(result, 'out');
    }
}

function submitInput(){
    const value = terminalInput.value;
    if(!value.trim()) return;
    runCommand(value);
    terminalInput.value = "";
}

function openTerminal(){
    openWindow(terminalOverlay, 'Terminal');
    if(terminalOutput.childElementCount === 0){
        print("connected...", 'out');
        print("type 'help' for command list.", 'out');
    }
    terminalInput.focus();
}

function closeTerminal(){
    closeWindow(terminalOverlay);
}

document.getElementById("open-terminal").addEventListener("click", openTerminal);
document.getElementById("terminal-close").addEventListener("click", closeTerminal);
document.getElementById("terminal-send").addEventListener("click", submitInput);

terminalInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter") submitInput();
});


// notes app

const notesOverlay = document.getElementById('notes-overlay');

function openNotes(){ openWindow(notesOverlay, 'Notes'); }
function closeNotes(){ closeWindow(notesOverlay); }

document.getElementById('open-notes').addEventListener("click", openNotes);
document.getElementById('notes-close').addEventListener("click", closeNotes);


// chat app

const chatOverlay = document.getElementById('chat-overlay');

function openChat(){
    openWindow(chatOverlay, 'Chat');
    if(!reduceMotion){
        document.querySelectorAll('.bubble').forEach((b, i) => {
            b.animate([
                { opacity:0, transform:'translateY(6px) scale(.96)' },
                { opacity:1, transform:'translateY(0) scale(1)' }
            ], { duration:240, delay:150 + i * 90, easing:'cubic-bezier(.16,.8,.24,1)', fill:'both' });
        });
    } else {
        document.querySelectorAll('.bubble').forEach(b => b.style.opacity = 1);
    }
}

function closeChat(){ closeWindow(chatOverlay); }

document.getElementById('open-chat').addEventListener("click", openChat);
document.getElementById('chat-close').addEventListener("click", closeChat);


// desktop entrance + clock

document.querySelectorAll('.desktop-app').forEach((icon, i) => {
    if(reduceMotion){
        icon.style.opacity = 1;
        return;
    }
    icon.animate([
        { opacity:0, transform:'translateY(14px)' },
        { opacity:1, transform:'translateY(0)' }
    ], { duration:420, delay:150 + i * 110, easing:'cubic-bezier(.16,.8,.24,1)', fill:'both' });
});

function updateClock(){
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    document.getElementById("clock").innerText = `${h}:${m}`;
}

updateClock();
setInterval(updateClock, 1000);