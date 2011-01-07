beforeEach(function() {
  this.addMatchers({
    toHaveSelector: function(expectedSelector) {
      return $(expectedSelector, this.actual).length > 0;
    },

    toBeSelector: function(expectedSelector) {
      return $(this.actual).is(expectedSelector);
    }
  });
});
