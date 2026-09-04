import { useCallback, useEffect, useRef, useState } from 'react';

/* Real browser speech recognition (Web Speech API). */
export function useSpeechRecognition() {
  const supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const [listening, setListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [error, setError] = useState('');
  const recRef = useRef(null);
  const finalRef = useRef('');

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* already stopped */ }
  }, []);

  const start = useCallback(() => {
    setError('');
    if (!supported) {
      setError('Speech recognition is not supported in this browser. Type your answer instead.');
      return false;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = true;
    recRef.current = rec;
    finalRef.current = '';
    setLiveText('');
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalRef.current += e.results[i][0].transcript + ' ';
        else interim += e.results[i][0].transcript;
      }
      setLiveText((finalRef.current + interim).trim());
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('Microphone access was denied. Allow it in your browser settings, or type your answer.');
      } else if (e.error === 'no-speech') {
        // benign — just keep going
      } else if (e.error === 'network') {
        setError('Speech service needs a network connection in this browser. Type instead if it persists.');
      }
      setListening(false);
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
      setListening(true);
      return true;
    } catch {
      setListening(false);
      return false;
    }
  }, [supported]);

  useEffect(() => () => stop(), [stop]);

  return { supported, listening, liveText, error, start, stop };
}

/* Real text-to-speech. */
export function speak(text, { rate = 1, voiceURI = null } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    if (voiceURI) {
      const v = window.speechSynthesis.getVoices().find((x) => x.voiceURI === voiceURI);
      if (v) utter.voice = v;
    }
    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
}

export const ttsSupported = () => typeof window !== 'undefined' && Boolean(window.speechSynthesis);
