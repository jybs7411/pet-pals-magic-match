import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { GAME_RULES } from '../constants/theme';

/**
 * Counts foreground play time and, after BREAK_REMINDER_MINUTES, asks for a
 * gentle stretch/water break. Dismissing restarts the timer.
 */
export function usePlayBreakReminder() {
  const [shouldRemind, setShouldRemind] = useState(false);
  const secondsRef = useRef(0);

  useEffect(() => {
    const limit = GAME_RULES.BREAK_REMINDER_MINUTES * 60;
    const id = setInterval(() => {
      if (AppState.currentState !== 'active') return;
      secondsRef.current += 1;
      if (secondsRef.current >= limit) {
        secondsRef.current = 0;
        setShouldRemind(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const dismiss = useCallback(() => {
    secondsRef.current = 0;
    setShouldRemind(false);
  }, []);

  return { shouldRemind, dismiss };
}
