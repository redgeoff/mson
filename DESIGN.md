# Design

## Design Principles

  - This is parity between compiled and uncompiled components so that the same feature set is supported by both compiled and uncompiled code.

  - Compiled components are those where MSON is executed in the constructor. As such, parentProps can be passed to replace template parameters in the MSON before compiling, which provides parity with how components are dynamically instantiated in compiled components.

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
