import ReCAPTCHAVault from './re-captcha-vault';

it('should create vault', () => {
  // Sanity test
  const secretKey = 'secretKey';
  const vault = new ReCAPTCHAVault({ secretKey });
  expect(vault.get('secretKey')).toEqual(secretKey);
  expect(vault.get('backEndOnly')).toEqual(true);
});
