# Building

## Creating a Release, Compiling the JS and Publishing to NPM

Note: this must be run on Linux (we need the --parent option for cp)

  - $ npm adduser
  - $ git config credential.helper store
  - Modify the version in package.json
  - $ git diff # check that only the version has changed
  - $ ./scripts/publish.sh
  - Find the [target milestone](https://github.com/redgeoff/mson/milestones) and use this link in the release notes.
  - Find the new tag at [releases](https://github.com/redgeoff/mson/releases), edit the tag and publish the release
  - Close the milestone
