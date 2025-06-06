document.addEventListener("DOMContentLoaded", () => {
  // State
  let isPlaying = false
  let isConnected = false
  const trackName = "Track Name"
  const artistName = "Artist Name"
  const deviceName = "Not Connected"

  // DOM Elements
  const playButton = document.getElementById("play-button")
  const playIcon = document.getElementById("play-icon")
  const connectionToggle = document.getElementById("connection-toggle")
  const connectionStatus = document.getElementById("connection-status")
  const connectionIcon = document.getElementById("connection-icon")
  const connectionText = document.getElementById("connection-text")
  const deviceNameElement = document.getElementById("device-name")
  const trackNameElement = document.getElementById("track-name")
  const artistNameElement = document.getElementById("artist-name")
  const visualizationStatus = document.getElementById("visualization-status")
  const glowEffect = document.getElementById("glow-effect")
  const canvas = document.getElementById("visualizer")

  // Initialize icons (using SVG strings for simplicity)
  const icons = {
    play: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
    pause:
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',
    skipBack:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>',
    skipForward:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>',
    volume:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>',
    wifi: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
    wifiOff:
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
  }

  // Set initial icons
  playIcon.innerHTML = icons.play
  document.querySelector(".skip-back-icon").innerHTML = icons.skipBack
  document.querySelector(".skip-forward-icon").innerHTML = icons.skipForward
  document.querySelector(".volume-icon").innerHTML = icons.volume
  connectionIcon.innerHTML = icons.wifiOff

  // Canvas setup
  function setupCanvas() {
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }

  // Handle window resize
  window.addEventListener("resize", setupCanvas)
  setupCanvas()

  // Toggle play/pause
  playButton.addEventListener("click", () => {
    isPlaying = !isPlaying
    updatePlayState()
  })

  // Toggle connection
  connectionToggle.addEventListener("click", () => {
    isConnected = !isConnected
    updateConnectionState()
  })

  // Previous track button
  document.getElementById("previous-button").addEventListener("click", () => {
    console.log("Previous track")
  })

  // Next track button
  document.getElementById("next-button").addEventListener("click", () => {
    console.log("Next track")
  })

  // Update play state
  function updatePlayState() {
    playIcon.innerHTML = isPlaying ? icons.pause : icons.play
    visualizationStatus.textContent = isPlaying ? "Visualizing audio..." : "Press play to start visualization"

    if (isPlaying) {
      glowEffect.classList.add("active")
    } else {
      glowEffect.classList.remove("active")
    }
  }

  // Update connection state
  function updateConnectionState() {
    connectionStatus.className = isConnected ? "connection-status connected" : "connection-status disconnected"
    connectionText.textContent = isConnected ? "Connected" : "Disconnected"
    connectionIcon.innerHTML = isConnected ? icons.wifi : icons.wifiOff
    connectionToggle.textContent = isConnected ? "Disconnect" : "Connect"
    deviceNameElement.textContent = isConnected ? "Web Player" : "Not Connected"
  }

  // Spotify SDK integration placeholder
  window.onSpotifyWebPlaybackSDKReady = () => {
    console.log("Spotify Web Playback SDK is ready")
    // Initialize Spotify player here
  }

  // Initialize the UI
  updatePlayState()
  updateConnectionState()
})
