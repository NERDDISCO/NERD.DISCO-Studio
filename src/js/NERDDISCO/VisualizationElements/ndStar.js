class ndStar extends ndVisualizationElement {
  
  constructor(args) {
    super(args);

    this.color = args.color || 0;

    this.spikes = args.spikes || 3;
    this.outerRadius = args.outerRadius || 3;
    this.innerRadius = args.innerRadius || 3;

    this.rotate = Math.PI / 2 * 3;
    this.step = Math.PI / this.spikes;

    this.factor = args.factor || 1;
    
    this.midiInputCode = args.midiInputCode || null;
    this.range = args.range || null;
    this.trigger = args.trigger || 255;
    
    this.audio = {
      frequency : 0
    };

    this.globalCompositionOperation = args.globalCompositionOperation || 'source-over';
  }





  draw() {

    // The element on the MIDI input exists
    if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode] !== undefined) {

      // The element is pressed
      if (this.ndVisualization.ndMidi.inputElements[this.midiInputCode].pressed) {

        // Audio data available
        if (this.ndAudio.audioGroupedFrequencyData !== null && 
            typeof this.ndAudio.audioGroupedFrequencyData[this.range] !== 'undefined') {
      

        this.ctx.save();

        this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;

        this._x = this.x;
        this._y = this.y;
        this._color = this.color + (360 / 127 * this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity);

        this._velocity = this.ndVisualization.ndMidi.inputElements[this.midiInputCode].velocity / 127 * this.factor * (this.audio.frequency / 255);

        this._outerRadius = Math.random() * this._velocity + this.outerRadius;
        this._innerRadius = Math.random() * this._velocity + this.innerRadius;

        this.ctx.beginPath();
        this.ctx.moveTo(this._x * this._velocity, this._y * this._velocity - this._outerRadius);

        for (var i = 0; i < this.spikes; i++) {
            this._x = this.x * this._velocity + Math.cos(this.rotate) * this._outerRadius;
            this._y = this.y * this._velocity + Math.sin(this.rotate) * this._outerRadius;
            this.ctx.lineTo(this._x, this._y);
            this.rotate += this.step;

            this._x = this.x * this._velocity + Math.cos(this.rotate) * this._innerRadius;
            this._y = this.y * this._velocity + Math.sin(this.rotate) * this._innerRadius;
            this.ctx.lineTo(this._x, this._y);
            this.rotate += this.step;
        }

        this.ctx.lineTo(this.x * this._velocity, this.y * this._velocity - this._outerRadius);
        this.ctx.closePath();

        if (this.audio.frequency >= this.trigger) {
            this.ctx.lineWidth = getRandomInt(this.audio.frequency / 255, this.audio.frequency / 255 * 10);
        } else {
            this.ctx.lineWidth = 2;
        }
        
        this.ctx.strokeStyle = "hsla(" + this._color + ", 100%, 70%, .85)";
        this.ctx.stroke();
        this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .65)";
        this.ctx.fill();

        this.ctx.restore();

        } // / Audio data available

      } // / element is pressed

    } // / input element exists





  }

} // / ndStar