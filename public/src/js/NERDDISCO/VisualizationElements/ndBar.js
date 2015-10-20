class ndBar extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    this.color = args.color || 0;

    this.range = args.range || null;
    this.trigger = args.trigger || 255;

    this.velocity = 0;
    
    this.audio = {
      frequency : 0
    };

    this.amount = args.amount || undefined;
  }





  draw() {

    // Audio data available
    if (this.ndAudio.audioFrequencyData !== null) {

      this.ctx.save();

      this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;


      //this._color = this.color + (360 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);

      this._velocity = this.velocity / 127 * 4;

      // this._amount = this.amount || this.ndAudio.audioAnalyser.frequencyBinCount;
      this._amount = this.ndAudio.audioFrequencyData.length;

      this.sliceWidth = (this.canvas.width + 250) / this._amount;

      this._x = 0;

      this.ctx.beginPath();
      this.ctx.lineWidth = this._velocity;



      // Initial position
      this.ctx.moveTo(0, this.canvas.height);

      // For each audio frequency
      for (var i = 0; i < this._amount; i++) {
        // Calculate y based on the current frequency and the height of the canvas
        this._y = (this.ndAudio.audioFrequencyData[i] / 255) * (this.canvas.height);

        this._color = this.color + (360 / 255 * this.ndAudio.audioFrequencyData[i]);

        this.ctx.beginPath();
        this.ctx.moveTo(this._x, this.canvas.height);
        this.ctx.lineTo(this._x, this._y);

        if (this.ndAudio.audioFrequencyData[i] < 5) {
          this.ctx.strokeStyle = "rgba(60, 60, 60, 0)";
        } else {
          this.ctx.strokeStyle = "hsla(" + this._color + ", 100%, 70%, .85)";
        }

        this.ctx.stroke();

        // Increase the x position for the next bar
        this._x += this.sliceWidth;

      } // / for each frequency

      // this.ctx.lineTo(this.canvas.width + 15, 0);


      // this.ctx.fill();
      // this.ctx.stroke();


      this.ctx.restore();

    } // / Audio data available


  } // / ndBar.draw





  // resize() {

  // } // / ndBar.resize

} // / ndBar