import fs from 'node:fs/promises';
import os from 'node:os';

import { debug } from './actions-core.js';

const MODULE_RE = /^module\s+"?(?<modulePath>[^\s"]+)"?\s*$/u;

/** Read the module path from a go.mod file, or undefined if unavailable. */
const readModulePath = async (
  goModPath: string
): Promise<string | undefined> => {
  let contents: string;

  try {
    contents = await fs.readFile(goModPath, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return undefined;
    }

    debug(`Unable to read ${goModPath}: ${error as Error}`);
    return undefined;
  }

  for (const line of contents.split(os.EOL)) {
    const match = MODULE_RE.exec(line.trim());

    if (match?.groups?.modulePath) {
      return match.groups.modulePath;
    }
  }

  return undefined;
};

export { readModulePath };
