# 📱 Motion Synth

Un sintetizador experimental que corre en el navegador y se controla tanto con **UI táctil** como con el **movimiento del celular** usando la Web Audio API y sensores del dispositivo.

---

## 🎛️ Features

- 🎹 2 osciladores (VCO)
- 🔊 Filtro pasa bajos (lowpass)
- 🌊 LFO (Low Frequency Oscillator)
- 🎚️ Control de volumen
- 📱 Control por movimiento (Device Orientation + Motion)
- 🔁 Toggle entre modo manual y modo motion
- ⚡ Funciona en navegador (sin instalación)

---

## 🚀 Cómo usarlo

- Tocá el botón **ON**
- Aceptá permisos de movimiento (en iOS/Android)

---

## 🎮 Modos de control

### 🎛️ Modo Manual (Motion: OFF)

Controlás el sonido con la interfaz:

- **Volume** → volumen general  
- **Cutoff** → frecuencia del filtro  
- **Frequency** → pitch base  
- **LFO Rate** → velocidad del LFO  
- **LFO Amount** → intensidad de modulación  
- **LFO Target** → destino (filtro o pitch)  

---

### 📱 Modo Motion (Motion: ON)

El celular se convierte en el instrumento:

| Movimiento | Parámetro | Efecto |
|----------|--------|--------|
| Inclinar adelante/atrás | Cutoff | Wah / brillo |
| Inclinar izquierda/derecha | Detune | Chorus / desafinación |
| Rotar sobre eje | Frecuencia | Pitch |
| Sacudir | LFO rate | Intensidad / vibración |

---

## 🧠 Cómo funciona (conceptualmente)

El sintetizador traduce movimiento físico en sonido: Movimiento → sensores → valores → parámetros de audio


Ejemplo:

- inclinás el celular → cambia el filtro  
- lo girás → cambia el pitch  
- lo sacudís → acelera el LFO  

---

## ⚠️ Requisitos importantes

- 📱 Usar desde un celular (para sensores)  
- 🔒 Usar HTTPS (los sensores no funcionan en HTTP en muchos casos)  
- 👆 Interactuar con la pantalla (necesario para activar el audio)  

---

## 🐛 Problemas comunes

### No suena
- Verificar que tocaste el botón ON  
- Revisar permisos del navegador  
- Asegurarse de usar HTTPS  
- Puede no funcionar en Iphone, solo fue testeado en Android

### No responden los sensores
- Aceptar permisos de movimiento  
- Probar en otro navegador (Chrome/Safari)  

### La UI no responde
- Verificar si **Motion está activado**  
- En modo Motion, los sensores sobrescriben los controles  

---

## 🎶 Idea del proyecto

Este sintetizador explora el celular como **instrumento performático**, donde el cuerpo controla directamente el sonido en el espacio.
