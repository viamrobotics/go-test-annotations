import type { Annotation } from './actions-core.js';
import { createAnnotations } from './annotations.js';
import { readRerunReport } from './rerun-report.js';
import { createSuiteSummary } from './suite-summary.js';
import { readTestReport } from './test-report.js';

/** Input options used to generate annotations. */
interface GoTestAnnotationOptions {
  testReport: string;
  rerunFailsReport: string;
}

/** Given test reports, log annotations to GitHub Actions. */
const goTestAnnotations = async ({
  testReport,
  rerunFailsReport,
}: GoTestAnnotationOptions): Promise<Annotation[]> => {
  const [suiteSummary, reruns] = await Promise.all([
    createSuiteSummary(readTestReport(testReport)),
    readRerunReport(rerunFailsReport),
  ]);

  return createAnnotations(suiteSummary, reruns);
};

export { type GoTestAnnotationOptions, goTestAnnotations };
export type { Annotation } from './actions-core.js';
