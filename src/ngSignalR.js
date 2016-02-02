/**
 * ng-SignalR
 * @author danielfoord
 * @license MIT License
 * SignalR - http://signalr.net/
 * AngularJS - https://angularjs.org/
 */
angular.module('ngSignalR', [])
.constant('$', window.$)
.provider('signalr', [function () {

  'use strict';

  var self = this;

  //Transport methods used by SignalR
  self.transports = [
    'webSockets',
    'serverSentEvents',
    'foreverFrame',
    'longPolling'
  ];

  self.log = true;

  var errmsg = {
    callback: 'Callback function is not a function',
    errCallback: 'ErrorCallback function is not a function'
  };

  self.setTransports = function (transports) {
    if (!angular.isArray(transports)) {
      throw new Error('setTransports expects an \'Array\'');
    } else {
      self.transports = transports;
    }
  };

  self.getTransports = function () {
    return self.transports;
  };

  self.logging = function (log) {
    self.log = log;
  };

  function checkConnectionCallback(connection, callback, noProxyCallback, proxyCallback) {
    if (angular.isFunction(callback) && angular.isDefined(connection)) {
      noProxyCallback.call(null, connection, callback);
    } else if (angular.isFunction(callback) && angular.isUndefined(connection)) {
      proxyCallback.call(null, callback);
    }  else if (!angular.isFunction(callback)) {
      throw new TypeError(errmsg.callback);
    }
  }

  self.$get = ['$rootScope', '$q', '$', function ($rootScope, $q, $) {

    //Get provided transports to use in connections.
    var transports = self.transports;

    //Global collection of all active connections.
    var connections = [];

    return {
      /**s
       * Creates a Connection to a SignalR Hub without the generated proxy.
       * @param  {String} channel - Camel case reference to SingalR hub class.
       * @param  {String} url - The URL to connect to if the server is not on the
                                same domain.
       * @returns {Object} - Returns Proxy and Connection.
       */
      createHubConnection: function (channel, url) {

        if (angular.isDefined(channel)) {
          var connection;

          if (angular.isDefined(url)) {
            connection = $.hubConnection(url);
          } else {
            connection = $.hubConnection();
          }

          connection.logging = self.log;

          var cons = connections;
          cons.push(connection);

          var proxy = connection.createHubProxy(channel);
          return {
            connection: connection,
            proxy: proxy
          };
        } else {
          throw new Error('channel is undefined');
        }

      },

      /**
       * Creates socket connection using the generated proxy.
       * @param  {String} channel - Camel case reference to SingalR hub class.
       * @param  {String} url - The URL to connect to if the server is not on the
                                same domain.
       * @returns {Object} - Returns Connection.
       */
      createConnection: function (channel, url) {

        if(angular.isDefined(channel)) {
          if (angular.isDefined(url)) {
            $.connection.hub.url = url;
          }

          $.connection.hub.logging = self.log;

          var connection = $.connection[channel],
              cons = connections;

          cons.push(connection);

          return connection;
        } else {
          throw new Error('channel is undefined');
        }

      },

      /**
       * Stops the hubs API Connection to a SignalR Hub.
       * @returns {Promise} - Returns a promise that is resolved when the connection is terminated.
       */
      stopConnection: function (connection) {

        var deferred = $q.defer(),
            cons = connections;

        try {
          cons.splice(cons.indexOf(connection), 1);
          connection.stop();
          deferred.resolve();
        } catch (ex) {
          deferred.reject(ex);
        }

        return deferred.promise;

      },

      /**
       * Stops all active connections to the server.
       * @returns {Promise} - Returns a promise that is resolved when all the connections are terminated.
       */
      stopAllConnections: function () {

        var deferred = $q.defer(),
            cons = connections;

        try {
          for (var i in cons) {
            cons[i].stop();
          }
          connections = [];
          deferred.resolve();
        } catch (ex) {
          deferred.reject(ex);
        }

        return deferred.promise;

      },

      /**
       * Function that executes when a connection is made without the generated proxy.
       * @param {Object} connection - Connection on which to execute the callback.
       * @returns {Promise} - Returns a promise that is resolved when the connection is made.
       */
      startHubConnection: function (connection) {

        if(angular.isDefined(connection)) {
          var deferred = $q.defer();

          connection.start({
            transport: transports
          })
          .done(function () {
            deferred.resolve();
          });

          return deferred.promise;
        } else {
          throw new Error('connection is undefined');
        }

      },

      /**
       * Function that executes when a connection is made using the generated proxy.
       * @returns {Promise} - Returns a promise when the connection is made.
       */
      startConnection: function () {

        var deferred = $q.defer();

        $.connection.hub.start({
          transport: transports
        }).done(function () {
          deferred.resolve();
        });

        return deferred.promise;

      },

      /**
       * Recevies a payload from the Server from the specified hub without the generated proxy.
       * @param {Object} proxy - The proxy returned from the hub.
       * @param {String} fnName - Camel Case reference to the SignalR funciton that sends the payload.
       * @param {Function} callback - The callback that Executes when a payload is received.
       */
      receiveProxy: function (proxy, fnName, callback) {

        if (callback && !angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        }
        proxy.on(fnName, callback);

      },

      /**
       * Recevies a payload from Hub using with the generated proxy.
       * @param {Object} connection - The connection from the hub
       * @param {String} fnName - Camel Case reference to the SignalR funciton that sends payload to the client.
       * @param {Function} callback - The callback that Executes when a payload is received.
       */
      receive: function (connection, fnName, callback) {

        if (callback && angular.isFunction(callback)) {
          connection.client[fnName] = callback;
        } else if (callback && !angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        }

      },

      /**
       * Sends a payload to the specfied SignalR Hub without the generated proxy.
       * @param {Object} proxy - The proxy on which to send.
       * @param {String} fnName - Camel Case reference to the SignalR funciton that receives the client payload.
       * @param {Object} data - The payload to send to the server.
       * @param {Function} [errorCallback] - fires if invocation fails.
       */
      sendProxy: function (proxy, fnName, data, errorCallback) {

        if (errorCallback && !angular.isFunction(errorCallback)) {
          throw new TypeError(errmsg.errCallback);
        } else if (errorCallback) {
          proxy.invoke(fnName, data).fail(errorCallback);
        } else {
          proxy.invoke(fnName, data);
        }

      },

      /**
       * Sends a payload to the specfied SignalR Hub.
       * @param {Object} connection - The connection from the hub.
       * @param {String} fnName - Camel Case reference to the SignalR funciton that receives the client payload.
       * @param {Object} data - The payload to send to the server.
       * @param {Function} [errorCallback] - fires if invocation fails.
       */
      send: function (connection, fnName, data, errorCallback) {

        if (errorCallback && !angular.isFunction(errorCallback)) {
          throw new TypeError(errmsg.errCallback);
        } else if (errorCallback) {
          connection.server[fnName](data).fail(errorCallback);
        } else {
          connection.server[fnName](data);
        }

      },

      /**
       * Sets Client logging.
       * @param {Boolean} enable - Specifies if client logging should be enabled.
       * @param {Object} [connection] - The connection to log: If not given will use generated proxy.
       */
      logging: function (enable, connection) {

        if (angular.isUndefined(connection)) {
          $.connection.hub.logging = enable;
        } else {
          connection.logging = enable;
        }

      },

      /**
       * starting Lifetime event with proxy connection.
       * @param {Function} callback - Executes when starting Lifetime event fires.
       * @param {Object} [connection] - The connection to log: If not given will use generated proxy.
       */
      starting: function (callback, connection) {
        checkConnectionCallback(connection, callback,
          function (connection, callback) {
            connection.starting(callback);
          }, function (callback) {
            $.connection.hub.starting(callback);
          });
      },

      /**
       * received Lifetime event.
       * @param {Function} callback - Executes when received Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      received: function (callback, connection) {
        checkConnectionCallback(connection, callback,
          function (connection, callback) {
            connection.received(callback);
          }, function (callback) {
           $.connection.hub.received(callback);
          });
      },

      /**
       * connectionSlow Lifetime event.
       * @param {Function} callback - Executes when connectionSlow Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      connectionSlow: function (callback, connection) {
        checkConnectionCallback(connection, callback,
          function (connection, callback) {
            connection.connectionSlow(callback);
          }, function (callback) {
           $.connection.hub.connectionSlow(callback);
          });
      },

      /**
       * reconnecting Lifetime event.
       * @param {Function} callback - Executes when reconnecting Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      reconnecting: function (callback, connection) {
        checkConnectionCallback(connection, callback,
          function (connection, callback) {
            connection.reconnecting(callback);
          }, function (callback) {
           $.connection.hub.reconnecting(callback);
          });
      },

      /**
       * reconnected Lifetime event.
       * @param {Function} callback - Executes when reconnected Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      reconnected: function (callback, connection) {
        checkConnectionCallback(connection, callback,
          function (connection, callback) {
            connection.reconnected(callback);
          }, function (callback) {
           $.connection.hub.reconnected(callback);
          });
      },

      /**
       * stateChanged Lifetime event.
       * @param {Function} callback - Executes when stateChanged Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      stateChanged: function (callback, connection) {
        checkConnectionCallback(connection, callback,
          function (connection, callback) {
            connection.stateChanged(callback);
          }, function (callback) {
           $.connection.hub.stateChanged(callback);
          });
      },

      /**
       * disconnected Lifetime event.
       * @param {Function} callback - Executes when disconnected Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      disconnected: function (callback, connection) {
        checkConnectionCallback(connection, callback,
          function (connection, callback) {
            connection.disconnected(callback);
          }, function (callback) {
           $.connection.hub.disconnected(callback);
          });
      },

      /**
       * Error handler for connection.
       * @param {Function} callback - fires on conneciton error.
       * @param {Object} [connection] - the connection returned from hubs connection: if not specified, will use generated proxy.
       */
      error: function (callback, connection) {
        checkConnectionCallback(connection, callback,
          function (connection, callback) {
            connection.error(callback);
          }, function (callback) {
           $.connection.hub.error(callback);
          });
      }

    };
  }];
}]);
