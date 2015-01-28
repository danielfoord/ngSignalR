describe("ngSignalR Service (Without generated proxy)", function() {
  
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
  * stopConnection
  **/
  it("stopConnection: calls the connections' stop function", function () {
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
  it("stopAllConnections: stops all connections", function () {
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
  * logging
  **/
  it("logging: sets the connections logging to true", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    ngSignalr.logging(true, connection);
    expect(connection.logging).toBeTruthy();
  });

  /**
  * starting
  **/
  it("starting: calls connection's starting livetime event", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'starting');

    ngSignalr.starting(callback, connection);

    expect(connection.starting).toHaveBeenCalledWith(callback);
  });

  it("starting: throws an error if the callback is not a function", function(){
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

  /**
  * received
  **/
  it("received: connection's received livetime event", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'received');

    ngSignalr.received(callback, connection);

    expect(connection.received).toHaveBeenCalledWith(callback);
  });

  it("received: throws an error if the callback is not a function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'received');

    expect(function(){
      ngSignalr.received(callback, connection);  
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * connectionSlow
  **/
  it("connectionSlow: connection's connectionSlow livetime event", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'connectionSlow');

    ngSignalr.connectionSlow(callback, connection);

    expect(connection.connectionSlow).toHaveBeenCalledWith(callback);
  });

  it("connectionSlow: throws an error if the callback is not a function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'connectionSlow');

    expect(function(){
        ngSignalr.connectionSlow(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * reconnecting
  **/
  it("reconnecting: connection's reconnecting livetime event", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'reconnecting');

    ngSignalr.reconnecting(callback, connection);

    expect(connection.reconnecting).toHaveBeenCalledWith(callback);
  });

  it("reconnecting: throws an error if the callback is not a function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'reconnecting');

    expect(function(){
      ngSignalr.reconnecting(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

  /**
  * reconnected
  **/
  it("reconnected: connection's reconnected livetime event", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'reconnected');

    ngSignalr.reconnected(callback, connection);

    expect(connection.reconnected).toHaveBeenCalledWith(callback);
  });

  it("reconnected: throws an error if the callback is not a function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'reconnected');

    expect(function(){
      ngSignalr.reconnected(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });


  /**
  * stateChanged
  **/
  it("stateChanged: connection's stateChanged livetime event", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'stateChanged');

    ngSignalr.stateChanged(callback, connection);

    expect(connection.stateChanged).toHaveBeenCalledWith(callback);
  });

  it("stateChanged: throws an error if the callback is not a function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'stateChanged');

    expect(function(){
      ngSignalr.stateChanged(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });


  /**
  * disconnected
  **/
  it("disconnected: connection's disconnected livetime event", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'disconnected');

    ngSignalr.disconnected(callback, connection);

    expect(connection.disconnected).toHaveBeenCalledWith(callback);
  });

  it("disconnected: throws an error if the callback is not a function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'disconnected');

    expect(function(){
      ngSignalr.disconnected(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });


  /**
  * error
  **/
  it("error: connection's error livetime event", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = function(){};
    spyOn(connection, 'error');

    ngSignalr.error(callback, connection);

    expect(connection.error).toHaveBeenCalledWith(callback);
  });

  it("error: throws an error if the callback is not a function", function(){
    var hub = ngSignalr.createHubConnection('mockHub');
    var connection = hub.connection;

    var callback = {};
    spyOn(connection, 'error');

    expect(function(){
      ngSignalr.error(callback, connection);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });

});
