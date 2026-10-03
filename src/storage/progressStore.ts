import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedProgress, sanitizeProgress } from './progressSchema';

const STORAGE_KEY = 'petpals.progress.v1';

/** Loads saved progress; any failure (missing, corrupt, storage error) yields null. */
export async function loadProgress(): Promise<SavedProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function saveProgress(progress: SavedProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Saving is best-effort; the game keeps working without it.
  }
}
