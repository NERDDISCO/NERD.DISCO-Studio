function ndSquare(args) {
  this.x = args.x || 0;
  this.y = args.y || 0;

  this.width = args.width || 0;
  this.height = args.height || 0;

  this._width = this.width;
  this._height = this.height;

  this.life = args.life || 0;

  this.max_life = args.max_life || 5;

  this.almost_dead = args.almost_dead || 0;
  this.max_almost_dead = args.max_almost_dead || 0;

  this.die_sooner = args.die_sooner || 0;

  this.ndVisualization = args.ndVisualization || null;

  this.ndAudio = args.ndAudio || null;

  this.canvas_context = this.ndVisualization.canvas_context;
  this.canvas_element = this.ndVisualization.canvas_element;

  this.color = args.color || null;
  this.opacity = args.opacity || 0.35;


  this.frequency_range = args.frequency_range || 'null';


  this.min_frequency = args.min_frequency || 185;

  this.frequency = 0;
  this._frequency = this.frequency;


  this.drawing = false;

  this.ratio_x = 0;
  this.ratio_y = 0;


  this.size_multiplicator = args.size_multiplicator || 1.2;


  this.change_color = [ 'highmid', 'high', 'superhigh' ];


  this._delay = 0;
} // / ndSquare





ndSquare.prototype = {

  init : function() {



  }, // / ndSquare.prototype.init





  draw : function() {

    if (this.ndAudio.audioGroupedFrequencyData !== null && typeof this.ndAudio.audioGroupedFrequencyData[this.frequency_range] !== 'undefined') {

      this.frequency = this.ndAudio.audioGroupedFrequencyData[this.frequency_range].value;

      if (this.life++ > this.max_life) {
        this.max_life = this.frequency / 6;

        this.life = 0;

        this.opacity = 0.65;

        this._width = this.width;
        this._height = this.height;

        this.x = getRandomInt(this.canvas_element.width / 2 * 0.5, this.canvas_element.width / 2 * 1.5);
        this.y = getRandomInt(this.canvas_element.height / 2 * 0.5, this.canvas_element.height / 2 * 1.5);

        this.color = (360 / 255 * (this.frequency * Math.random() + this.frequency));

        this._delay = 0;

        this.drawing = false;

        this.ratio_x = 0;
        this.ratio_y = 0;
      }

      // Fade out
      if (this.life > (this.max_life * 0.8)) {
        this.opacity -= 0.075;

        if (this.opacity < 0) {
          this.drawing = false;
          this.life = this.max_life + 1;
        }
      }


      if (!this.drawing && this.frequency >= this.min_frequency && this._delay++ >= this.die_sooner) {
        this.life = 0;
        this.max_life -= this.die_sooner;
        this.drawing = true;

        //this.ratio_x = Math.random();
        //this.ratio_y = Math.random();
        this.ratio_x = this.ratio_y = 1;
      }

      if (!this.drawing && this.frequency < this.min_frequency) {
        this._delay = 0;
      }


      if (this.drawing) {

        if (this.change_color.indexOf(this.frequency_range) != -1) {
          this.color += this.life;
        }

        this.canvas_context.fillStyle = "hsla(" + this.color + ", 100%, 60%, "+ this.opacity +")";

        this._width += (this.life * this.ratio_x * this.size_multiplicator);
        this._height += (this.life * this.ratio_y * this.size_multiplicator);
        
        this.canvas_context.fillRect(
          this.x - this._width / 2,
          this.y - this._height / 2,
          this._width,
          this._height
        );
      }

      // if (this.frequency < 185 && this.life <= 1) {
      //   this.life = 0;

      // } else {

      //   // if (this.life <= 1) {
      //   //   this.life = this.die_sooner;
      //   // }



      // }


      //this.canvas_context.restore();
    }



  } // / ndSquare.prototype.draw

}; // / ndSquare