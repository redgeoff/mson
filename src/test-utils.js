// TODO: move to ../test and rename to just utils.js

import compiler from './compiler';
import Form from './form';
import utils from './utils';

class TestUtils {
  defaultFields = [
    'id',
    'userId',
    'createdAt',
    'updatedAt',
    'archivedAt',
    'order'
  ];

  toDefaultFieldsObject(value) {
    const obj = {};
    this.defaultFields.forEach(name => (obj[name] = value));
    return obj;
  }

  once(emitter, evnt) {
    return utils.once(emitter, evnt);
  }

  timeout(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  // TODO: refactor to use await/async
  waitFor(poll, maxSleep, sleepMs) {
    var totalSleep = 0;

    maxSleep = maxSleep ? maxSleep : 5000;
    sleepMs = sleepMs ? sleepMs : 100;

    return new Promise(function(resolve, reject) {
      var waitFor = function() {
        // Wrap in promise so that waitMore doesn't have to be a promise
        return Promise.resolve()
          .then(function() {
            return poll();
          })
          .then(function(obj) {
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
    values.forEach(value => {
      field.clearErr();
      field.setValue(value);
      field.validate();

      // Use object in expect so that errors are easy to immediately see
      expect({
        value,
        hasErr: field.hasErr()
      }).toEqual({
        value,
        hasErr: haveErr
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

  // TODO: I don't think async testing with jest is working properly
  // (https://facebook.github.io/jest/docs/en/expect.html#rejects). When it does, refactor out this
  // helper fn
  async expectToThrow(promiseFactory, errorNameOrError, errorMessage) {
    let err = {
      name: 'NoError'
    };

    try {
      await promiseFactory();
    } catch (_err) {
      err = _err;
    }

    if (errorNameOrError) {
      if (typeof errorNameOrError === 'string') {
        expect(err.name).toEqual(errorNameOrError);
      } else {
        expect(err).toEqual(errorNameOrError);
      }
    }

    if (errorMessage) {
      expect(err.message).toEqual(errorMessage);
    }

    return err;
  }

  async sleepToEnsureDifferentTimestamps() {
    // Sleep for 2 milliseconds as timestamps can be the same with 1 millisecond
    return this.timeout(2);
  }
}

export default new TestUtils();
