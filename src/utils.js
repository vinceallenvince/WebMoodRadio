var Utils = {
  getRandomNumber: function(low, high, flt) {
    if (flt) {
      return Math.random()*(high-(low-1)) + low;
    }
    return Math.floor(Math.random()*(high-(low-1))) + low;
  },
  bustClientCache: function() {
    return this.getRandomNumber(0, 100000);
  },
  shuffleArray: function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
  },
  map: function(value, min1, max1, min2, max2) { // returns a new value relative to a new range
    var unitratio = (value - min1) / (max1 - min1);
    return (unitratio * (max2 - min2)) + min2;
  }
};

exports.Utils = Utils;