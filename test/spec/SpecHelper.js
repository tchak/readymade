beforeEach(function() {
  this.addMatchers({
    toHaveCSS: function(expectedSelector) {
      return $(expectedSelector, this.actual).length > 0;
    },

    toBeCSS: function(expectedSelector) {
      return $(this.actual).is(expectedSelector);
    }
  });
});
