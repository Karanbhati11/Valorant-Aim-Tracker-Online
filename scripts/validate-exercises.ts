/**
 * Prebuild validation script for exercise definitions.
 *
 * Runs `validateRegistry` over the full exercise registry and exits
 * with a non-zero code if any definition violates the unit system.
 * This ensures invalid definitions cannot ship in a production build.
 *
 * Requirements: 7.6, 7.7
 */

import { getAllExercises } from '../src/lib/exercises/registry';
import { validateRegistry } from '../src/lib/exercises/validator';

const registry = getAllExercises();
const report = validateRegistry(registry);

if (!report.ok) {
  console.error(
    `\n❌ Exercise registry validation FAILED with ${report.failures.length} violation(s):\n`
  );
  for (const failure of report.failures) {
    console.error(
      `  • ${failure.exerciseId}: ${failure.field} = ${failure.value} (${failure.reason})`
    );
  }
  console.error('\nFix the above definitions before building.\n');
  process.exit(1);
} else {
  console.log(`✅ Exercise registry validation passed (${registry.length} definitions checked).`);
}
