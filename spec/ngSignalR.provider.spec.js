describe('ngSignalR Provider', function() {

  'use strict';

  var ngSignalrProvider;

  beforeEach(function() {

    module('ngSignalR', function(signalrProvider) {
      ngSignalrProvider = signalrProvider;
    });

    inject(function(){});
  });

  it('getTransports: gets the transport methods being used', function () {
    var transports = ngSignalrProvider.getTransports();
    expect(transports).toEqual(['webSockets', 'serverSentEvents', 'foreverFrame', 'longPolling']);
  });

  it('setTransports: throws exception if not given an Array', function () {
  	expect(function(){
  	  ngSignalrProvider.setTransports();
  	})
  	.toThrow(new Error('setTransports expects an \'Array\''));
  });

  it('setTransports: sets the transport methods being used', function () {
    ngSignalrProvider.setTransports(['webSockets']);
    var transports = ngSignalrProvider.getTransports();
    expect(transports).toEqual(['webSockets']);
  });

  it('logging: sets whether logging on connections should be on or off by default', function () {
    ngSignalrProvider.logging(true);
    expect(ngSignalrProvider.log).toBeTruthy();

    ngSignalrProvider.logging(false);
    expect(ngSignalrProvider.log).toBeFalsy();
  });

});
