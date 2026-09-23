import type { Annotation } from './actions-core.js';
import { createAnnotations } from './annotations.js';
import { readModulePath } from './go-mod.js';
import { readRerunReport } from './rerun-report.js';
import { createSuiteSummary } from './suite-summary.js';
import { readTestReport } from './test-report.js';

/** Input options used to generate annotations. */
interface GoTestAnnotationOptions {
  testReport: string;
  rerunFailsReport: string;
  goMod?: string;
}

/** Given test reports, log annotations to GitHub Actions. */
const goTestAnnotations = async ({
  testReport,
  rerunFailsReport,
  goMod = 'go.mod',
}: GoTestAnnotationOptions): Promise<Annotation[]> => {
  const [suiteSummary, reruns, modulePath] = await Promise.all([
    createSuiteSummary(readTestReport(testReport)),
    readRerunReport(rerunFailsReport),
    readModulePath(goMod),
  ]);

  return createAnnotations(suiteSummary, reruns, { modulePath });
};

export { type GoTestAnnotationOptions, goTestAnnotations };
export type { Annotation } from './actions-core.js';
