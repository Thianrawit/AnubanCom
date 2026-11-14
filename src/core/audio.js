// ==========================================
// Audio & Speech Synthesis Engine
// ==========================================
import { sfxFiles } from '../config/gameConfig.js';
import { SYSTEM_SETTINGS } from '../config/settings.js';

let audioCtx = null;
const sfxCache = {};
let voiceEnabled = localStorage.getItem('anuban_voice_enabled') !== 'false';

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

export function isVoiceEnabled() {
    return voiceEnabled;
}

export function setVoiceEnabled(enabled) {
    voiceEnabled = !!enabled;
    localStorage.setItem('anuban_voice_enabled', voiceEnabled ? 'true' : 'false');
    if (!voiceEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

export function speakLockedLevelMessage(unlockedLevel) {
    if (!voiceEnabled) return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = `ต้องเล่นด่าน ${unlockedLevel} ให้จบก่อนครับ ถ้าพร้อมแล้วกดปุ่มสีเขียวเลยครับ`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH';
    utterance.rate = SYSTEM_SETTINGS.lockedVoiceRate || 0.7; // ปรับได้ใน settings.js
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
}

export function playLetterSound(text, lang = 'th-TH', soundUrl = '') {
    if (!voiceEnabled) return;
    if (soundUrl) {
        const audio = new Audio(soundUrl);
        audio.play().catch(() => playSpeechFallback(text, lang));
    } else {
        playSpeechFallback(text, lang);
    }
}

export function playSpeechFallback(text, lang) {
    if (!voiceEnabled) return;
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
}

export function playSound(type) {
    const fileUrl = sfxFiles[type];
    if (fileUrl) {
        if (!sfxCache[fileUrl]) {
            sfxCache[fileUrl] = new Audio(fileUrl);
        }
        const audio = sfxCache[fileUrl].cloneNode();
        audio.play().catch(() => playSynthSound(type));
        return;
    }
    playSynthSound(type);
}

export function playSynthSound(type) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'drag') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'drop-success' || type === 'correct-key' || type === 'point-hit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.08);
            osc.frequency.setValueAtTime(783.99, now + 0.16);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'drop-fail' || type === 'wrong-key') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.setValueAtTime(146.83, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'win') {
            const notes = [261.63, 329.63, 392.00, 523.25];
            notes.forEach((freq, idx) => {
                const subOsc = ctx.createOscillator();
                const subGain = ctx.createGain();
                subOsc.connect(subGain);
                subGain.connect(ctx.destination);
                subOsc.type = 'sine';
                subOsc.frequency.setValueAtTime(freq, now + idx * 0.12);
                subGain.gain.setValueAtTime(0.2, now + idx * 0.12);
                subGain.gain.linearRampToValueAtTime(0, now + (idx + 1) * 0.15);
                subOsc.start(now + idx * 0.12);
                subOsc.stop(now + (idx + 1) * 0.15);
            });
        }
    } catch {
        // Fallback catch if Web Audio cannot be initialized
    }
}

