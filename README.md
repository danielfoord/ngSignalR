# ngSignalR #

[![Build Status](https://travis-ci.org/danielfoord/ngSignalR.svg?branch=master)](https://travis-ci.org/danielfoord/ngSignalR)
[![Codacy Badge](https://www.codacy.com/project/badge/40a1bea5a2974594bca0823ce133e06a)](https://www.codacy.com/app/danfoord1/ngSignalR)
[![Inch Badge](https://inch-ci.org/github/danielfoord/ngSignalR.svg?branch=master)](https://inch-ci.org/github/danielfoord/ngSignalR.svg?branch=master)


An AngularJS provider for the SignalR JQuery client.

This module depends on the following libraries:

- [JQuery](http://jquery.com/)
- [AngularJS](https://angularjs.org/)
- [SignalR JQuery Client](https://github.com/SignalR/SignalR)

## Installing ##
Bower:
`bower install ngsignalr`

ManuaL: Just download the repo and
`<script src="ngSignalR.js"></script>`

## Setting Up ##
To inject the module  into your app use 'ngSignalR' as shown below:
```javascript
angular.module('App', ['ngSignalR']);
```

To configure the connection transports, use the setTransports function in the config section of your app:
```javascript
angular.module('App')
  .config(function(signalrProvider){
    signalrProvider.setTransports(['webSockets', 'serverSentEvents']);
});
```

SignalR takes 4 transport methods: 

- Web Sockets
- Server Sent Events
- Forever Frame
- Long Polling


## Usage ##

### Creating a connection ###
There are 2 ways to create connections in the SignalR client, one way is to use the generated proxy, and another is to use your own proxy.

#### With the generated Proxy: ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');
  signalr.startConnection(); //Start the connection
});
```

#### Without the generated Proxy: ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;
  
  signalr.startHubConnection(connection); //Start the connection
});
```

NOTE: Starting the connection should be done right at the end:
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;
  
  //Must come before starting the connection
  signalr.logging(connection, true); //Enabled default SignalR client logging
  signalr.receive(connection, 'eventName', function (data) {
    console.log(data);
  });
  signalr.startHubConnection(connection); //Start the connection
});
```

Best practice is to have a function that starts the connection and binds all the listener events:
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;
  
  var startConnection = function () {    
    signalr.receive(connection, 'eventName', function (data) {
      //Do something when invoked by server
    });

    signalr.startHubConnection(connection); //Start the connection
  };
  startConnection();
});
```

Starting the connection also returns a promise that gets resolved once the connection is made:
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;
  
  $scope.model = {
    connectionOpen: false // Initialize the connectionOpen flag as false
  };

  var startConnection = function () {    
    signalr.receive(connection, 'eventName', function (data) {
      //Do something when invoked by server
    });

    signalr.startHubConnection(connection)
    .then(function() {
      $scope.model.connectionOpen = true; //Set the connected flag to true
    });
  };
  startConnection();
});
```

### Receiving data ###
To receive data we will have to look at which way the connection was established, these are the 2 ways of receiving data:

#### With the generated Proxy: ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.receive(connection, 'eventName', function (data) {
    console.log(data);
  });
  signalr.startConnection(); //Start the connection
});
```

#### Without the generated Proxy: ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.receiveProxy(proxy, 'eventName', function (data) {
    console.log(data);
  });
  signalr.startHubConnection(connection); //Start the connection
});
```

### Sending Data ###
#### With the generated Proxy: ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  $scope.send = function() {
    var obj = {
      property1: 'abc'
    };
    signalr.send(connection, 'eventName', obj);
  };

  signalr.startConnection(); //Start the connection
});
```

#### Without the generated Proxy: ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;
  var proxy = hub.proxy;

  $scope.send = function () {
    var obj = {
      property1: 'abc'
    };
    signalr.sendProxy(proxy, 'eventName', obj);
  };

  signalr.startHubConnection(connection); //Start the connection
});
```

### Stopping a connection ###
#### With the generated Proxy: ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  $scope.stopConnection = function () {
    signalr.stopConnection(connection)
    .then(function () {
      //Do Something after connection is closed.
    });
  };
  signalr.startConnection(); //Start the connection
});
```

#### Without the generated Proxy: ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  $scope.stopConnection = function () {
    signalr.stopConnection(connection)
    .then(function () {
      //Do Something after connection is closed.
    });
  };
  signalr.startHubConnection(connection); //Start the connection
});
```

#####Stopping a connection on when view is changed #####
If we don't clean up the connection on view changes, the connection will remain open. To clean up we use Angular's garbage collection in our controller.
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  //Garbage Collection
  $scope.$on('$destroy', function () {
    signalr.stopConnection(connection);
  });
  signalr.startHubConnection(connection); //Start the connection
});
```

### Events ###
The following functions provide a means to execute code on a connection's lifetime events.

#### On Start ####
This fires when a connection is made and no data has come in yet.
#### With the generated Proxy: ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.starting(function() {
    //Do something when the connection starts before any data is received
  });
  signalr.startConnection(); //Start the connection
});
```
##### Without the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.starting(function() {
    //Do something when the connection starts before any data is received
  }, connection);

  signalr.startHubConnection(connection); //Start the connection
});
```

#### On Receive ####
This is fired when any client side function is invoked by the server.
##### With the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.received(function() {
    //Do something when a client side function is invoked
  });
  signalr.startConnection(); //Start the connection
});
```
##### Without the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.received(function() {
    //Do something when a client side function is invoked
  }, connection);

  signalr.startHubConnection(connection); //Start the connection
});
```

#### On Slow Connection ####
This is fired when SignalR detects a slow connection.
##### With the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.connectionSlow(function() {
    //Do something when the connection is slow
  });
  signalr.startConnection(); //Start the connection
});
```
##### Without the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.connectionSlow(function() {
    //Do something when the connection is slow
  }, connection);

  signalr.startHubConnection(connection); //Start the connection
});
```

#### On Disconnection ####
This is fired when the connection is terminated.
##### With the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.disconnected(function() {
    //Do something when the connection is terminated
  });
  signalr.startConnection(); //Start the connection
});
```
##### Without the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.disconnected(function() {
    //Do something when the connection is terminated
  }, connection);

  signalr.startHubConnection(connection); //Start the connection
});
```

#### On Reconnecting ####
This is fired when the client is reconnecting to the server.
##### With the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.reconnecting(function() {
    //Do something while the client is reconnecting
  });
  signalr.startConnection(); //Start the connection
});
```
##### Without the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.reconnecting(function() {
    //Do something while the client is reconnecting
  }, connection);

  signalr.startHubConnection(connection); //Start the connection
});
```

#### On Reconnected ####
This is fired when the client has successfully reconnected to the server.
##### With the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.reconnected(function() {
    //Do something while the client is reconnecting
  });
  signalr.startConnection(); //Start the connection
});
```
##### Without the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.reconnected(function() {
    //Do something while the client is reconnecting
  }, connection);

  signalr.startHubConnection(connection); //Start the connection
});
```

#### On State Changed ####
This is fired when the state of the connection has changed in any way.
##### With the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.stateChanged(function() {
    //Do something while the client is reconnecting
  });
  signalr.startConnection(); //Start the connection
});
```
##### Without the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.stateChanged(function() {
    //Do something while the client is reconnecting
  }, connection);

  signalr.startHubConnection(connection); //Start the connection
});
```

#### On Error ####
This is fired when any error occours with the connection.
##### With the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.error(function() {
    //Do something while the client is reconnecting
  });
  signalr.startConnection(); //Start the connection
});
```
##### Without the generated proxy
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.error(function() {
    //Do something while the client is reconnecting
  }, connection);

  signalr.startHubConnection(connection); //Start the connection
});
```

### Logging ###
The following function allows you to enable/disabled SignalR's connection logging:
##### With the generated proxy ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  var connection = signalr.createConnection('HubName');

  signalr.logging(true); //Enabled default SignalR client logging
  signalr.startConnection(); //Start the connection
});
```
##### Without the generated proxy ####
```javascript
angular.module('App')
.controller('Ctrl', function($scope, signalr) {
  //Starting the connection
  var hub = signalr.createHubConnection('HubName');
  var connection = hub.connection;

  signalr.logging(true, connection); //Enabled default SignalR client logging
  signalr.startHubConnection(connection); //Start the connection
});
```

### Resources ###

- [AngularJS Services](https://docs.angularjs.org/guide/services)
- [SignalR jQuery client library](http://www.asp.net/signalr/overview/guide-to-the-api/hubs-api-guide-javascript-client)
- [SignalR jQuery client repo](https://github.com/SignalR/bower-signalr)

### Demo ###

A working demo can be found [here](https://github.com/danielfoord/ngSignalR-demo)

### License ###
The MIT License (MIT)

Copyright (c) 2015 danielfoord

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
