/**
 * Exercise i18n Module
 *
 * Patches window.EXERCISES with localized exercise names and descriptions.
 * Call AFTER installBridge() and AFTER locale is known.
 */

import en from '@/messages/en.json';
import es from '@/messages/es.json';
import pt from '@/messages/pt.json';
import de from '@/messages/de.json';
import ja from '@/messages/ja.json';
import zh from '@/messages/zh.json';

const MESSAGES: Record<string, any> = { en, es, pt, de, ja, zh };

/**
 * Patches window.EXERCISES with localized exercise names and descriptions.
 * Call AFTER installBridge() and AFTER locale is known.
 */
export function localizeExercises(locale: string): void {
  if (typeof window === 'undefined') return;
  const msgs = MESSAGES[locale] || MESSAGES['en'];
  const exerciseData = msgs?.exerciseData;
  if (!exerciseData) return;

  const exercises = (window as any).EXERCISES;
  if (!exercises) return;

  for (const categoryKey of Object.keys(exercises)) {
    const cat = exercises[categoryKey];
    if (!cat?.exercises) continue;
    for (const ex of cat.exercises) {
      const t = exerciseData[ex.id];
      if (t) {
        ex.name = t.name;
        ex.description = t.desc;
      }
    }
  }
}
