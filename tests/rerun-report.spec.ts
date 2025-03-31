import fs from 'node:fs/promises';

import { describe, expect, it as baseIt } from 'vitest';
import { temporaryFileTask } from 'tempy';

import * as Subject from '../src/rerun-report.js';

describe('readRerunReport', () => {
  const it = baseIt.extend<{ temporaryFile: string }>({
    temporaryFile: async ({}, use) => {
      await temporaryFileTask(async (temporaryFile) => {
        await use(temporaryFile);
      });
    },
  });

  it('does nothing if input path is empty', async () => {
    const result = await Subject.readRerunReport('');

    expect(result).toEqual([]);
  });

  it('does nothing if input file does not exist', async () => {
    const result = await Subject.readRerunReport('nope.txt');

    expect(result).toEqual([]);
  });

  it('reads empty file', async ({ temporaryFile }) => {
    await fs.writeFile(temporaryFile, '', 'utf8');
    const result = await Subject.readRerunReport(temporaryFile);

    expect(result).toEqual([]);
  });

  it('reads a rerun', async ({ temporaryFile }) => {
    await fs.writeFile(
      temporaryFile,
      'github.com/org/repo/greet.TestGreet: 3 runs, 1 failures',
      'utf8'
    );
    const result = await Subject.readRerunReport(temporaryFile);

    expect(result).toEqual([
      {
        packageName: 'github.com/org/repo/greet',
        testName: 'TestGreet',
        runs: 3,
        failures: 1,
      },
    ]);
  });

  it('reads multiple reruns', async ({ temporaryFile }) => {
    await fs.writeFile(
      temporaryFile,
      `
    github.com/org/repo/greet.TestGreet: 3 runs, 1 failures

    github.com/org/repo/greet.TestGreet/wave: 2 runs, 2 failures

    `,
      'utf8'
    );
    const result = await Subject.readRerunReport(temporaryFile);

    expect(result).toEqual([
      {
        packageName: 'github.com/org/repo/greet',
        testName: 'TestGreet',
        runs: 3,
        failures: 1,
      },
      {
        packageName: 'github.com/org/repo/greet',
        testName: 'TestGreet/wave',
        runs: 2,
        failures: 2,
      },
    ]);
  });

  it('tolerates pluralization in case this changes in the future', async ({
    temporaryFile,
  }) => {
    await fs.writeFile(
      temporaryFile,
      'github.com/org/repo/greet.TestGreet: 3 run, 1 failure',
      'utf8'
    );
    const result = await Subject.readRerunReport(temporaryFile);

    expect(result).toEqual([
      {
        packageName: 'github.com/org/repo/greet',
        testName: 'TestGreet',
        runs: 3,
        failures: 1,
      },
    ]);
  });
});
