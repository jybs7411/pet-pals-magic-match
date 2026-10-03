import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True when the OS asks apps to minimise motion (shake, bursts, flashing). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => active && setReduced(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
