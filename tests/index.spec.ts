import { describe, expect, it } from 'vitest';

import * as Subject from '../src/index.js';

describe('hello world', () => {
  it('says hello world', async () => {
    const result = await Subject.goTestAnnotations({
      testReport: '',
      rerunFailsReport: '',
    });

    expect(result).toBe('hello world');
  });
});
