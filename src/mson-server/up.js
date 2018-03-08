const migrator = require('./migrator')

migrator.up().catch(err => {
  console.error(err);
  process.exit(-1);
});
