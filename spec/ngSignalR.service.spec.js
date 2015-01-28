describe("ngSignalR Service", function() {
  
  var ngSignalr,
    q,
    deferredPromise;

  //Mock out SignalR jQuery library.
  var $mock = {

    //Not Using generated proxy mocks
    //createHubConnection
    hubConnection: function() {
      var connection = {
        createHubProxy: function() {
          var proxy = {
            on: function(fnName, callback) {
              callback();
            },
            invoke:function(fnName, payload) {
              return payload;
            }
          };
          return proxy;
        }, 
        stop: function(){
          return true;
        },
        start: function(options) {
          return {done: function(){} };
        },
        logging:false,
        starting: function(){},
        received: function(){},
        connectionSlow: function(){},
        reconnecting: function(){},
        reconnected: function(){},
        stateChanged: function(){},
        disconnected: function(){},
        error: function(){}
      };
      return connection; 
    },

    //Using generated proxy mocks
    //createConnection
    connection: {
      mockHub : {
        stop: function(){
          return true;
        }, 
        client : {},
        server: {
          mockFnName: function(payload) {
            return payload;
          }
        }
      },
      mockHub2 : {
        stop: function(){
          return true;
        },
        client: {},
        server: {
          mockFnName: function(payload) {
            return payload;
          }
        }
      },
      hub:{
        start: function(options) {
          return {done: function(){}};
        },
        logging : false,
        starting: function(){},
        received: function(){},
        connectionSlow: function(){},
        reconnecting: function(){},
        reconnected: function(){},
        stateChanged: function(){},
        disconnected: function(){},
        error: function(){}
      }
    }
  };


  beforeEach(function() {
    module('ngSignalR');

    module(function($provide) {
      $provide.constant('$', $mock);
    });

    inject(function($injector) {
      ngSignalr = $injector.get('signalr');
      q = $injector.get('$q');
    });
  });

  /** 
  * createHubConnection 
  **/
  it("createHubConnection: throws exception if no channel specified", function () {
    expect(function(){
      ngSignalr.createHubConnection();
    })
    .toThrow(new Error('channel is undefined'));
  });

  it("createHubConnection: calls $.hubConnection()", function () {
    spyOn($mock, 'hubConnection').and.callThrough();  
    
    ngSignalr.createHubConnection('mockHub');

    expect($mock.hubConnection).toHaveBeenCalled();
  });

  it("createHubConnection: returns connection and proxy", function () {
    spyOn($mock, 'hubConnection').and.callThrough();  
    
    var hub = ngSignalr.createHubConnection('mockHub');
    
    expect(hub.connection).toBeDefined();
    expect(hub.proxy).toBeDefined();
  });

  /** 
  * createConnection 
  **/
  it("createConnection: throws exception if no channel specified", function () {
    expect(function(){
      ngSignalr.createConnection();
    })
    .toThrow(new Error('channel is undefined'));
  });

  it("createConnection: returns connection", function () {
    spyOn($mock, 'hubConnection').and.callThrough();  
    
    var connection = ngSignalr.createHubConnection('mockHub');
    
    expect(connection).toBeDefined();
  });

  /**
  * stopConnection
  **/
  it("stopConnection: calls the connections' stop function (with generated proxy)", function () {
    var connection = ngSignalr.createConnection('mockHub');
    
    spyOn(connection, 'stop');
    ngSignalr.stopConnection(connection)
    .then(function() {
      expect(connection.stop).toHaveBeenCalled();
    });
  });

  it("stopConnection: calls the connections' stop function (without generated proxy)", function () {
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;
    
    spyOn(connection, 'stop');
    ngSignalr.stopConnection(connection)
    .then(function() {
      expect(connection.stop).toHaveBeenCalled();
    });
  });

  /**
  * stopAllConnections
  **/
  it("stopAllConnections: stops all connections (with generated proxy)", function () {
    var connection1 = ngSignalr.createConnection('mockHub');
    var connection2 = ngSignalr.createConnection('mockHub2');
    
    spyOn(connection1, 'stop');
    spyOn(connection2, 'stop');

    ngSignalr.stopAllConnections()
    .then(function() {
      expect(connection1.stop).toHaveBeenCalled();
      expect(connection2.stop).toHaveBeenCalled();
    });
  });

  it("stopAllConnections: stops all connections (without generated proxy)", function () {
    var hub1 = ngSignalr.createHubConnection('mockHub');
    var hub2 = ngSignalr.createHubConnection('mockHub2');
    var connection1 = hub1.connection;
    var connection2 = hub2.connection;

    spyOn(connection1, 'stop');
    spyOn(connection2, 'stop');

    ngSignalr.stopAllConnections()
    .then(function() {
      expect(connection1.stop).toHaveBeenCalled();
      expect(connection2.stop).toHaveBeenCalled();
    });
  });

  /**
  * startHubConnection
  **/
  it("startHubConnection: throws an error if no connection is supplied", function() {
    var hub  = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;
    spyOn(connection, 'start').and.callThrough();

    expect(function(){
      ngSignalr.startHubConnection()
    })
    .toThrow(new Error('connection is undefined'));
  });

  it("startHubConnection: calls the connectons' start function", function() {
    var hub  = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;
    spyOn(connection, 'start').and.callThrough();

    ngSignalr.startHubConnection(connection)
    .then(function() {
      expect(connection.start).toHaveBeenCalled();
    });    
  });

  /**
  * startConnection
  **/
  it("startConnection: calls the connectons' start function", function() {
    var connection  = ngSignalr.createConnection('mockHub');
    spyOn($mock.connection.hub, 'start').and.callThrough();

    ngSignalr.startConnection(connection)
    .then(function() {
      expect($mock.connection.hub.start).toHaveBeenCalled();
    });    
  });

  /**
  * receiveProxy
  */
  it("receiveProxy: calls the proxy's on function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var proxy = hub.proxy;

    spyOn(proxy, 'on').and.callThrough();

    ngSignalr.receiveProxy(proxy ,'mockFnName', function(){
      expect(proxy.on).toHaveBeenCalled();
    });
  });

  it("receiveProxy: throws an error if the callback is not a funciton", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var proxy = hub.proxy;

    spyOn(proxy, 'on').and.callThrough();
    
    expect(function () {
      ngSignalr.receiveProxy(proxy ,'mockFnName', 'notAFunction');
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * receive
  **/
  it("receive: sets the connections' client function", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){
      var doSomething = 1;
    };
    ngSignalr.receive(connection, 'mockFnName', callback);

    expect(connection.client.mockFnName).toEqual(callback);
  });

  it("receive:  throws an error if the callback is not a funciton", function(){
    var connection = ngSignalr.createConnection('mockHub');

    expect(function (){
      ngSignalr.receive(connection, 'mockFnName', 'notAFunction');
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * sendProxy
  **/
  it("sendProxy: invokes the proxy's invoke function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var proxy = hub.proxy;

    spyOn(proxy, 'invoke').and.callThrough();
    ngSignalr.sendProxy(proxy, 'fnName', { prop: 'prop' });

    expect(proxy.invoke).toHaveBeenCalled();
  });

  it("sendProxy: throws an error if the errorCallback is not a function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var proxy = hub.proxy;

    expect(function() {
      ngSignalr.sendProxy(proxy, 'fnName',  { prop: 'prop' }, 'notAFunction');  
    })
    .toThrow(new TypeError('errorCallback function is not a function'));
  });

  /**
  * send
  **/
  it("send: invokes the proxy's invoke function", function(){
    var connection = ngSignalr.createConnection('mockHub');
   
    spyOn(connection.server, 'mockFnName').and.callThrough();
    ngSignalr.send(connection, 'mockFnName', { prop: 'prop' });

    expect(connection.server.mockFnName).toHaveBeenCalled();
  });

  it("send: throws an error if the errorCallback is not a function", function(){
    var connection = ngSignalr.createConnection('mockHub');
    
    expect(function() {
      ngSignalr.send(connection, 'mockFnName',  { prop: 'prop' }, 'notAFunction');  
    })
    .toThrow(new TypeError('errorCallback function is not a function'));
  });

  /**
  * logging
  **/
  it("logging: sets the connections logging to true (with out generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    ngSignalr.logging(true, connection);
    expect(connection.logging).toBeTruthy();
  });

  it("logging: sets the connections logging to true (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    ngSignalr.logging(true);
    expect($mock.connection.hub.logging).toBeTruthy(true);
  });

  /**
  * starting
  **/
  it("starting: calls connection's starting livetime event (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'starting');

    ngSignalr.starting(callback, connection);

    expect(connection.starting).toHaveBeenCalledWith(callback);
  });

  it("starting: calls starting livetime event (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'starting');

    ngSignalr.starting(callback);
    expect($mock.connection.hub.starting).toHaveBeenCalledWith(callback);
  });

  it("starting: throws an error if the callback is not a function (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var error;
    var callback = {};
    spyOn(connection, 'starting');

    expect(function(){
     ngSignalr.starting(callback, connection); 
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  it("starting:  throws an error if the callback is not a function (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = {};
    spyOn($mock.connection.hub, 'starting');

    expect(function(){
      ngSignalr.starting(callback);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * received
  **/
  it("received: connection's received livetime event (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'received');

    ngSignalr.received(callback, connection);

    expect(connection.received).toHaveBeenCalledWith(callback);
  });

  it("received: calls received livetime event (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'received');

    ngSignalr.received(callback);
    expect($mock.connection.hub.received).toHaveBeenCalledWith(callback);
  });

  it("received: throws an error if the callback is not a function (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'received');

    expect(function(){
      ngSignalr.received(callback, connection);  
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  it("received: throws an error if the callback is not a function (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = {};
    spyOn($mock.connection.hub, 'received');

    expect(function(){
       ngSignalr.received(callback);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * connectionSlow
  **/
  it("connectionSlow: connection's connectionSlow livetime event (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'connectionSlow');

    ngSignalr.connectionSlow(callback, connection);

    expect(connection.connectionSlow).toHaveBeenCalledWith(callback);
  });

  it("connectionSlow: calls connectionSlow livetime event (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'connectionSlow');

    ngSignalr.connectionSlow(callback);
    expect($mock.connection.hub.connectionSlow).toHaveBeenCalledWith(callback);
  });

  it("connectionSlow: throws an error if the callback is not a function (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'connectionSlow');

    expect(function(){
        ngSignalr.connectionSlow(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  it("connectionSlow: throws an error if the callback is not a function (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = {};
    spyOn($mock.connection.hub, 'connectionSlow');

    expect(function(){
       ngSignalr.connectionSlow(callback);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * reconnecting
  **/
  it("reconnecting: connection's reconnecting livetime event (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'reconnecting');

    ngSignalr.reconnecting(callback, connection);

    expect(connection.reconnecting).toHaveBeenCalledWith(callback);
  });

  it("reconnecting: calls reconnecting livetime event (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'reconnecting');

    ngSignalr.reconnecting(callback);
    expect($mock.connection.hub.reconnecting).toHaveBeenCalledWith(callback);
  });

  it("reconnecting: throws an error if the callback is not a function (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'reconnecting');

    expect(function(){
      ngSignalr.reconnecting(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  it("reconnecting: throws an error if the callback is not a function (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = {};
    spyOn($mock.connection.hub, 'reconnecting');

    expect(function(){
      ngSignalr.reconnecting(callback);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * reconnected
  **/
  it("reconnected: connection's reconnected livetime event (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'reconnected');

    ngSignalr.reconnected(callback, connection);

    expect(connection.reconnected).toHaveBeenCalledWith(callback);
  });

  it("reconnected: calls reconnected livetime event (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'reconnected');

    ngSignalr.reconnected(callback);
    expect($mock.connection.hub.reconnected).toHaveBeenCalledWith(callback);
  });

  it("reconnected: throws an error if the callback is not a function (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'reconnected');

    expect(function(){
      ngSignalr.reconnected(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  it("reconnected: throws an error if the callback is not a function (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = {};
    spyOn($mock.connection.hub, 'reconnected');

    expect(function(){
      ngSignalr.reconnected(callback);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * stateChanged
  **/
  it("stateChanged: connection's stateChanged livetime event (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'stateChanged');

    ngSignalr.stateChanged(callback, connection);

    expect(connection.stateChanged).toHaveBeenCalledWith(callback);
  });

  it("stateChanged: calls stateChanged livetime event (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'stateChanged');

    ngSignalr.stateChanged(callback);
    expect($mock.connection.hub.stateChanged).toHaveBeenCalledWith(callback);
  });

  it("stateChanged: throws an error if the callback is not a function (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'stateChanged');

    expect(function(){
      ngSignalr.stateChanged(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  it("stateChanged: throws an error if the callback is not a function (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = {};
    spyOn($mock.connection.hub, 'stateChanged');

    expect(function(){
      ngSignalr.stateChanged(callback);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * disconnected
  **/
  it("disconnected: connection's disconnected livetime event (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'disconnected');

    ngSignalr.disconnected(callback, connection);

    expect(connection.disconnected).toHaveBeenCalledWith(callback);
  });

  it("disconnected: calls disconnected livetime event (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'disconnected');

    ngSignalr.disconnected(callback);
    expect($mock.connection.hub.disconnected).toHaveBeenCalledWith(callback);
  });

  it("disconnected: throws an error if the callback is not a function (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'disconnected');

    expect(function(){
      ngSignalr.disconnected(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  it("disconnected: throws an error if the callback is not a function (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = {};
    spyOn($mock.connection.hub, 'disconnected');

    expect(function(){
      ngSignalr.disconnected(callback);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * error
  **/
  it("error: connection's error livetime event (without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'error');

    ngSignalr.error(callback, connection);

    expect(connection.error).toHaveBeenCalledWith(callback);
  });

  it("error: calls error livetime event (with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'error');

    ngSignalr.error(callback);
    expect($mock.connection.hub.error).toHaveBeenCalledWith(callback);
  });

  it("error: throws an error if the callback is not a function(without generated proxy)", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'error');

    expect(function(){
      ngSignalr.error(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  it("error: throws an error if the callback is not a function(with generated proxy)", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = {};
    spyOn($mock.connection.hub, 'error');

    expect(function(){
      ngSignalr.error(callback);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });


});
