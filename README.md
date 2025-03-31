# Go test annotations

Add annotations from `go test` and `gotestsum` to a GitHub Actions workflow run.

## Usage

### `go test`

```yaml
on:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - uses: actions/setup-go@v5
        with:
          go-version: '1.24'

      - run: go test -json ./... > test.json

      - if: ${{ !cancelled() }
        uses: viamrobotics/go-test-annotations@v1
        with:
          test-report: test.json
```

### `gotestsum`

```yaml
on:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - uses: actions/setup-go@v5
        with:
          go-version: '1.24'

      - run: gotestsum --jsonfile=test.json --rerun-fails ---rerun-fails-report=rerun-fails.txt --packages=./...

      - if: ${{ !cancelled() }
        uses: viamrobotics/go-test-annotations@v1
        with:
          test-report: test.json
          rerun-fails-report: rerun-fails.txt
```

## Options

```yaml
- uses: viamrobotics/go-test-annotations@v1
  with:
    test-report: test.json
    rerun-fails-report: rerun-fails.txt
```

| name                 | default     | description                                          |
| -------------------- | ----------- | ---------------------------------------------------- |
| `test-report`        | `test.json` | Path to test report file from `go test -json`        |
| `rerun-fails-report` | N/A         | Path to re-run report from `gotestsum --rerun-fails` |
