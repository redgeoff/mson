# Design

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
