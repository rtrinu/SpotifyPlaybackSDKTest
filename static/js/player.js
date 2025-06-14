import { updateSettings } from "./settings.js";
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const playButton = document.getElementById("play-button");
  const playIcon = document.getElementById("play-icon");
  const connectionStatus = document.getElementById("connection-status");
  const connectionIcon = document.getElementById("connection-icon");
  const connectionText = document.getElementById("connection-text");
  const deviceNameElement = document.getElementById("device-name");
  const trackNameElement = document.getElementById("track-name");
  const artistNameElement = document.getElementById("artist-name");
  const previousTrackButton = document.getElementById("previous-button");
  const nextTrackButton = document.getElementById("next-button");

  const toggleButton = document.getElementById("customisationButton");
  const customBox = document.getElementById("customisationBox");
  const bgColorPicker = document.getElementById("bgColorPicker");
  const applyButton = document.getElementById("applyChanges");
  const canvas = document.getElementById("background-canvas");
  const ctx = canvas.getContext("2d");
  const smoothing = document.getElementById("smoothing");
  const baseHue = document.getElementById("hue");
  const colorModeInputs = document.getElementsByName("colorMode");
  const hueControls = document.getElementById("hueControls");
  const solidColorControls = document.getElementById("solidColorControls");
  const solidColorPicker = document.getElementById("solidColorPicker");

  let lastTrackId = null;
  window.backgroundColor = "#000";

  let audioContext, analyser, dataArray;
    // Initialize icons (using SVG strings for simplicity)
    const icons = {
        play: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
        pause:
        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',
        skipBack:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>',
        skipForward:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>',
        wifi: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
        wifiOff:
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
    }

    // Set initial icons
    playIcon.innerHTML = icons.play
    document.querySelector(".skip-back-icon").innerHTML = icons.skipBack
    document.querySelector(".skip-forward-icon").innerHTML = icons.skipForward
    connectionIcon.innerHTML = icons.wifiOff

function updateConnectionStatus(status, connected) {
    if (window.statusTimeoutId) {
      clearTimeout(window.statusTimeoutId);
      connectionStatus.classList.remove("fading");
    }

    connectionText.textContent = status;
    connectionStatus.classList.remove("connected", "disconnected");
    connectionStatus.classList.add(connected ? "connected" : "disconnected");
    console.log(`Spotify Connection Status: ${status}`);

    if (!connected && status.includes("Error")) {
      window.statusTimeoutId = setTimeout(() => {
        connectionStatus.classList.add("fading");
        setTimeout(() => {
          if (connectionStatus.classList.contains("fading")) {
            connectionText.textContent = "Ready";
          }
        }, 1000);
      }, 3000);
    }
  }

  function initializeVisualization() {
    // Add your visualization code here if needed
    if (!audioContext || !analyser) return;
    // e.g., draw frequency data
  }

  document.addEventListener("click", (event) => {
    const isClickInsideCustomBox = customBox.contains(event.target);
    const isClickInsideToggleButton = toggleButton.contains(event.target);
    if (!isClickInsideCustomBox && !isClickInsideToggleButton) {
      customBox.style.display = "none";
      toggleButton.style.display = "inline-block";
    }
  });

  smoothing.addEventListener("input", (event) => {
    updateSettings({ smoothing: parseFloat(event.target.value) });
  });


  toggleButton.addEventListener("click", () => {
    toggleButton.style.display = "none";
    customBox.style.display = "block";
  });

  function updateColorModeControls() {
    const selectedMode = document.querySelector('input[name="colorMode"]:checked').value;
    console.log("Color mode changed to:", selectedMode);
    if (selectedMode === "hue") {
      hueControls.style.display = "block";
      solidColorControls.style.display = "none";
    } else {
      hueControls.style.display = "none";
      solidColorControls.style.display = "block";
    }
  }
  updateColorModeControls(); // Initial call to set controls based on default mode
  colorModeInputs.forEach(radio => {
    radio.addEventListener("change", updateColorModeControls);
  });


  applyButton.addEventListener("click", () => {
    const bgColor = document.getElementById("bgColorPicker").value;
    const barSmoothing = parseFloat(smoothing.value);
    const colorMode = document.querySelector('input[name="colorMode"]:checked').value;
    const solidColor = solidColorPicker.value;
    if (colorMode === "solid") {
      updateSettings({ backgroundColor: bgColor, smoothingFactor: barSmoothing, colorMode, solidColor });
    } else {
      updateSettings({ backgroundColor: bgColor, smoothingFactor: barSmoothing, colorMode });
    }
customBox.style.display = "none";
    toggleButton.style.display = "inline-block";
  });



  window.onSpotifyWebPlaybackSDKReady = () => {
    fetch("/get_spotify_token")
      .then(res => res.json())
      .then(data => {
        const token = data.access_token;
        if (!token) {
          updateConnectionStatus("Error: No access token", false);
          return;
        }

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const player = new Spotify.Player({
          name: "Rohan's Spotify Visualizer",
          getOAuthToken: cb => cb(token),
          volume: 0.5,
        });

        player.addListener("ready", ({ device_id }) => {
          updateConnectionStatus("Connect to Spotify", true);
          connectionIcon.innerHTML = icons.wifi;
          deviceNameElement.textContent = "Rohan's Spotify Visualizer";

          player.getCurrentState().then(state => {
            if (!state) {
              console.log("No track currently playing");
              return;
            }
            const currentTrackUri = state.track_window.current_track.uri;
            console.log("Current Track URI:", currentTrackUri);
          });

        });

        player.addListener("not_ready", ({ device_id }) => {
          updateConnectionStatus("Disconnected from Spotify", false);
        });

        const errorHandlers = {
          initialization_error: "Initialization Error",
          authentication_error: "Authentication Error",
          account_error: "Account Error",
          playback_error: "Playback Error",
        };

        for (const [type, label] of Object.entries(errorHandlers)) {
          player.addListener(type, ({ message }) => {
            updateConnectionStatus(`${label}: ${message}`, false);
            console.error(`${label}:`, message);
          });
        }

        player.addListener("player_state_changed", state => {
          if (!state) return;
          const track = state.track_window.current_track;
          const currentTrackId = track.id;
          if (currentTrackId !== lastTrackId){
            console.log("New Track Detected: ", currentTrackId);
          trackNameElement.textContent = track.name;
          artistNameElement.textContent = track.artists.map(a => a.name).join(", ");
          lastTrackId = currentTrackId;
          }
          playIcon.innerHTML = state.paused ? icons.play : icons.pause;

          if (!state.paused) initializeVisualization();
        });

        playButton.onclick = () => {
          player.togglePlay().catch(error => {
            console.error("Toggle Play Error:", error);
            updateConnectionStatus(`Play/Pause Error: ${error.message}`, false);
          });
        };

        previousTrackButton.onclick = () => {
          player.previousTrack().catch(error => {
            console.error("Previous Track Error:", error);
          });
        };

        nextTrackButton.onclick = () => {
          player.nextTrack().catch(error => {
            console.error("Next Track Error:", error);
          });
        };

        player.connect().then(success => {
          if (success) {
            console.log("Spotify SDK Connection Initiated");
          } else {
            updateConnectionStatus("Failed to Connect to Spotify", false);
          }
        });
      });
  };
});