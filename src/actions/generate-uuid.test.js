import GenerateUUID from './generate-uuid';

it('should stringify value', async () => {
  const generateUUID = new GenerateUUID();

  const result = await generateUUID.act();

  // Sanity check by expecting UUID to have 5 segments
  expect(result.split('-')).toHaveLength(5);
});
