/**
 * ng-SignalR
 * @author danielfoord
 * @license MIT License
 * SignalR - http://signalr.net/
 * AngularJS - https://angularjs.org/
 */
angular.module('ngSignalR', [])
.constant('$', window.$)
.provider('signalr', ['$', function ($) {

  //Transport methods used by SignalR
  this.transports = ['webSockets', 'serverSentEvents', 'foreverFrame', 'longPolling'];

  var errmsg = {
    callback: 'Callback function is not a function',
    errCallback: 'errorCallback function is not a function'
  };

  this.setTransports = function (transports) {
    if (!angular.isArray(transports)) {
      throw new Error('setTransports expects an \'Array\'');
    } else {
      this.transports = transports;
    }
  };

  this.getTransports = function () {
    return this.transports;
  };

  this.$get = function ($rootScope, $q, $) {

    //Get provided transports to use in connections.
    var transports = this.transports;

    //Global collection of all active connections.
    var connections = [];

    return {
      /**
       * Creates a Connection to a SignalR Hub without the generated proxy.
       * @param  {String} channel - Camel case reference to SingalR hub class.
       * @returns {Object} - Returns Proxy and Connection.
       */
      createHubConnection: function (channel) {

        if (angular.isDefined(channel)) {
          var connection = $.hubConnection(),
            cons = connections;

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
       * @returns {Object} - Returns Connection.
       */
      createConnection: function (channel) {

        if(angular.isDefined(channel)) {
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
          throw TypeError(errmsg.callback);
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

        if (angular.isFunction(callback) && angular.isDefined(connection)) {
          connection.starting(callback);
        } else if (angular.isFunction(callback) && angular.isUndefined(connection)) {
           $.connection.hub.starting(callback);
        }  else if (!angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        } 

      },

      /**
       * received Lifetime event.
       * @param {Function} callback - Executes when received Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      received: function (callback, connection) {

        if (angular.isFunction(callback) && angular.isDefined(connection)) {
          connection.received(callback);
        } else if (angular.isFunction(callback) && angular.isUndefined(connection)) {
           $.connection.hub.received(callback);
        }  else if (!angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        } 

      },

      /**
       * connectionSlow Lifetime event.
       * @param {Function} callback - Executes when connectionSlow Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      connectionSlow: function (callback, connection) {

        if (angular.isFunction(callback) && angular.isDefined(connection)) {
          connection.connectionSlow(callback);
        } else if (angular.isFunction(callback) && angular.isUndefined(connection)) {
           $.connection.hub.connectionSlow(callback);
        }  else if (!angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        }

      },

      /**
       * reconnecting Lifetime event.
       * @param {Function} callback - Executes when reconnecting Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      reconnecting: function (callback, connection) {
    
        if (angular.isFunction(callback) && angular.isDefined(connection)) {
          connection.reconnecting(callback);
        } else if (angular.isFunction(callback) && angular.isUndefined(connection)) {
           $.connection.hub.reconnecting(callback);
        }  else if (!angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        }

      },

      /**
       * reconnected Lifetime event.
       * @param {Function} callback - Executes when reconnected Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      reconnected: function (callback, connection) {
        
        if (angular.isFunction(callback) && angular.isDefined(connection)) {
          connection.reconnected(callback);
        } else if (angular.isFunction(callback) && angular.isUndefined(connection)) {
           $.connection.hub.reconnected(callback);
        }  else if (!angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        }

      },

      /**
       * stateChanged Lifetime event.
       * @param {Function} callback - Executes when stateChanged Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      stateChanged: function (callback, connection) {
      
        if (angular.isFunction(callback) && angular.isDefined(connection)) {
          connection.stateChanged(callback);
        } else if (angular.isFunction(callback) && angular.isUndefined(connection)) {
           $.connection.hub.stateChanged(callback);
        }  else if (!angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        }

      },

      /**
       * disconnected Lifetime event.
       * @param {Function} callback - Executes when disconnected Lifetime event fires.
       * @param {Object} [connection] - The connection on which the Lifetime event will fire: if not specified, will use generated proxy.
       */
      disconnected: function (callback, connection) {
    
        if (angular.isFunction(callback) && angular.isDefined(connection)) {
          connection.disconnected(callback);
        } else if (angular.isFunction(callback) && angular.isUndefined(connection)) {
           $.connection.hub.disconnected(callback);
        }  else if (!angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        }

      },

      /**
       * Error handler for connection.
       * @param {Function} callback - fires on conneciton error.
       * @param {Object} [connection] - the connection returned from hubs connection: if not specified, will use generated proxy.
       */
      error: function (callback, connection) {

        if (angular.isFunction(callback) && angular.isDefined(connection)) {
          connection.error(callback);
        } else if (angular.isFunction(callback) && angular.isUndefined(connection)) {
           $.connection.hub.error(callback);
        }  else if (!angular.isFunction(callback)) {
          throw new TypeError(errmsg.callback);
        }

      }

    };
  };
}
]);
