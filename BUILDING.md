# Building

## Creating a Release, Compiling the JS and Publishing to NPM

  - Make sure that you have previously issued `npm adduser`
  - Modify the version in package.json
  - $ git diff # check that only the version has changed
  - $ ./scripts/publish.sh # Not in VM
  - Find the new tag at [releases](https://github.com/redgeoff/mson/releases), edit the tag and publish the release