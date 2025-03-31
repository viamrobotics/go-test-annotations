/*
  eslint-disable
  @typescript-eslint/restrict-template-expressions
*/
import { getInput, setFailed } from '@actions/core';

import { goTestAnnotations } from './index.js';

const testReport = getInput('test-report');
const rerunFailsReport = getInput('rerun-fails-report');

goTestAnnotations({ testReport, rerunFailsReport })
  .then((annotations) => {
    console.log(annotations);
  })
  .catch((error: unknown) => {
    setFailed(`Unexpected error adding annotations for Go tests: ${error}`);
  });
