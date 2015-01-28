describe("ngSignalR Service (With generated proxy)", function() {
  
  var ngSignalr,
    q,
    deferredPromise;

  //Mock out SignalR jQuery library.
  var $mock = {

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
  * createConnection 
  **/
  it("createConnection: throws exception if no channel specified", function () {
    expect(function(){
      ngSignalr.createConnection();
    })
    .toThrow(new Error('channel is undefined'));
  });

  it("createConnection: returns connection", function () {    
    var connection = ngSignalr.createConnection('mockHub');
    
    expect(connection).toBeDefined();
  });

  /**
  * stopConnection
  **/
  it("stopConnection: calls the connections' stop function", function () {
    var connection = ngSignalr.createConnection('mockHub');
    
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
  it("logging: sets the connections logging to true", function(){
    var connection = ngSignalr.createConnection('mockHub');

    ngSignalr.logging(true);
    expect($mock.connection.hub.logging).toBeTruthy(true);
  });

  /**
  * starting
  **/
  it("starting: calls starting livetime event", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'starting');

    ngSignalr.starting(callback);
    expect($mock.connection.hub.starting).toHaveBeenCalledWith(callback);
  });

  it("starting:  throws an error if the callback is not a function", function(){
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
  it("received: calls received livetime event", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'received');

    ngSignalr.received(callback);
    expect($mock.connection.hub.received).toHaveBeenCalledWith(callback);
  });

  it("received: throws an error if the callback is not a function", function(){
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

  it("connectionSlow: calls connectionSlow livetime event", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'connectionSlow');

    ngSignalr.connectionSlow(callback);
    expect($mock.connection.hub.connectionSlow).toHaveBeenCalledWith(callback);
  });

  it("connectionSlow: throws an error if the callback is not a function", function(){
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
  it("reconnecting: calls reconnecting livetime event", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'reconnecting');

    ngSignalr.reconnecting(callback);
    expect($mock.connection.hub.reconnecting).toHaveBeenCalledWith(callback);
  });

  it("reconnecting: throws an error if the callback is not a function", function(){
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

  it("reconnected: calls reconnected livetime event", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'reconnected');

    ngSignalr.reconnected(callback);
    expect($mock.connection.hub.reconnected).toHaveBeenCalledWith(callback);
  });

  it("reconnected: throws an error if the callback is not a function", function(){
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

  it("stateChanged: calls stateChanged livetime event", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'stateChanged');

    ngSignalr.stateChanged(callback);
    expect($mock.connection.hub.stateChanged).toHaveBeenCalledWith(callback);
  });

  it("stateChanged: throws an error if the callback is not a function", function(){
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

  it("disconnected: calls disconnected livetime event", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'disconnected');

    ngSignalr.disconnected(callback);
    expect($mock.connection.hub.disconnected).toHaveBeenCalledWith(callback);
  });

  it("disconnected: throws an error if the callback is not a function", function(){
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

  it("error: calls error livetime event", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = function(){};
    spyOn($mock.connection.hub, 'error');

    ngSignalr.error(callback);
    expect($mock.connection.hub.error).toHaveBeenCalledWith(callback);
  });

  it("error: throws an error if the callback is not a function", function(){
    var connection = ngSignalr.createConnection('mockHub');

    var callback = {};
    spyOn($mock.connection.hub, 'error');

    expect(function(){
      ngSignalr.error(callback);
    })
    .toThrow(new TypeError('Callback function is not a function'));
  });


});
