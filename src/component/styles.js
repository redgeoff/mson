// Why is Styles implemented this way?
//
// Option A - explicity define style props for each component:
//   marginTop: 1
//   - This would lead to a lot of code that is not reusable
//
// Option B - array of Style objects:
//   styles: {
//     component: 'Styles',
//     styles: [
//       {
//         component: 'StyleMargin',
//         top: 1,
//         bottom: 1
//       }
//     ]
//   }
//   - This construct is verbose
//   - It is very extensible, i.e. you could define animations, etc...
//
// Option C - define a single Styles component:
//   styles: {
//     component: 'Styles',
//     marginTop: 1,
//     marginBottom: 1
//   }
//   - A reusable construct for defining a style
//   - All styles are combined into a single Style component, which can become messy
//   - Can be enhanced later to also support Option B

// Note: we want to avoid defining any HTML-specific styles so that this construct is usable in
// other environments, e.g. mobile
const styles = {
  component: 'Component',
  name: 'Styles',
  schema: {
    component: 'Form',
    fields: [
      {
        name: 'marginTop',
        component: 'NumberField',
        label: 'Margin Top',
        docLevel: 'basic',
      },
      {
        name: 'marginRight',
        component: 'NumberField',
        label: 'Margin Right',
        docLevel: 'basic',
      },
      {
        name: 'marginBottom',
        component: 'NumberField',
        label: 'Margin Bottom',
        docLevel: 'basic',
      },
      {
        name: 'marginLeft',
        component: 'NumberField',
        label: 'Margin Left',
        docLevel: 'basic',
      },
    ],
  },
};

export default styles;
