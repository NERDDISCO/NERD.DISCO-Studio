function ndConnector(args) {

  this.url = args.url || 'http://nerddisco.master:1337';

  // The socket namespace
  this.namespace = args.namespace || 'NERDDISCO-Studio';

  this.webSocket = null;


  // Initialize ndConnector
  this.init();

} // / ndConnector





ndConnector.prototype = {
  
  init : function() {

    // Create a new Web Socket client using the socket.io-client
    this.webSocket = io(this.url + '/' + this.namespace);

  }, // / ndConnector.prototype.init




  sendLEDs : function(leds) {

    this.webSocket.emit('NERDDISCO.input', leds);

  } // / ndConnector.prototype.sendLEDs

}; // / ndConnector.prototype