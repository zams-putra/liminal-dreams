import { state } from '../core/state.js';

const terminalOverlay = document.getElementById('terminal-overlay');
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');

const terminalFiles = {
    'note.txt': 'sunyi"',
    'access.log': '[02:14] sunyi\n[02:41] hening.'
};

const terminalCommands = {
    help: () => 'commands: ls, cat [file], whoami, clear, exit',
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
    if (e.code === 'Enter') {
        runTerminalCommand(terminalInput.value);
        terminalInput.value = '';
    } else if (e.code === 'Escape') {
        closeTerminal();
    }
});