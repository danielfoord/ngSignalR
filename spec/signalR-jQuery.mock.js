(function () {

  /**
  * Not Using generated proxy mocks
  */
  window.$mockSignalrNoProxy = {
    hubConnection: function () {
      return {
        createHubProxy: function () {
          var proxy = {
            on: function (fnName, callback) {
              callback.call(null);
            },
            invoke: function (fnName, payload) {
              return payload;
            }
          };
          return proxy;
        }, 
        stop: function () {
          return true;
        },
        start: function () {
          return { done: function () {} };
        },
        logging:        false,
        starting:       function () {},
        received:       function () {},
        connectionSlow: function () {},
        reconnecting:   function () {},
        reconnected:    function () {},
        stateChanged:   function () {},
        disconnected:   function () {},
        error:          function () {}
      };
    }
  };

  /**
  * Using generated proxy mocks
  */
  window.$mockSignalrProxy = {
    connection: {
      mockHub : {
        stop: function () {
          return true;
        }, 
        client : {},
        server: {
          mockFnName: function (payload) {
            return payload;
          }
        }
      },
      mockHub2 : {
        stop: function () {
          return true;
        },
        client: {},
        server: {
          mockFnName: function (payload) {
            return payload;
          }
        }
      },
      hub:{
        start: function () {
          return { done: function () {} };
        },
        logging :       false,
        starting:       function () {},
        received:       function () {},
        connectionSlow: function () {},
        reconnecting:   function () {},
        reconnected:    function () {},
        stateChanged:   function () {},
        disconnected:   function () {},
        error:          function () {}
      }
    }
  };

})();
