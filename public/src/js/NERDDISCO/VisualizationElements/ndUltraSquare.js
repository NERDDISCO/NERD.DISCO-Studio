class ndUltraSquare extends ndVisualizationElement {
  constructor(args) {
    super(args);
    
    this.color = args.color || '#fff';
    
    this.range = args.range || null;
    
    this.trigger = args.trigger || 255;
    
    this.x = args.x || 0;
    this.y = args.y || 0;
    this.width = args.width || 0;
    this.height = args.height || 0;
    this.angle = args.angle || 0;
    
    this._angle = this.angle;
    
    this.audio = {
      frequency : 0
    };
  }
  
  draw() {
    
    if (this.ndAudio.audioGroupedFrequencyData !== null && 
        typeof this.ndAudio.audioGroupedFrequencyData[this.range] !== 'undefined') {
      
      this.ctx.save();
      
      this.ctx.globalCompositeOperation = "lighten";
      
      this._x = this.canvas.width / 2 + this.x;
      this._y = this.canvas.height / 2 + this.y;
      
      this.audio.frequency = this.ndAudio.audioGroupedFrequencyData[this.range].value;
      this._color = this.color + (360 / 255 * this.audio.frequency);
      this._r = this.audio.frequency / 255 * this.r;
      
      this._width = this.width;
      this._height = this.height;

      this.ctx.beginPath();

      if (this.audio.frequency >= this.trigger) {
        
        this.ctx.globalAlpha = .05;
        
        this.angle_factor = 2;
        
        this._color = window.getRandomInt(0, 360);

        this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .65)";
        
        this.ctx.translate(this._x, this._y);
        
        this.ctx.rotate(this._angle * Math.PI / 180);

        this.factor = 2.5 * (this.audio.frequency / 255);
        
        this._width *= this.factor;
        this._height *= this.factor;
        
        this.ctx.fillRect(- (this._width / 2), - (this._height / 2), this._width, this._height);
        
        this.factor *= .45;
        
        this._width *= this.factor;
        this._height *= this.factor;
        
        this.ctx.clearRect(- (this._width / 2), - (this._height / 2), this._width, this._height);
      
        
      } else {
        
        this.angle_factor = 0;
        
        this.ctx.globalAlpha = .0;
        
        //this._color = window.getRandomInt(0, 180);

        this.ctx.fillStyle = "hsla(" + this._color + ", 100%, 60%, .65)";
        
        this.ctx.translate(this._x, this._y);
        
        this.ctx.rotate(this._angle * Math.PI / 180);

        
        this.ctx.fillRect(- (this._width / 2), - (this._height / 2), this._width, this._height);
        
      }
      
      this._angle += this.angle_factor;

      if (this._angle > 360) {
        this._angle = 0;
      }


      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}