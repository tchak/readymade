(function($, undefined) {

// media-query-like width breakpoints, which are translated to classes on the html element
var resolutionBreakpoints = [320,480,768,1024];

/*
	private function for adding/removing breakpoint classes to HTML element for faux media-query support
	It does not require media query support, instead using JS to detect screen width > cross-browser support
	This function is called on orientationchange, resize, and mobileinit, and is bound via the 'htmlclass' event namespace
*/
function detectResolutionBreakpoints() {
	var currWidth = $(window).width(),
		minPrefix = "min-width-",
		maxPrefix = "max-width-",
		minBreakpoints = [],
		maxBreakpoints = [],
		unit = "px",
		breakpointClasses;

	$('html').removeClass(minPrefix + resolutionBreakpoints.join(unit + " " + minPrefix) + unit + " " +
		maxPrefix + resolutionBreakpoints.join(unit + " " + maxPrefix) + unit);

	$.each(resolutionBreakpoints, function(i, breakPoint) {
		if (currWidth >= breakPoint) { minBreakpoints.push(minPrefix + breakPoint + unit); }
		if (currWidth <= breakPoint) { maxBreakpoints.push(maxPrefix + breakPoint + unit); }
	});

	if (minBreakpoints.length) { breakpointClasses = minBreakpoints.join(" "); }
	if (maxBreakpoints.length) { breakpointClasses += " " +  maxBreakpoints.join(" "); }

	$('html').addClass(breakpointClasses);
};

$.layout = {

  // $.layout.addResolutionBreakpoints method:
	// pass either a number or an array of numbers and they'll be added to the min/max breakpoint classes
  addResolutionBreakpoints: function(newbps) {
	  if ($.type(newbps) === "array") { resolutionBreakpoints = resolutionBreakpoints.concat(newbps); }
	  else { resolutionBreakpoints.push(newbps); }
	  resolutionBreakpoints.sort(function(a,b){ return a-b; });
	  detectResolutionBreakpoints();
  },

  // $.layout.orientation method:
  //
  orientation: function() {
    if (!isNaN(window.orientation)) {
      return (window.orientation == 0 || window.orientation == 180) ? "portrait" : "landscape";
    } else {
      return ($(window).height() > $(window).width()) ? "portrait" : "landscape";
    }
  },

  start: function() {
    if (window.orientation) {
      $(window).bind("orientationchange.landscape", function() {
        $('html').data("_orientation", window.orientation).removeClass("portrait landscape").addClass(window.orientation);
      });
    }
    $(window).bind("resize.landscape", function() {
      //add orientation class to HTML element on flip/resize.
      var orientation = $.layout.orientation();
      if ($('html').data("_orientation") != orientation) {
        $('html').data("_orientation", orientation).removeClass("portrait landscape").addClass(orientation);
        if (!window.orientation) { $(window).orientationchange(); }
      }
    	//add classes to HTML element for min/max breakpoints
    	detectResolutionBreakpoints();
    });

    //trigger event manually
    if (window.orientation) {
      $(window).trigger("orientationchange.landscape").trigger("resize.landscape");
    } else {
      $(window).trigger("resize.landscape");
    }
  }
};

$.fn.orientationchange = function(callback) {
  if (callback == null) { return this.trigger("orientationchange"); }
  return this.bind("orientationchange", callback);
};

})(jQuery);
