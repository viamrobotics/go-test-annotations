/*
  eslint-disable
  @typescript-eslint/restrict-template-expressions
*/
import { annotate, getInput, setFailed } from './actions-core';
import { goTestAnnotations } from './index.js';

const testReport = getInput('test-report');
const rerunFailsReport = getInput('rerun-fails-report');

goTestAnnotations({ testReport, rerunFailsReport })
  .then((annotations) => {
    for (const annotation of annotations) {
      annotate(annotation);
    }
  })
  .catch((error: unknown) => {
    setFailed(`Unexpected error adding annotations for Go tests: ${error}`);
  });
