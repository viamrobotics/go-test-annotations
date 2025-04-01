import type { TestEvent } from './test-report.js';

/** A map of all packages in the suite by the package name. */
type SuiteSummary = Map<string, PackageSummary>;

/** A map of all tests in a package by the test name. */
type PackageSummary = Map<string, TestSummary>;

/** The summary of an individual test or parent test. */
interface TestSummary {
  status: 'unknown' | 'fail';
  output: string[];
}

/** Given a stream of test events, create a summary of failing tests in the suite. */
const createSuiteSummary = async (
  testEvents: AsyncIterable<TestEvent>
): Promise<SuiteSummary> => {
  const summary: SuiteSummary = new Map();

  for await (const event of testEvents) {
    addEventToSummary(summary, event);
  }

  return summary;
};

const createPackageSummary = (): PackageSummary => {
  return new Map();
};

const createTestSummary = (): TestSummary => {
  return { status: 'unknown', output: [] };
};

const addEventToSummary = (
  summary: SuiteSummary,
  event: TestEvent | undefined
): SuiteSummary => {
  const {
    Package: packageName,
    Test: testName,
    Output: output,
    Action: action,
  } = event ?? {};

  if (!packageName || !testName) {
    return summary;
  }

  const packageSummary = summary.get(packageName) ?? createPackageSummary();
  const testSummary = packageSummary.get(testName) ?? createTestSummary();

  summary.set(packageName, packageSummary);
  packageSummary.set(testName, testSummary);

  if (action === 'run') {
    testSummary.output.push('');
  }

  if (output) {
    const previousOutput = testSummary.output.pop() ?? '';
    testSummary.output.push(previousOutput + output);
  }

  if (testSummary.status === 'unknown' && action) {
    if (action === 'pass' || action === 'skip') {
      packageSummary.delete(testName);
    } else if (action === 'fail') {
      testSummary.status = 'fail';
    }
  }

  return summary;
};

export {
  createSuiteSummary,
  type PackageSummary,
  type SuiteSummary,
  type TestSummary,
};
