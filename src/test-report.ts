/* eslint-disable id-length */
/* eslint-disable func-style */
import fs from 'node:fs';
import os from 'node:os';
import stream from 'node:stream';

import * as v from 'valibot';

import { debug } from './actions-core.js';

type TestEvent = v.InferInput<typeof TestEventSchema>;

/** Read `go test`'s NDJSON test report into a stream of test events. */
const readTestReport = (testReport: string): AsyncIterable<TestEvent> => {
  const fileStream = fs.createReadStream(testReport);
  const lineStream = splitLines(fileStream);
  const eventStream = parseLines(lineStream);

  return stream.Readable.from(eventStream);
};

const TestEventSchema = v.object({
  Time: v.exactOptional(v.string()),
  Action: v.exactOptional(
    v.union([
      v.literal('start'),
      v.literal('run'),
      v.literal('pause'),
      v.literal('cont'),
      v.literal('pass'),
      v.literal('bench'),
      v.literal('fail'),
      v.literal('output'),
      v.literal('skip'),
    ])
  ),
  Package: v.exactOptional(v.string()),
  Test: v.exactOptional(v.string()),
  Elapsed: v.exactOptional(v.number()),
  Output: v.exactOptional(v.string()),
  FailedBuild: v.exactOptional(v.string()),
});

const parseTestEvent = (
  event: unknown
): [error: Error | undefined, result?: TestEvent] => {
  const result = v.safeParse(TestEventSchema, event);

  if (result.success) {
    return [undefined, result.output];
  }

  return [new v.ValiError<typeof TestEventSchema>(result.issues)];
};

const parseJSONLine = (
  line: string
): [error: Error | undefined, result?: unknown] => {
  const trimmedLine = line.trim();
  let result: unknown;

  try {
    result = trimmedLine ? JSON.parse(trimmedLine) : undefined;
  } catch (error) {
    return [error as Error];
  }

  return [undefined, result];
};

async function* splitLines(chunks: AsyncIterable<Buffer>) {
  let buffer = '';

  for await (const chunk of chunks) {
    const lines = (buffer + chunk.toString()).split(os.EOL);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine) {
        yield line.trim();
      }
    }
  }

  const remaining = buffer.trim();
  buffer = '';

  if (remaining) {
    yield remaining;
  }
}

async function* parseLines(lines: AsyncIterable<string>) {
  for await (const line of lines) {
    const [jsonError, json] = parseJSONLine(line);

    if (jsonError) {
      debug(
        `Unexpected JSON parsing error.${os.EOL}Line: ${line}${os.EOL}Error: ${jsonError}`
      );
    }

    if (json) {
      const [parseError, result] = parseTestEvent(json);

      if (parseError) {
        debug(
          `Unexpected event parsing error.${os.EOL}Line: ${line}${os.EOL}Error: ${parseError}`
        );
      }

      if (result) {
        yield result;
      }
    }
  }
}

export { readTestReport, type TestEvent };
