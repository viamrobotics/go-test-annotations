import stream from 'node:stream';

import { describe, expect, it } from 'vitest';

import * as Subject from '../src/suite-summary.js';

describe('createSuiteSummary', () => {
  it('creates an empty summary', async () => {
    const result = await Subject.createSuiteSummary(stream.Readable.from([]));

    expect(result).toEqual(new Map());
  });

  it('adds test to the summary', async () => {
    const result = await Subject.createSuiteSummary(
      stream.Readable.from([{ Package: 'greet', Test: 'wave', Action: 'run' }])
    );

    expect(result).toEqual(
      new Map([
        ['greet', new Map([['wave', { status: 'unknown', output: [''] }]])],
      ])
    );
  });

  it('collects test-level output', async () => {
    const result = await Subject.createSuiteSummary(
      stream.Readable.from([
        { Package: 'greet', Test: 'wave', Output: 'hello' },
        { Package: 'greet', Test: 'wave', Output: 'world' },
      ])
    );

    expect(result).toEqual(
      new Map([
        [
          'greet',
          new Map([['wave', { status: 'unknown', output: ['helloworld'] }]]),
        ],
      ])
    );
  });

  it.each(['pass', 'skip'] as const)('removes test on %s', async (action) => {
    const result = await Subject.createSuiteSummary(
      stream.Readable.from([
        { Package: 'greet', Test: 'wave', Output: 'hello' },
        { Package: 'greet', Test: 'wave', Action: action },
      ])
    );

    expect(result).toEqual(new Map([['greet', new Map()]]));
  });

  it('marks test as failed', async () => {
    const result = await Subject.createSuiteSummary(
      stream.Readable.from([{ Package: 'greet', Test: 'wave', Action: 'fail' }])
    );

    expect(result).toEqual(
      new Map([['greet', new Map([['wave', { status: 'fail', output: [] }]])]])
    );
  });

  it('does not delete a failed test, even if it passes later', async () => {
    const result = await Subject.createSuiteSummary(
      stream.Readable.from([
        { Package: 'greet', Test: 'wave', Action: 'fail' },
        { Package: 'greet', Test: 'wave', Action: 'pass' },
      ])
    );

    expect(result).toEqual(
      new Map([['greet', new Map([['wave', { status: 'fail', output: [] }]])]])
    );
  });

  it('adds a new entry to output if test re-runs', async () => {
    const result = await Subject.createSuiteSummary(
      stream.Readable.from([
        { Package: 'greet', Test: 'wave', Action: 'run' },
        { Package: 'greet', Test: 'wave', Output: 'hello' },
        { Package: 'greet', Test: 'wave', Action: 'run' },
        { Package: 'greet', Test: 'wave', Output: 'world' },
      ])
    );

    expect(result).toEqual(
      new Map([
        [
          'greet',
          new Map([
            ['wave', { status: 'unknown', output: ['hello', 'world'] }],
          ]),
        ],
      ])
    );
  });
});
