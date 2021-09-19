import Component from './component';

// TODO: explain different options
//
// styles: [ // VERBOSE, BUT VERY EXTENSIBLE. THINK STYLES FOR ANIMATIONS, ETC... => Can also be supported in future
//   {
//     component: 'Margin',
//     top: 1,
//     left: 1,
//     right: 1,
//     bottom: 1
//   }
// ],
// or:
// styles: [ // THIS IS VERY HTML SPECIFIC AND NOT PORTABLE TO OTHER ENVS
//   {
//     component: 'Style',
//     style: 'margin',
//     value: '1 1 1 1'
//   }
// ]
// or:
// styles: { // ALL STYLES IN SINGLE PLACE, BUT CAN BE REUSUABLE
//   component: 'Styles',
//   marginTop: 1,
//   width: '100%'
// }
// or:
// marginTop: 1 // Defined directly inline for each component

export default class Styles extends Component {
  className = 'Styles';

  create(props) {
    super.create(props);

    this.set({
      schema: {
        component: 'Form',
        fields: [
          {
            name: 'marginTop',
            component: 'NumberField',
            label: 'Margin Top',
            docLevel: 'basic',
          },
        ],
      },
    });
  }
}
