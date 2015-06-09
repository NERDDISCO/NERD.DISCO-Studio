/*jshint strict:false */
"use strict";

class ndVisualizationElement {
  
  constructor(args) {
    // @see ndVisualization
    this.ndVisualization = args.ndVisualization || null;

    // Set the canvas context
    this.context = args.context || null;
    
    // Set the canvas
    this.canvas = args.canvas || null;
    
    // Shorthand for context
    this.ctx = this.context;

    // The global position operation of the canvas
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Compositing
    this.globalCompositionOperation = args.globalCompositionOperation || 'source-over';
    
    // x position
    this.x = args.x || 0;
    
    // y position
    this.y = args.y || 0;

    // Audio data for this element
    this.audio = {

      // Current frequency for the specified range
      frequency : 0
    };

    // Enable debugging
    this.debug = args.debug === undefined ? false : args.debug;
  }
  
  set context(context) {
    this.ctx = context;
  }
  
  // Draw on canvas
  draw() {}

  // Resize element
  resize() {}
}