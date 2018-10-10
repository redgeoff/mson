# Testing

## 100% Coverage

This project implements 100% test coverage as it allows us to:
  1. Use tools like [greenkeeper](https://greenkeeper.io/)
  2. Refactor/optimize without breaking anything

## Testing

Lint and run tests (including with code coverage):

    $ yarn test

You can then view the code coverage at `coverage/lcov-report/index.html`

Run the tests interactively:

    $ yarn just-test

## Analyzing the Bundle

    $ yarn analyze-bundle # Don't run in VM