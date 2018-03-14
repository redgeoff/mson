class TestUtils {
  once(emitter, evnt) {
    return new Promise(function(resolve) {
      emitter.once(evnt, function() {
        resolve(arguments);
      });
    });
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
}

export default new TestUtils();
