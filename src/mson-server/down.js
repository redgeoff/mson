import migrator from './migrator'

migrator.down().catch(err => {
  console.error(err);
  process.exit(-1);
});
