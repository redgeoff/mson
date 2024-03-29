import NumberField from './number-field';

export default class MoneyField extends NumberField {
  className = 'MoneyField';

  create(props) {
    super.create(props);

    const { prefix, thousandsSeparatorSymbol, allowDecimal, decimalLimit } =
      props;

    // Note: we cannot use setDefaults as we need to utilize inherited logic in set()
    this.set({
      prefix: prefix !== undefined ? prefix : '$',
      thousandsSeparatorSymbol:
        thousandsSeparatorSymbol !== undefined ? thousandsSeparatorSymbol : ',',
      allowDecimal: allowDecimal !== undefined ? allowDecimal : true,
      decimalLimit: decimalLimit !== undefined ? decimalLimit : 2,
    });
  }
}
