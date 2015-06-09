class ndCircle extends ndVisualizationElement {
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
      
      this.ctx.globalCompositeOperation = "source-over";
      
      this._x = this.canvas.width / 2 + this.x;
      this._y = this.canvas.height / 2 + this.y;
      
      this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;
      

      //this.ctx.strokeStyle = this.color; 
      
      this._r = this.audio.frequency / 255 * this.r;

      this.ctx.beginPath();

      if (this.audio.frequency >= this.trigger) {
        this._color += 1;
        this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .85)";
        
        this.ctx.globalAlpha = 1;
        this._r = window.getRandomInt(this._r + Math.PI, this._r + Math.PI * 4);
        
      } else {
        
        this._color = this.color + (360 / 255 * this.audio.frequency);
        this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .85)";
        
        this.ctx.globalAlpha = 1;
        this.ctx.lineWidth = this.audio.frequency / 2;
        
      }

      this.ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
      this.ctx.fill();
      
      this.ctx.restore();
      
    }
  }
}