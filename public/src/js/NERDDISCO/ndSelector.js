/**
 * Select an area on canvas. 
 */
function ndSelector(args) {
  // Element which holds the selector (e.g. canvas)
  this.parent_element = args.parent_element || null;
  
  // The selector element
  this.selector_element = null;
  
  // The name of the selector (which gets saved into the "data-name" attribute)
  this.selector_element_name = args.selector_element_name || 'A';
  
  // The CSS class for the selector_element
  this.selector_element_class = args.selector_element_class || 'ndSelector';
  
  // The width of the selector_element (default: 10 real pixel / LED (8 LEDs per row))
  this.selector_element_width = args.selector_element_width || 10 * 8 + 'px';
  
  // The height of the selector_element (default: 10 real pixel / LED (8 LEDs per row))
  this.selector_element_height = args.selector_element_height || 10 * 8 + 'px';
  


  // The x position of the selector_element
  this.selector_element_x = args.selector_element_x || 0;

  // x is saved in localStorage
  if (window.localStorage[this.selector_element_name + 'x'] !== undefined) {
    // Set the x position of the selector_element
    this.selector_element_x = window.localStorage[this.selector_element_name + 'x'];
  }
  


  // The y position of the selector_element
  this.selector_element_y = args.selector_element_y || 0;
  
  // y is saved in localStorage
  if (window.localStorage[this.selector_element_name + 'y'] !== undefined) {
    // Set the y position of the selector_element
    this.selector_element_y = window.localStorage[this.selector_element_name + 'y'];
  }
  


  // The visibility of the selector_element
  this.selector_element_visible = args.selector_element_visible || true;
  
  // Initialize the selector
  this.init();
  
} // / ndSelector





ndSelector.prototype = {
  
  /**
   * Initialize the selector:
   * - create the selector_element (div)
   * - set default position
   * - add the selector_element to it's parent_element
   */
  init : function() {
    
    // Parent element is defined
    if (this.parent_element !== null) {

      // Create the selector_element using a div
      this.selector_element = document.createElement('div');
      
      // Set the name of the selector_element using a data attribute
      this.selector_element.setAttribute('data-name', this.selector_element_name);
      
      // Set the CSS class of the selector_element
      this.selector_element.className = this.selector_element_class + ' ' + 'draggable';
      
      // Set the width of the selector_element
      this.selector_element.style.width = this.selector_element_width;
      
      // Set the height of the selector_element
      this.selector_element.style.height = this.selector_element_height;

      // Set the initial y position of the selector_element
      // this.selector_element.style.top = this.selector_element_y + 'px';
      this.selector_element.setAttribute('data-y', this.selector_element_y);
      
      // Set the initial x position of the selector_element
      // this.selector_element.style.left = this.selector_element_x + 'px';
      this.selector_element.setAttribute('data-x', this.selector_element_x);

      // Translate the selector_element to the given (x, y) position
      this.selector_element.style.transform = 'translate(' + this.selector_element_x + 'px, ' + this.selector_element_y + 'px)';
        
      // Set the initial visibility of the selector_element
      this.setVisible();
      
      // Add the selecotr_element to the parent_element
      this.parent_element.appendChild(this.selector_element);
    }
    
  }, // / ndSelector.prototype.init
  
  
  
  
  
  /**
   * Update / get the current position of the selector_element
   */
  getPosition : function() {

    // Get the current x position from the selector_element
    this.selector_element_x = this.selector_element.getAttribute('data-x');

    // Save the current x position into localStorage
    window.localStorage[this.selector_element_name + 'x'] = this.selector_element_x;



    // Get the current y position from the selector_element
    this.selector_element_y = this.selector_element.getAttribute('data-y');

    // Save the current y position into localStorage
    window.localStorage[this.selector_element_name + 'y'] = this.selector_element_y;


    
    // Return the current (x, y) position, width and height
    return {
      x : this.selector_element_x,
      y : this.selector_element_y
    };
    
  }, // / ndSelector.prototype.getPosition
  
  
  
  /**
   * Set the visibility of the selector_element.
   */
  setVisible : function(visible) {
    // Parameter "visible" is not defined
    if (typeof visible === 'undefined') {
      // Use the default value
      visible = this.selector_element_visible;
    }
   
    // Set the visiblity for the selector_element
    this.selector_element_visible = visible;

    // Set the data-attribute "data-visible" for the selector_element to use it in CSS
    this.selector_element.setAttribute('data-visible', this.selector_element_visible);
  }, // / ndSelector.prototype.setVisible
  
  
  
  
  /**
   * Is the selector_element visible?
   */
  isVisible : function() {
    return this.selector_element_visible;
  } // / ndSelector.prototype.setVisible
  
}; // / ndSelector.prototype



// target elements with the "draggable" class
interact('.draggable')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    restrict: {
      restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },

    // call this function on every dragmove event
    onmove: function(event) {
      var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
          x = (parseInt(target.getAttribute('data-x'), 10) || 0) + event.dx,
          y = (parseInt(target.getAttribute('data-y'), 10) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    },
    // call this function on every dragend event
    onend: function(event) {
    }
});