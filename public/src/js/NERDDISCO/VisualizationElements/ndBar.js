class ndBar extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    this.color = args.color || 0;

    this.midiInputCode = args.midiInputCode || null;
    this.range = args.range || null;
    this.trigger = args.trigger || 255;
    
    this.audio = {
      frequency : 0
    };

    this.amount = args.amount || undefined;
  }





  draw() {

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      // The element is pressed
      if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].pressed) {

        // Audio data available
        if (this.ndAudio.audioFrequencyData !== null) {

          this.ctx.save();


          this._color = this.color + (360 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);

          this._velocity = this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity / 127 * 4;

          // this._amount = this.amount || this.ndAudio.audioAnalyser.frequencyBinCount;
          this._amount = this.ndAudio.audioFrequencyData.length;

          this.sliceWidth = this.canvas.width / this._amount;

          this._x = 0;

          this.ctx.beginPath();
          this.ctx.lineWidth = this._velocity;

          this.ctx.strokeStyle = "hsla(" + this._color + ", 100%, 70%, .85)";
          this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 70%, .35)";

          // Initial position
          this.ctx.moveTo(0, this.canvas.height);

          // For each audio frequency
          for (var i = 0; i < this._amount; i++) {
            // Calculate y based on the current frequency and the height of the canvas
            this._y = (this.ndAudio.audioFrequencyData[i] / 255) * (this.canvas.height / 2);

            this.ctx.lineTo(this._x, this._y);

            // Increase the x position for the next bar
            this._x += this.sliceWidth;

          } // / for each frequency

          this.ctx.lineTo(this.canvas.width, 0);


          this.ctx.fill();
          this.ctx.stroke();


          this.ctx.restore();

        } // / Audio data available

      } // / element is pressed

    } // / input element exists




  } // / ndBar.draw





  // resize() {

  // } // / ndBar.resize

} // / ndBar