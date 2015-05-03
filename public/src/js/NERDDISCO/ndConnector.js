function ndConnector(args) {

  this.url = args.url || 'http://localhost:1337';

  this.webSocket = null;


  // Initialize ndConnector
  this.init();

} // / ndConnector





ndConnector.prototype = {
  
  init : function() {

    // Create a new Web Socket client using the socket.io-client
    this.webSocket = io(this.url);

  }, // / ndConnector.prototype.init




  sendLEDs : function(leds) {
    this.webSocket.emit('ND.color', leds);
  } // / ndConnector.prototype.sendOPCData

}; // / ndConnector.prototype