import { state } from '../core/state.js';

const terminalOverlay = document.getElementById('terminal-overlay');
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');
const terminalClose = document.getElementById('terminal-close');
const terminalSend = document.getElementById('terminal-send');

const terminalFiles = {
    'note.txt': 'sunyi"',
    'access.log': '[02:14] sunyi\n[02:41] hening.'
};

const terminalCommands = {
    help: () => `
ls - list your files
cat [file] - read file
whoami - who i am
clear - clear your terminal
exit - exit terminal
    `,
    ls: () => Object.keys(terminalFiles).join('  '),
    whoami: () => 'guest@dream — tidak ada akses root di sini.',
    clear: () => { terminalOutput.innerHTML = ''; return null; },
    exit: () => { closeTerminal(); return null; },
};

function appendTerminalLine(text) {
    const line = document.createElement('div');
    line.innerText = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function runTerminalCommand(raw) {
    const input = raw.trim();
    let result;

    if (input.startsWith('cat ')) {
        const filename = input.slice(4).trim();
        result = terminalFiles[filename] || `cat: ${filename}: No such file or directory`;
    } else if (terminalCommands[input]) {
        result = terminalCommands[input]();
    } else if (input === '') {
        result = null;
    } else {
        result = `command not found: ${input}`;
    }

    appendTerminalLine(`> ${raw}`);
    if (result) appendTerminalLine(result);
}


function submitInput() {
    const value = terminalInput.value;
    runTerminalCommand(value);
    terminalInput.value = '';
}

export function openTerminal() {
    state.terminalOpen = true;
    terminalOverlay.style.display = 'flex';
    terminalOutput.innerHTML = '';
    appendTerminalLine('connected...');
    appendTerminalLine("ketik 'help' untuk help.");
    terminalInput.value = '';
    terminalInput.focus();
}

function closeTerminal() {
    state.terminalOpen = false;
    terminalOverlay.style.display = 'none';
    terminalInput.blur();
}


terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        submitInput();
    } else if (e.code === 'Escape') {
        closeTerminal();
    }
});


terminalInput.addEventListener('input', (e) => {
    if (e.inputType === 'insertLineBreak') {
        submitInput();
    }
});

terminalClose.addEventListener('click', closeTerminal);

terminalSend.addEventListener('click', submitInput);