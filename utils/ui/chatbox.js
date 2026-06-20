const chatboxContainer = document.getElementById('chatbox-container');
const chatboxName = document.getElementById('chatbox-name');
const chatboxText = document.getElementById('chatbox-text');
const chatboxImg = document.getElementById('chatbox-img');

let currentOnClose = null;

export function openChatbox(name, text, imageSrc, onClose) {
    chatboxName.innerText = name;
    chatboxText.innerText = text;
    if (imageSrc) chatboxImg.src = imageSrc;
    chatboxContainer.style.display = 'flex';
    currentOnClose = onClose || null;
}

chatboxContainer.addEventListener('click', () => {
    chatboxContainer.style.display = 'none';
    currentOnClose?.();
});