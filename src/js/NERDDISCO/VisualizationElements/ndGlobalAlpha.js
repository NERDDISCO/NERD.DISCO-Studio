class ndGlobalAlpha extends ndVisualizationElement {
  
  constructor(args) {
    super(args);
  }





  draw() {

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      this.ctx.save();

      var opacity = 1 - (1 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);

      this.ctx.fillStyle = "rgba(0, 0, 0, "+opacity+")";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.restore();

      
      if (window.registry != undefined) {
        registry.getAll().brightness = 1 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity;
      }

        
    } // / input element exists

  } // / draw

} // / ndGiphyElement