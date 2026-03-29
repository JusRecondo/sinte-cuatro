let audioCtx
let osc1, osc2, filter, gainNode, masterGain
let lfo, lfoGain
let currentLfoTarget = null
let isPlaying = false

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

  // 🔥 CLAVE
  if (audioCtx.state === "suspended") {
    await audioCtx.resume()
  }

  // permisos iOS
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    await DeviceOrientationEvent.requestPermission()
  }

  setupSynth()

  masterGain.gain.setValueAtTime(0, audioCtx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.2)
}

function stopSynth() {
  if (!audioCtx) return

  try {
    osc1.stop()
    osc2.stop()
    lfo.stop()
  } catch (e) {}

  // limpiar conexiones
  try {
    osc1.disconnect()
    osc2.disconnect()
    lfo.disconnect()
    lfoGain.disconnect()
    filter.disconnect()
    gainNode.disconnect()
    masterGain.disconnect()
  } catch (e) {}

  masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2)

  setTimeout(() => {
    stopSynthImmediate()
  }, 200)

  // opcional: cerrar el contexto (libera recursos)
  audioCtx.close()

  audioCtx = null
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

  // 🔥 ESTA LINEA FALTABA
  lfo.connect(lfoGain)

  // conectar a algo por defecto
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

document.getElementById("volume").addEventListener("input", (e) => {
  masterGain.gain.value = e.target.value
})

document.getElementById("cutoff").addEventListener("input", (e) => {
  filter.frequency.setTargetAtTime(e.target.value, audioCtx.currentTime, 0.01)
})

document.getElementById("frequency").addEventListener("input", (e) => {
  osc1.frequency.value = e.target.value
  osc2.frequency.value = e.target.value
})

document.getElementById("lfoRate").addEventListener("input", (e) => {
  lfo.frequency.value = e.target.value
})

document.getElementById("lfoAmount").addEventListener("input", (e) => {
  lfoGain.gain.value = e.target.value
})

document.getElementById("lfoTarget").addEventListener("change", (e) => {
  setLfoTarget(e.target.value)
})