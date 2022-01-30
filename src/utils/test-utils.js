// TODO: move to ../test and rename to just utils.js

import compiler from '../compiler';
import Form from '../form';
import utils from './utils';
import Component from '../component/component';

// Throw action errors as we should not receive them in our test environment. Note: we cannot toggle
// this option in a globalSetup as the scope in a globalSetup is not shared with the tests.
Component.setThrowActionErrors(true);

class TestUtils {
  defaultFields = [
    'id',
    'userId',
    'createdAt',
    'updatedAt',
    'archivedAt',
    'order',
  ];

  toDefaultFieldsObject(value) {
    const obj = {};
    this.defaultFields.forEach((name) => (obj[name] = value));
    return obj;
  }

  once(emitter, evnt) {
    return utils.once(emitter, evnt);
  }

  timeout(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // TODO: refactor to use await/async
  waitFor(poll, maxSleep, sleepMs) {
    var totalSleep = 0;

    maxSleep = maxSleep ? maxSleep : 5000;
    sleepMs = sleepMs ? sleepMs : 100;

    return new Promise(function (resolve, reject) {
      var waitFor = function () {
        // Wrap in promise so that waitMore doesn't have to be a promise
        return Promise.resolve()
          .then(function () {
            return poll();
          })
          .then(function (obj) {
            if (typeof obj === 'undefined') {
              if (totalSleep >= maxSleep) {
                reject(new Error('waited for ' + totalSleep + ' ms'));
              } else {
                totalSleep += sleepMs;
                setTimeout(waitFor, sleepMs);
              }
            } else {
              resolve(obj);
            }
          });
      };

      waitFor();
    });
  }

  _expectValuesToHaveErr(field, values, haveErr, err) {
    values.forEach((value) => {
      field.clearErr();
      field.setValue(value);
      field.validate();

      // Use object in expect so that errors are easy to immediately see
      expect({
        value,
        hasErr: field.hasErr(),
      }).toEqual({
        value,
        hasErr: haveErr,
      });

      if (err) {
        expect(field.getErr()).toEqual(err);
      }
    });
  }

  expectValuesToBeValid(field, validValues) {
    this._expectValuesToHaveErr(field, validValues, false);
  }

  expectValuesToBeInvalid(field, invalidValues, err) {
    this._expectValuesToHaveErr(field, invalidValues, true, err);
  }

  expectSchemaToBeValid(component, values) {
    const schemaForm = new Form();
    component.buildSchemaForm(schemaForm, compiler);

    schemaForm.setValues(values);
    schemaForm.validate();
    expect(schemaForm.hasErr()).toEqual(false);
  }

  // Note: this doesn't appear to work so we use the implementation below
  // async expectToFinishBefore(promiseFactory, milliseconds) {
  //   const timer = async () => {
  //     await testUtils.timeout(milliseconds);
  //     throw new Error('took more than ' + milliseconds + ' milliseconds');
  //   }
  //   return Promise.race([timer(), promiseFactory()])
  // }

  // Note: the built in timeout per test in jest doesn't appear to work so here is a custom routine.
  async expectToFinishBefore(promiseFactory, milliseconds) {
    const begin = new Date();
    await promiseFactory();
    if (new Date().getTime() - begin.getTime() > milliseconds) {
      throw new Error('took more than ' + milliseconds + ' milliseconds');
    }
  }

  async sleepToEnsureDifferentTimestamps() {
    // Sleep for 2 milliseconds as timestamps can be the same with 1 millisecond
    return this.timeout(2);
  }

  mockActionGlobals(action, mockedGlobals) {
    action._componentFillerProps._getGlobals = () => mockedGlobals;
    action._globals = mockedGlobals;
  }

  mockActionRegistrar(action, mockedRegistrar) {
    // TODO: uncomment when used. Commented out for test coverage reasons
    // action._componentFillerProps._registrar = () => mockedRegistrar;
    action._registrar = mockedRegistrar;
  }

  mockActions(actions, acts, stub, mockedGlobals, mockedRegistrar) {
    actions.forEach((action) => {
      const actions = action._getProperty('actions');
      const elseActions = action._getProperty('else');
      if (actions || elseActions) {
        // if (actions) { // TODO: uncomment if needed
        this.mockActions(actions, acts, stub, mockedGlobals, mockedRegistrar);
        // }
        if (elseActions) {
          this.mockActions(
            elseActions,
            acts,
            stub,
            mockedGlobals,
            mockedRegistrar
          );
        }
      } else {
        const origAct = action.act;
        const spy = jest.fn();
        action.act = function () {
          acts.push({
            name: action.getClassName(),
            props: action.get(),
            spy,
          });

          spy.apply(spy, arguments);

          if (!stub) {
            return origAct.apply(this, arguments);
          }
        };
      }

      if (mockedGlobals) {
        this.mockActionGlobals(action, mockedGlobals);
      }
      if (mockedRegistrar) {
        this.mockActionRegistrar(action, mockedRegistrar);
      }
    });
  }

  mockAction(action, acts, stub, mockedGlobals, mockedRegistrar) {
    this.mockActions([action], acts, stub, mockedGlobals, mockedRegistrar);
  }

  expectActsToContain(acts, expActs) {
    expect(acts).toHaveLength(expActs.length);
    expActs.forEach((expAct, i) => {
      const act = acts[i];
      const actualProps = {};
      if (expAct.props !== undefined) {
        Object.keys(expAct.props).forEach((name) => {
          actualProps[name] = act.props[name];
        });
      }
      const actualAct = { name: act.name };
      if (expAct.props !== undefined) {
        actualAct.props = actualProps;
      }
      expect(actualAct).toEqual(expAct);
    });
  }

  mockComponentListeners(
    component,
    acts,
    event,
    stub,
    mockedGlobals,
    mockedRegistrar
  ) {
    const listeners = component.get('listeners');
    listeners.forEach((listener) => {
      if (!event || listener.event === event) {
        this.mockActions(
          listener.actions,
          acts,
          stub,
          mockedGlobals,
          mockedRegistrar
        );
      }
    });
  }
}

export default new TestUtils();
