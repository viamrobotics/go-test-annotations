import fs from 'node:fs/promises';
import os from 'node:os';

/** Re-run data for a given test. */
interface Rerun {
  packageName: string;
  testName: string;
  runs: number;
  failures: number;
}

const RERUN_RE =
  /^(?<packageName>[\w./]+)\.(?<testName>[\w./]+): (?<runs>\d+) run(?:s)?, (?<failures>\d+) failure(?:s)?$/u;

/** Read `gotestsum`'s re-run report into a list of re-runs by test. */
const readRerunReport = async (rerunReport: string): Promise<Rerun[]> => {
  if (rerunReport === '') {
    return [];
  }

  let report: string;

  try {
    report = await fs.readFile(rerunReport, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      report = '';
    } else {
      throw error;
    }
  }

  return report.split(os.EOL).flatMap((line) => {
    const groups = RERUN_RE.exec(line.trim())?.groups ?? {};
    const { packageName, testName, runs, failures } = groups;

    return packageName && testName && runs && failures
      ? {
          packageName,
          testName,
          runs: Number(runs),
          failures: Number(failures),
        }
      : [];
  });
};

export { readRerunReport, type Rerun };
