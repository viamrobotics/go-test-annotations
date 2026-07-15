import fs from 'node:fs/promises';

import { describe, expect, it as baseIt } from 'vitest';
import { temporaryFileTask } from 'tempy';

import * as Subject from '../src/go-mod.js';

describe('readModulePath', () => {
  const it = baseIt.extend<{ temporaryFile: string }>({
    temporaryFile: async ({}, use) => {
      await temporaryFileTask(async (temporaryFile) => {
        await use(temporaryFile);
      });
    },
  });

  it('returns undefined when go.mod is missing', async () => {
    const result = await Subject.readModulePath('/nonexistent/path/to/go.mod');

    expect(result).toBeUndefined();
  });

  it('reads the module path from a go.mod file', async ({ temporaryFile }) => {
    await fs.writeFile(
      temporaryFile,
      'module github.com/owner/repo\n\ngo 1.24\n',
      'utf8'
    );

    await expect(Subject.readModulePath(temporaryFile)).resolves.toBe(
      'github.com/owner/repo'
    );
  });

  it('reads a non-github module path', async ({ temporaryFile }) => {
    await fs.writeFile(temporaryFile, 'module myproject\n', 'utf8');

    await expect(Subject.readModulePath(temporaryFile)).resolves.toBe(
      'myproject'
    );
  });

  it('returns undefined when go.mod has no module directive', async ({
    temporaryFile,
  }) => {
    await fs.writeFile(temporaryFile, 'go 1.24\n', 'utf8');

    await expect(
      Subject.readModulePath(temporaryFile)
    ).resolves.toBeUndefined();
  });
});
