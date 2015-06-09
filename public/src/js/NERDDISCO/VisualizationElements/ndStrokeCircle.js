class ndStrokeCircle extends ndVisualizationElement {
  constructor(args) {
    super(args);
    
    this.color = args.color || '#fff';
    
    this.range = args.range || null;
    
    this.trigger = args.trigger || 255;
    
    this.x = args.x || 0;
    this.y = args.y || 0;
    this.r = args.r || 0;
    
    this.audio = {
      frequency : 0
    };
  }
  
  draw() {
    
    if (this.ndAudio.audioGroupedFrequencyData !== null && 
        typeof this.ndAudio.audioGroupedFrequencyData[this.range] !== 'undefined') {
      
      this.ctx.save();
      
      this.ctx.globalCompositeOperation = "difference";
      
      this._x = this.canvas.width / 2 + this.x;
      this._y = this.canvas.height / 2 + this.y;
      
      this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;
      this._color = this.color + (360 / 255 * this.audio.frequency);
      this._r = this.audio.frequency / 255 * this.r;

      this.ctx.beginPath();

      // this.ctx.translate(this._x, this._y);
      // this.ctx.scale(1.225, 1.225);
      // this.ctx.translate(-this._x, -this._y);

      if (this.audio.frequency >= this.trigger) {
        
        this.ctx.globalAlpha = .75;
        
        //this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .65)";
        this.ctx.fillStyle = 'transparent';
        this._color = window.getRandomInt(0, this._color);
        this._strokeColor = this._color + (360 / 255 * this.audio.frequency);
        this._strokeStyle = "hsla(" + this._strokeColor + ", 100%, 60%, 1)";
        
        this.ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
        this.ctx.strokeStyle = this._strokeStyle;
        this.ctx.lineWidth =  window.getRandomInt(Math.PI * 4, Math.PI * 8);
        
      } else {
        
        this.ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
        this.ctx.strokeStyle = 'transparent';
        
        this.ctx.globalAlpha = .15;
        this.ctx.lineWidth = this.audio.frequency / 2;
        
      }



      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.fill();


      this.ctx.restore();
    }
  }
}