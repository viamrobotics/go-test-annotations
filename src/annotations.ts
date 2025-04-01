import os from 'node:os';
import path from 'node:path';

import type { Annotation } from './actions-core';
import type { Rerun } from './rerun-report.js';
import type { SuiteSummary, TestSummary } from './suite-summary.js';

const GITHUB_REPO_RE = /^github\.com\/[^/]+\/[^/]+\//u;
const FILENAME_RE = /(?<filename>\S+_test.go):(?<lineNumber>\d+)/iu;

/** Given a suite summary, create annotation objects to be logged. */
const createAnnotations = (
  suiteSummary: SuiteSummary,
  reruns: Rerun[]
): Annotation[] => {
  const annotations: Annotation[] = [];

  for (const [packageName, packageSummary] of suiteSummary) {
    const packagePath = getPackagePath(packageName);

    for (const [testName, testSummary] of packageSummary) {
      const rerun = reruns.find(
        (r) => r.packageName === packageName && r.testName === testName
      );

      const testAnnotation = getAnnotationFromOutput(
        `${packageName}.${testName}`,
        packagePath,
        testSummary,
        rerun
      );

      if (testAnnotation) {
        annotations.push(testAnnotation);
      }
    }
  }

  return annotations;
};

const getPackagePath = (packageName: string): string => {
  return packageName.replace(GITHUB_REPO_RE, '');
};

const getAnnotationFromOutput = (
  name: string,
  packagePath: string,
  testSummary: TestSummary,
  rerun: Rerun | undefined = undefined
): Annotation | undefined => {
  if (testSummary.status !== 'fail') {
    return undefined;
  }

  const output = joinOutput(testSummary.output);
  const heading = rerun && rerun.runs !== rerun.failures ? 'FLAKY' : 'FAIL';
  const filenameMatch = FILENAME_RE.exec(output);
  const filename = filenameMatch?.groups?.filename;
  const lineNumber = filenameMatch?.groups?.lineNumber;
  const annotation: Annotation = {
    title: `${heading}: ${name}`,
    message: output,
    level: 'error',
  };

  if (filename && lineNumber) {
    annotation.file = path.join(packagePath, filename);
    annotation.startLine = Number(lineNumber);
  }

  return annotation;
};

const joinOutput = (allRunsOutput: string[]): string => {
  if (allRunsOutput.length === 1) {
    return allRunsOutput.join('');
  }

  const runs = allRunsOutput.length;
  const outputWithTitles = allRunsOutput.map(
    (output, index) => `Run ${index + 1} of ${runs}${os.EOL}${output}`
  );

  return outputWithTitles.join(os.EOL);
};

export { createAnnotations };
