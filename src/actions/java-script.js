import Action from './action';

export default class JavaScript extends Action {
  _className = 'JavaScript';

  _create(props) {
    super._create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'function',
            component: 'Field',
            required: true,
          },
        ],
      },
    });
  }

  set(props) {
    // Note: this code is intentionally commented out as it introduces the risk of XSS attacks. This
    // code should REMAIN commented out in MSON, but is left here as something that can be enabled
    // by forks. It also serves as a reminder why we don't deserialize JS in MSON. See
    // https://github.com/redgeoff/mson/blob/main/DESIGN.md#why-doesnt-mson-support-custom-js-in-template-parameters
    // for longer explanation
    //
    // if (props.function !== undefined && typeof props.function !== 'function') {
    //   // Note: use of `new Function` doesn't allow access to local scope:
    //   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function
    //   props = {
    //     ...props,
    //     function: new Function(
    //       'props',
    //       `const f = ${props.function.toString()}; return f(props);`
    //     ),
    //   };
    // }

    super.set(props);
  }

  async act(props) {
    const fun = this.get('function');
    return await fun({
      ...props,
      globals: this._globals,
      session: this._componentFillerProps._getSession(),
      self: this, // Use self instead of "this" as "this" is a reserved keyword
    });
  }
}
