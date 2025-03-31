import timers from 'node:timers/promises';

/** Input options used to generate annotations. */
interface GoTestAnnotationOptions {
  testReport: string;
  rerunFailsReport: string;
}

/** Given test reports, log annotations to GitHub Actions. */
const goTestAnnotations = async ({
  testReport,
  rerunFailsReport,
}: GoTestAnnotationOptions): Promise<string> => {
  console.log('Test report', testReport);
  console.log('Rerun fails report', rerunFailsReport);

  await timers.setTimeout(0);

  return 'hello world';
};

export { goTestAnnotations };
