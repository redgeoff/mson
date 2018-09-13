# Design

## Design Principles

  - MSON & JS Parity: There is parity between compiled and uncompiled components so that the same feature set is supported by both compiled and uncompiled code.

  - Simplicity through Synchrony: Nearly every operation results in calling set and get on a component. If set and get were made asynchronous, every function would become asynchronous and this would lead to convoluted code. Instead, asynchronous logic is handled by pub/sub.

  - Template Parameters: Compiled components are those where MSON is executed in the constructor. As such, parentProps can be passed to replace template parameters in the MSON before compiling. This provides parity with how components are dynamically instantiated in compiled components.

## Wrapping vs High Order Components

High order components come with a small speed improvement as an actual object is returned instead of a class that wraps an object, i.e. there isn't an extra abstraction layer. However, the problem with using high order components is that they return functions and in MSON, everything is a class so you get funky issues when you try to inherit from a high order component--it doesn’t work as you have no class to extend. The only option here is to wrap the component and this makes it confusing as to when to use a high order component and when to wrap. Therefore, it is always best to wrap.

An uncompiled high order component could be represented as:

```js
const addMiddleName = {
  component: 'Form',
  fields: [
    {
      name: 'middleName',
      component: 'TextField'
    }
  ]
}
```

And its compiled counterpart looks something like:

```js
addMiddleName(form) {
  return form.set({
    fields: [
      new TextField({
        name: 'middleName'
      })
    ]
  })
}
```

The issue is with inheritance of a high order component. Let wrappedComponent indicate a high order component:

```js
const firstName = {
  name: 'FirstName',
  component: 'Form',
  fields: [
    {
      name: 'firstName',
      component: 'TextField'
    }
  ]
}

const addMiddleName = {
  name: 'AddMiddleName',
  component: 'Form',
  wrappedComponent: {
    component: 'FirstName'
  },
  fields: [
    {
      name: 'middleName',
      component: 'TextField'
    }
  ]
}

const addLastName = {
  name: 'AddLastName',
  component: 'AddMiddleName',
  fields: [
    {
      name: 'lastName',
      component: 'TextField'
    }
  ]
}
```

Specifically, AddMiddleName is a function that returns an object and we need a class definition to be able to extend it for AddLastName.

Instead, we could wrap the component in AddMiddleName, but this would then lead to supporting both high order components and wrapping, which is confusing. And, once you use a high order component, you can no longer extend it. Therefore, it is best to just wrap.

## Dynamic Composition vs Dynamic inheritance

Using dynamic inheritance is appealing as it has a simpler syntax than dynamic composition, but it breaks our design principle of having parity between our compiled and uncompiled components and introduces another layer of complexity in inheritance that is not present in most programming languages. Moreover, during schema validation of components we don't always have an instance of the dynamic component, as there is nothing to pass in, and therefore we have to guess the dynamic component before we can build our schema.

Uncompiled dynamic inheritance looks like:

```js
const addMiddleName = {
  name: 'AddMiddleName',
  component: '{{baseForm}}',
  fields: [
    {
      name: 'middleName',
      component: 'TextField'
    }
  ]
}
```

There is no compiled counterpart to this as the following is not valid:

```js
class MyExtendingComponent extends {{baseForm}} {}
```

Instead, you can represent a similar idea with dynamic composition:

```js
const addMiddleName = {
  name: 'AddMiddleName',
  component: 'Form',
  componentToWrap: '{{baseForm}}'
  fields: [
    {
      name: 'middleName',
      component: 'TextField'
    }
  ]
}
```

And the compiled counterpart looks like:

```js
class AddMiddleName extends Form {
  _create(props) {
    super._create(Object.assign({}, props, { componentToWrap: props.componentToWrap }));

    this.set({
      fields: [
        new TextField({
          name: 'middleName'
        })
      ]
    })
  }
}
```

## Factory vs Clone

Components, like FormsField, create an instance of a form for each record. Often, users view a large number of records simultaneously and therefore the instantiation of these forms must be very fast. An initial implementation of FormsField created a new instance of the form using a recursive clone. The simplicity of this approach meant that it was easy to customize this instance via listeners and then the customized instance would be cloned. The downside of this approach was that doing a recursive clone in JS is very inefficient as it requires a recursive walk of the object. This inefficiency introduces a very apparent latency in the UI. You can optimize the clone by instantiating a new instance, doing a recursive clone of the properties and then setting these properties on the new instance. The instantiation is done by analyzing the `className` and using `compiler.getCompiledComponent(className)` and is therefore only available for registered components. Unfortunately, even with this optimization, the latency is significant as it requires a deep clone of the properties and a recursive walk of the original instance.

Alternatively, a factory, a function that creates an instance of a component, is a much faster method of instantiation. Here is an example factory that creates a form:

```js
{
  component: 'Factory',
  product: {
    component: 'Form',
    fields: [
      {
        name: 'firstName',
        component: 'TextField'
      }
    ]
  }
}
```

Factories can also contain extra `properties` that are set after a component is produced:

```js
{
  component: 'Factory',
  product: {
    component: 'Form',
    fields: [
      {
        name: 'firstName',
        component: 'TextField'
      }
    ]
  },
  properties: {
    fields: [
      {
        name: 'middleName',
        component: 'TextField'
      }
    ]
  }
}
```

The properties are set after the component is instantiated and not in the constructor of the component as this allows for the seamless handling of properties with the same key. If not, things like new fields would overwrite existing fields.

You can even wrap a factory around another factory, allowing for extension through composition:

```js
{
  component: 'Factory',
  product: {
    component: 'Factory',
    product: {
      component: 'Form',
      fields: [
        {
          name: 'firstName',
          component: 'TextField'
        }
      ]
    }
    properties: {
      fields: [
        {
          name: 'middleName',
          component: 'TextField'
        }
      ]
    }
  },
  properties: {
    fields: [
      {
        name: 'lastName',
        component: 'TextField'
      }
    ]
  }
}
```

An important detail of a MSON factory is that the properties of the factory are not instantiated until the factory produces a component. This is necessary, as each product of the factory has its own memory space. The JS equivalent of this concept looks like:

```js
new Factory({
  product: () => {
    const form = new Form({
      field: [
        new TextField({ name: 'firstName '})
      ]
    })

    // Fresh instantiation of properties
    form.set({
      fields: [
        new TextField({ name: 'middleName '})
      ]
    })

    return form
  }
})
```

An important performance consideration is that it can be a lot faster to set certain properties via the factory than via the listeners of the product itself. Consider the example where our select options are populated via an API call:

```js
{
  component: 'Factory',
  product: {
    component: 'Form',
    fields: [
      {
        name: 'car',
        component: 'SelectField'
      }
    ],
    listeners: [
      {
        event: 'load',
        actions: [
          {
            component: 'GetFromAPI'
            // ...
          },
          {
            component: 'Iterator'
            // ...
          },
          {
            component: 'Set',
            name: 'fields.car.options'
          }
        ]
      }
    ]
  }
}
```

Even with a cache, this can be very inefficient as it requires a call to get the options each time a form is produced. Instead, we can perform the asynchronous communication once and then quickly copy the result to each produced component:

```js
{
  component: 'Factory',
  product: {
    component: 'Form',
    fields: [
      {
        name: 'car',
        component: 'SelectField'
      }
    ]
  },
  listeners: [
    {
      event: 'load',
      actions: [
        {
          component: 'GetFromAPI'
          // ...
        },
        {
          component: 'Iterator'
          // ...
        },
        {
          component: 'Set',
          name: 'properties',
          value: {
            'fields.car.options': '{{arguments}}'
          }
        }
      ]
    }
  ]
}
```
