// RedCast Frontend Logic
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : "https://redcast-backend-production.up.railway.app"; // Replace with your Railway URL

// Mobile Menu Toggle
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

// Tab Switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.closest('.tab-btn').classList.add('active');
    document.getElementById('progress-container').style.display = 'none';
}

// Single Download - USING DIRECT STREAMING
async function startDownload() {
    const url = document.getElementById("url").value;
    const quality = document.getElementById("quality").value;
    const mode = document.getElementById("mode").value;
    const progressContainer = document.getElementById("progress-container");
    const statusText = document.getElementById("status-text");

    if (!url) {
        alert("Please enter a URL");
        return;
    }

    const button = event.target.closest(".download-btn");
    const originalText = button.innerHTML;
    button.innerHTML = "Starting... <ion-icon name='hourglass'></ion-icon>";
    button.disabled = true;

    progressContainer.style.display = "block";
    statusText.innerText = "Connecting to server... Your download will start momentarily.";

    // CRITICAL: Use window.location.href for true streaming downloads
    const streamUrl = `${API_URL}/api/download?url=${encodeURIComponent(url)}&quality=${quality}&mode=${mode}`;

    // Redirect to stream
    window.location.href = streamUrl;

    // UI Reset after a delay (since we can't detect download start)
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        statusText.innerText = "Download should have started. Check your browser downloads!";
        setTimeout(() => { progressContainer.style.display = "none"; }, 5000);
    }, 3000);
}

let currentPlaylistVideos = [];

// Check Playlist Info
async function checkPlaylist() {
    const url = document.getElementById("playlist-url").value;
    if (!url) { alert("Please enter a playlist URL"); return; }

    const button = event.target.closest(".download-btn");
    const originalText = button.innerHTML;
    button.innerHTML = "Checking... <ion-icon name='hourglass'></ion-icon>";
    button.disabled = true;

    try {
        const res = await fetch(`${API_URL}/api/info`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        if (data.type === 'playlist') {
            document.getElementById('playlist-title').innerText = data.title;
            document.getElementById('playlist-count').innerText = `${data.count} videos found`;
            document.getElementById('playlist-info').style.display = 'block';
            document.getElementById('playlist-download-btn').style.display = 'inline-block';
            currentPlaylistVideos = data.videos;
        } else {
            // Fallback for single video
            document.getElementById('playlist-title').innerText = data.title;
            document.getElementById('playlist-count').innerText = "Single Video";
            document.getElementById('playlist-info').style.display = 'block';
            document.getElementById('playlist-download-btn').style.display = 'inline-block';
            currentPlaylistVideos = [{ url: url, title: data.title }];
        }

    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

async function downloadPlaylist() {
    if (!currentPlaylistVideos || currentPlaylistVideos.length === 0) {
        alert("No videos found in playlist.");
        return;
    }

    const quality = document.getElementById("playlist-quality").value;
    const mode = document.getElementById("playlist-mode").value;

    const confirmMsg = `You are about to download ${currentPlaylistVideos.length} videos. This will open multiple tabs. Continue?`;
    if (!confirm(confirmMsg)) return;

    currentPlaylistVideos.forEach((video, index) => {
        setTimeout(() => {
            const streamUrl = `${API_URL}/api/download?url=${encodeURIComponent(video.url)}&quality=${quality}&mode=${mode}`;
            window.open(streamUrl, '_blank');
        }, index * 1500); // 1.5s delay between triggers
    });
}

// Subtitles
async function downloadSubtitles() {
    const url = document.getElementById("subtitle-url").value;
    const lang = document.getElementById("subtitle-lang").value;
    if (!url) { alert("Please enter a URL"); return; }

    const streamUrl = `${API_URL}/api/subtitles?url=${encodeURIComponent(url)}&lang=${lang}`;
    window.location.href = streamUrl;
}

// Bulk Download
async function startBulkDownload() {
    const bulkText = document.getElementById("bulk-urls").value;
    const quality = document.getElementById("bulk-quality").value;
    const mode = document.getElementById("bulk-mode").value;
    const urls = bulkText.split('\n').filter(url => url.trim());

    if (urls.length === 0) { alert("Please enter URLs"); return; }

    alert("Bulk download will open multiple tabs/windows to start streams.");

    urls.forEach((url, index) => {
        setTimeout(() => {
            const streamUrl = `${API_URL}/api/download?url=${encodeURIComponent(url.trim())}&quality=${quality}&mode=${mode}`;
            window.open(streamUrl, '_blank');
        }, index * 1000);
    });
}
