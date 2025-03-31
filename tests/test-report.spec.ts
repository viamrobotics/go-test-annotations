import fs from 'node:fs/promises';

import { describe, expect, it as baseIt } from 'vitest';
import { temporaryFileTask } from 'tempy';

import * as Subject from '../src/test-report.js';

const fromAsync = async <T>(iterable: AsyncIterable<T>): Promise<T[]> => {
  const result: T[] = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
};

describe('readTestReport', () => {
  const it = baseIt.extend<{ temporaryFile: string }>({
    temporaryFile: async ({}, use) => {
      await temporaryFileTask(async (temporaryFile) => {
        await use(temporaryFile);
      });
    },
  });

  it('reads empty file', async ({ temporaryFile }) => {
    await fs.writeFile(temporaryFile, '', 'utf8');
    const result = Subject.readTestReport(temporaryFile);

    await expect(fromAsync(result)).resolves.toEqual([]);
  });

  it('reads multiple empty lines', async ({ temporaryFile }) => {
    await fs.writeFile(temporaryFile, '  \n  \n  \n', 'utf8');
    const result = Subject.readTestReport(temporaryFile);

    await expect(fromAsync(result)).resolves.toEqual([]);
  });

  it('reads a single line of JSON', async ({ temporaryFile }) => {
    await fs.writeFile(temporaryFile, '{}', 'utf8');
    const result = Subject.readTestReport(temporaryFile);

    await expect(fromAsync(result)).resolves.toEqual([{}]);
  });

  it('reads multiple lines of JSON', async ({ temporaryFile }) => {
    await fs.writeFile(
      temporaryFile,
      '{"Action": "pass"}\n{"Action": "fail"}',
      'utf8'
    );
    const result = Subject.readTestReport(temporaryFile);

    await expect(fromAsync(result)).resolves.toEqual([
      { Action: 'pass' },
      { Action: 'fail' },
    ]);
  });

  it('reads multiple sparse lines of JSON', async ({ temporaryFile }) => {
    await fs.writeFile(
      temporaryFile,
      '{"Package": "hello"}\n   \n{"Package": "world"}\n  \n',
      'utf8'
    );
    const result = Subject.readTestReport(temporaryFile);

    await expect(fromAsync(result)).resolves.toEqual([
      { Package: 'hello' },
      { Package: 'world' },
    ]);
  });
});
