const migrator = require('./migrator')

migrator.down().catch(err => {
  console.error(err);
  process.exit(-1);
});
