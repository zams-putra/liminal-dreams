const loadingScreen = document.getElementById('loading-screen');
const loadingStatus = document.getElementById('loading-status');
const startBtn = document.getElementById('start-btn');
const bgMusic = document.getElementById('bg-music');

export function initLoadingScreen() {
    loadingStatus.innerText = "Ready.";
    startBtn.style.display = "block";
    startBtn.addEventListener('click', () => {
        bgMusic.volume = 1;
        bgMusic.play().catch(error => console.log("Audio play blocked:", error));
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.remove();
        }, 1500);
    });
}