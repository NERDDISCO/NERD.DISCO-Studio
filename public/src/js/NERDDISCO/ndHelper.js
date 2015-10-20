class ndHelper {
    
  constructor(args) {
    window.ndHelper = this;
  }





  random(min, max) {
    min = Math.floor(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

} // / ndHelper