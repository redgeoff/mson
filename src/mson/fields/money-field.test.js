import MoneyField from './money-field';

it('should format display value using mask', () => {
  const dollars = new MoneyField({ value: '1000000.10' });

  expect(dollars.getValue()).toEqual('1000000.10');
  expect(dollars.getDisplayValue()).toEqual('$1,000,000.10');

  const euros = new MoneyField({
    value: '1000000.10',
    prefix: '€',
    includeThousandsSeparator: true,
    thousandsSeparatorSymbol: '.',
    // decimalSymbol: ',',
    allowDecimal: true,
    decimalLimit: 2
  });

  expect(euros.getValue()).toEqual('1000000.10');

  // TODO: correct after bug in createNumberMask is fixed
  // expect(euros.getDisplayValue()).toEqual('€1.000.000,10');
  expect(euros.getDisplayValue()).toEqual('€1.000.000.10');
});
