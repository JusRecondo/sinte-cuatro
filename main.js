let audioCtx
let osc1, osc2, filter, gainNode, masterGain
let lfo, lfoGain
let currentLfoTarget = null
let isPlaying = false
let orientationHandler
let motionHandler
let motionEnabled = false

const startBtn = document.getElementById("startBtn")

startBtn.addEventListener("click", async () => {
  if (!isPlaying) {
    await startSynth()
    startBtn.textContent = "OFF"
    isPlaying = true
  } else {
    stopSynth()
    startBtn.textContent = "ON"
    isPlaying = false
  }
})

async function startSynth() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()

  if (audioCtx.state === "suspended") {
    await audioCtx.resume()
  }

  if (typeof DeviceMotionEvent.requestPermission === "function") {
    try {
      const response = await DeviceMotionEvent.requestPermission()
      if (response !== "granted") {
        alert("Permiso de movimiento denegado")
        return
      }
    } catch (err) {
      console.error(err)
    }
  }

  setupSynth()

  masterGain.gain.setValueAtTime(0, audioCtx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.2)

  startSensors()
  startMotion()
}

function stopSynth() {
  if (!audioCtx) return

  const now = audioCtx.currentTime
  const stopTime = now + 0.2

  masterGain.gain.cancelScheduledValues(now)
  masterGain.gain.setValueAtTime(masterGain.gain.value, now)
  masterGain.gain.linearRampToValueAtTime(0, stopTime)

  try {
    osc1.stop(stopTime)
    osc2.stop(stopTime)
    lfo.stop(stopTime)
  } catch (e) {}

  setTimeout(() => {
    try {
      osc1.disconnect()
      osc2.disconnect()
      lfo.disconnect()
      lfoGain.disconnect()
      filter.disconnect()
      gainNode.disconnect()
      masterGain.disconnect()
    } catch (e) {}

    if (audioCtx) {
      audioCtx.close()
      audioCtx = null
    }
  }, 300)

  stopSensors()
}

function setupSynth() {
  osc1 = audioCtx.createOscillator()
  osc2 = audioCtx.createOscillator()
  filter = audioCtx.createBiquadFilter()
  gainNode = audioCtx.createGain()
  masterGain = audioCtx.createGain()

  lfo = audioCtx.createOscillator()
  lfoGain = audioCtx.createGain()

  lfo.frequency.value = 2
  lfoGain.gain.value = 50

  lfo.connect(lfoGain)

  setLfoTarget("filter")

  osc1.type = "sawtooth"
  osc2.type = "square"

  osc1.frequency.value = 220
  osc2.frequency.value = 220

  filter.type = "lowpass"
  filter.frequency.value = 800

  gainNode.gain.value = 0.5
  masterGain.gain.value = 0.5

  lfo.frequency.value = 2
  lfoGain.gain.value = 50

  // conexiones
  osc1.connect(filter)
  osc2.connect(filter)

  filter.connect(gainNode)
  gainNode.connect(masterGain)
  masterGain.connect(audioCtx.destination)

  setLfoTarget("filter")

  osc1.start()
  osc2.start()
  lfo.start()
}

function setLfoTarget(target) {
  // 🔥 Desconectar TODO
  try {
    lfoGain.disconnect()
  } catch (e) {}

  if (target === "filter") {
    lfoGain.connect(filter.frequency)
  }

  if (target === "osc") {
    lfoGain.connect(osc1.detune)
    lfoGain.connect(osc2.detune)
  }
}

function startSensors() {
  orientationHandler = (event) => {
    if (!audioCtx || !motionEnabled) return

    const { alpha, beta, gamma } = event

    if (beta !== null) {
      const norm = (beta + 180) / 360
      const cutoff = 200 + norm * 3000

      filter.frequency.setTargetAtTime(cutoff, audioCtx.currentTime, 0.1)
    }

    if (gamma !== null) {
      const detune = gamma * 5

      osc2.detune.setTargetAtTime(detune, audioCtx.currentTime, 0.1)
    }

    if (alpha !== null) {
      const norm = alpha / 360
      const freq = 100 + norm * 600

      osc1.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1)
      osc2.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1)
    }
  }

  window.addEventListener("deviceorientation", orientationHandler)
}

function startMotion() {
  motionHandler = (event) => {
    if (!audioCtx || !motionEnabled) return

    const acc = event.accelerationIncludingGravity
    if (!acc) return

    const x = acc.x || 0
    const y = acc.y || 0
    const z = acc.z || 0

    const intensity = Math.abs(x) + Math.abs(y) + Math.abs(z)

    const lfoRate = Math.min(15, intensity)

    lfo.frequency.setTargetAtTime(lfoRate, audioCtx.currentTime, 0.1)
  }

  window.addEventListener("devicemotion", motionHandler)
}

function stopSensors() {
  if (orientationHandler) {
    window.removeEventListener("deviceorientation", orientationHandler)
  }

  if (motionHandler) {
    window.removeEventListener("devicemotion", motionHandler)
  }
}

const motionBtn = document.getElementById("motionBtn")

motionBtn.addEventListener("click", () => {
  motionEnabled = !motionEnabled;

  motionBtn.textContent = motionEnabled
    ? "Motion: ON"
    : "Motion: OFF";

  updateUIState();
});

function updateUIState() {
  const controls = document.querySelectorAll("input, select");

  controls.forEach((el) => {
    el.disabled = motionEnabled;
  });
}

document.getElementById("volume").addEventListener("input", (e) => {
  if (!audioCtx || motionEnabled) return

  masterGain.gain.value = e.target.value
})

document.getElementById("cutoff").addEventListener("input", (e) => {
  if (!audioCtx || motionEnabled) return

  filter.frequency.setTargetAtTime(e.target.value, audioCtx.currentTime, 0.01)
})

document.getElementById("frequency").addEventListener("input", (e) => {
  if (!audioCtx || motionEnabled) return
  osc1.frequency.value = e.target.value
  osc2.frequency.value = e.target.value
})

document.getElementById("lfoRate").addEventListener("input", (e) => {
  if (!audioCtx || motionEnabled) return
  lfo.frequency.value = e.target.value
})

document.getElementById("lfoAmount").addEventListener("input", (e) => {
  if (!audioCtx || motionEnabled) return
  lfoGain.gain.value = e.target.value
})

document.getElementById("lfoTarget").addEventListener("change", (e) => {
  if (!audioCtx || motionEnabled) return
  setLfoTarget(e.target.value)
})
