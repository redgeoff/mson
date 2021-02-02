# Design

## Design Principles

### MSON & JS Parity

There is parity between compiled and uncompiled components so that the same feature set is supported by both compiled and uncompiled code.

### Compilation by instantiation

Components are _compiled_ into JS objects by simply instantiating a JS object and setting the props dynamically. This method of _compilation_ allows us to avoid a transpilation step and makes it much easier to dynamically modify components.

### Serialization & deserialization without `eval()`

Components can be serialized using `JSON.stringfy()` and stored practically anywhere. Moreover, components can be deserialized by dynamically compiling the result of `JSON.parse()`. As a result, raw JS (in a string), including JS template literals, are not supported as deserializing such JS would require the use of `eval()` or `new Function()`, which would expose a [XSS vulnerability](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!) and add significant performance issues.

### Simplicity through Synchrony

Nearly every operation results in calling `set()` and `get()` on a component. If `set()` and `get()` were made asynchronous, every function would become asynchronous and this would lead to convoluted code. Instead, asynchronous logic is handled by pub/sub.

### Template Parameters

Compiled components are those where MSON is executed in the constructor. As such, parent props can be passed to replace template parameters in the MSON before compiling. This provides parity with how components are dynamically instantiated in compiled components.

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

Components, like CollectionField, create an instance of a form for each record. Often, users view a large number of records simultaneously and therefore the instantiation of these forms must be very fast. An initial implementation of CollectionField created a new instance of the form using a recursive clone. The simplicity of this approach meant that it was easy to customize this instance via listeners and then the customized instance would be cloned. The downside of this approach was that doing a recursive clone in JS is very inefficient as it requires a recursive walk of the object. This inefficiency introduces a very apparent latency in the UI. You can optimize the clone by instantiating a new instance, doing a recursive clone of the properties and then setting these properties on the new instance. The instantiation is done by analyzing the `className` and using `compiler.getCompiledComponent(className)` and is therefore only available for registered components. Unfortunately, even with this optimization, the latency is significant as it requires a deep clone of the properties and a recursive walk of the original instance.

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

## Errors Are Named Err

All components are EventEmitters and Node.js EventEmitters reserve special treatment for the `error` event. If there is no listener for the `error` event, a stack trace is printed and the process will exit. In MSON, errors are properties and as such they emit an event with the same name. In many cases it isn't necessary to have an event handler to process errors as these errors happen synchronously. In order to avoid this special treatment, we name all errors `err`.

## Elevate vs Flatten

The original idea was to use a _flatten_ property on `Field` and modify `Form.getValues()` to flatten, e.g. `{ name: { firstName: 'First', lastName: 'Last' }}` would become `{ firstName: 'First', lastName: 'Last' }`. The issue is that this also requires `set()` to perform an "unflatten" and this is adds complexity. Specifically, the parent form would need to maintain extra data in the form of a list of flattened fields, so that the form knows where to route the flattened value. Instead, when an _elevated_ FormField is added to a form, the actual fields, validators and listeners are added to this parent form, making it identical to creating the fields, validators and listeners directly on the parent. This allows us to create fields like the `AddressField`, which can wrap all the logic for an address, but the AddressField can then be elevated so that the values appear directly on the parent form.

## Sequential vs Linked-List Ordering

Sequential ordering sorts according to a numeric _order_ attribute. Linked list ordering uses pointers, e.g. a _beforeId_ (and _afterId_), to construct the ordered list. Details of the two designs are discussed at https://stackoverflow.com/q/9536262/2831606.

MSON uses doubly-linked-list ordering in its Mapa, which allows for very performant item moves and partial iterations. Initially, stores in MSON used linked-list ordering as this ordering only requires editing 2 records. Alternatively, sequential ordering can require a modification to all the items located between the source and destination. Therefore, the transactional load is lower with linked-list ordering and so are the chances of a race condition.

Unfortunately, linked-list ordering adds a great deal of extra complexity. Moreover, it requires loading the entire set to construct the order, something that can be noticable in the UI for large sets. In addition, it can take 2 iterations of the set to order it as on the first iteration there may be pointers to items that have not yet been loaded. And, race conditions can lead to strange circular patterns. Because of these reasons, and the fact that sequential ordering is more natively supported by most databases, MSON now uses sequential ordering.

## Reordering

Sequential ordering requires reordering of all affected rows. The simple approach is to use queries:
```
-- Move up
SET order = order + 1
WHERE
  order >= newOrder
  AND order < oldOrder

-- Move down
SET order = order - 1
WHERE
  order > oldOrder
  AND order <= newOrder
```
This however, will not fix data problems caused by race conditions. We assume that race conditions will occur because we do not require transactions. Transactions can be slow as we want our solution to be portable across different databases, some databases may not implement transactions. Instead, we can use a quick algorithm that simply iterates over all the docs and sets/corrects the _order_ value. This should be acceptable as we assume that sequential ordering is only being used with relatively small data sets, e.g. a user dragging items to sort them in a list.

Another important detail is that reordering is done in the front end so that the front end can perform ordering on custom segments of data, e.g. a user may only be able to order her/his set of data. This avoids the complexity of having to alert the back end of the segment details when reordering.

The reordering is performed in the store layer as the store layer has visibility of the entire set, something that is needed when reordering. Other front-end layers, like the CollectionField, may be viewing a smaller set of data, e.g. what is done during pagination.

The DEFAULT_ORDER is set when ordering is turned off (being ignored) as it allows us to skip expensive calculations, like reordering, when the _order_ is not changing. Moreover, the DEFAULT_ORDER is used when a doc is archived and should be removed from the ordered list. The DEFAULT_ORDER is `-1` and not `null` because use of cursors translates to performing queries like `WHERE order>null`, which don't work as needed.

## Why is the component constructor named __create_?

By naming the constructor `_create`, we are able to wrap the constructor logic so that things can be executed before and after the constructor. For example, this allows the `BaseComponent` to emit a `create` event after the component has been created without requiring the extended component to explicitly perform the emit. In addition, it allows components to perform logic before running the super's `_create`, e.g. the compiler compiles JSON before creating a component. Or, when a member variable is needed before the initial call to `set()`. This would not be possible with a standard JS constructor as the first line in a constructor must be `super(...)`.

## Template parameter queries

It is possible to chain together a series of actions to accomplish almost anything. The downside to this approach is that your code can quickly become bloated and you may be required to create a number of custom actions. Consider an example where we want to increment the value of a counter if the counter is not null. Assume that we have a custom component called `Increment`, which increments values and does not work with null values:

```js
{
  name: 'MyForm',
  component: 'Component',
  schema: {
    component: 'Form',
    fields: [
      { name: 'counter', component: 'IntegerField' }
      { name: 'submit', component: 'ButtonField' }
    ]
  },
  listeners: [
    {
      event: 'submit',
      if: {
        'fields.counter.value': null
      },
      actions: [
        {
          // The counter is null so assume it is now 1
          component: 'Set',
          name: 'fields.counter.value',
          value: 1
        }
      ],
      else: [
        {
          // Assume Increment doesn't work with null values
          component: 'Increment',
          value: '{{fields.counter.value}}
        },
        {
          component: 'Set',
          name: 'fields.counter.value',
          // Output of the Increment action above is available at {{arguments}}
          value: '{{arguments}}
        }
      ]
    }
  ]
}
```

Instead, with Template Parameter Queries, we can use [Mongo aggregation operators](https://docs.mongodb.com/manual/reference/operator/aggregation/#expression-operators) to accomplish this functionality in fewer lines of code:

```js
{
  name: 'MyForm',
  component: 'Component',
  schema: ...,
  listeners: [
    {
      event: 'submit',
      actions: [
        component: 'Set',
        name: 'fields.counter.value',
        value: {
          $cond: [
            { $eq: ['{{fields.counter.value}}', null] },
            1, // Initial increment
            { $add: ['{{fields.counter.value}}', 1] } // Subsequent increment
          ]
        }
      ]
    }
  ]
}
```

### Why doesn't MSON support custom JS in template parameters?

To support custom JS in template parameters, would require breaking two of MSON's core design principles:
1. [Compilation by instantiation](DESIGN.md#compilation-by-instantiation)
1. [Serialization & deserialization without `eval()`](DESIGN.md#serialization--deserialization-without-eval)

That being said, let's take a walk through some of the possibilities here to investigate the tradeoffs:

#### Support Mongo aggregations via Mingo

Note: this design was chosen an implemented in MSON.

[Mingo](https://github.com/kofrasa/mingo) is a library that has comprehensive support for [Mongo aggregation operators](https://docs.mongodb.com/manual/reference/operator/aggregation/#expression-operators). The syntax is bit more verbose than custom JS, but it can be deserialized without using `eval()`. Moreover, the query syntax is declarative and should therefore be easier to configure via a UI generator. As of Jan, 2020, Mingo adds 70KB (uncompressed) to the MSON bundle, but provides an enormous amount of functionality.

#### Convert string to JS on the fly:

e.g.
```js
value: "p.get('fields.foo.value').join(',') + 'some string'"
```

To evaluate the string as JS, you’d need to use `new Function()` (or `eval()`), which are unsafe as they allow for [injection hacking](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!), where arbitrary JS can be run. You can permit this with `unsafe-eval`, but it is strongly discouraged.

#### Transpile the string to JS with a build step

e.g.
```js
value: '{{foo.value + "bar"}}'
```
becomes
```js
value: () => `${p.get('foo.value') + "bar"}`
```

This option is much safer than using `eval()` and is how a lot of templating languages, like [JSX](https://reactjs.org/docs/introducing-jsx.html), work. That being said, introducing a transpilation step, creates a significant barrier for applications wishing to seamlessly deserialize components.

#### Use a JS parser like acorn

JS parsers like [Acorn](https://github.com/acornjs/acorn), [Esprima](https://esprima.org/), and [Meriyah](https://github.com/meriyah/meriyah) could be used to dynamically parse JS code into an Abstract Syntax Tree (AST). A custom evaluator could then be written to evaluate the parsed AST. These parsers are wonderful tools, but they typically implement most, if not all, JS constructs making them very large dependencies. It also feels a bit redundant to add a JS interpreter in the MSON run-time when the run-time itself is running on a JS interpreter, e.g. Node/browser. Moreover, it would be nearly impossible to create a JS interpreter that runs in JS that is faster than lowest-level JS interpreter. At this point, it would perhaps just be better to introduce a transpilation step.

Uncompressed increases to the MSON bundle size:
1. Acorn: 105KB
1. Esprima: 135KB
1. Meriyah: 100KB

#### Use a parsing toolkit like ohm-js to create a custom interpreter

We can use something like [ohm-js](https://github.com/harc/ohm) to create a interpreter and even scale back the language capabilities. The issue here is that we'd be reinventing the wheel on writing a JS interpreter and we'd be bringing in a large dependency to MSON.

#### Write a custom JS interpreter

There are nice articles, like [How to Write a Simple Interpreter](https://www.codeproject.com/Articles/345888/How-to-Write-a-Simple-Interpreter-in-JavaScript), that provide examples on how to write simple JS-like interpreters. If the JS feature set was minimized to support something like, `(a + b - c * d / e) + (f && g == 3 || h >= 1? !i : 'j') + "k"`, the custom interpreter code would not add much of a footprint to MSON. The downside is that this effort would be somewhat significant and it is likely that there will always be the desire to add yet another piece of JS functionality, until you are left reimplementing a complete JS interpreter.

#### Property naming considerations

If we were to enable a custom JS interpreter we'd probably need to consider what it would take a to preserve the existing dot name notation that is currently supported by MSON. For example we'd want to be able to use:
```js
{{foo.value + 'bar'}}
```
Instead of what is already supported in the JS layer of MSON:
```js
{{component.get('value') + 'bar'}}
```

Here are some ways that this could be accomplished:

1. Define JS getters/setters (and use Proxy) on the components. [Proof of concept](https://github.com/redgeoff/mson/pull/300)

1. Parse the JS into an Abstract Syntax Tree (AST), and then create a custom evaluation layer so that it can dynamically retrieve values from the components

1. Render a list of name/value pairs for all components and pass it to the interpreter. For deeply nested access however, including access to parent attributes (and their parent's, etc...) would be a __very__ expensive operation

1. Require JS to be in another, explicit format, e.g. ``props.component.get('foo.value') + '123'``. Variation: require variables to be wrapped in {{}}, e.g. ``{{fields.foo.value}} + '123'``