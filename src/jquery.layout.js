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

$.support.orientation = (("orientation" in window) && ("orientationchange" in window));

var win = $(window), last_orientation;

$.event.special.orientationchange = {
  setup: function() {
    // If the event is supported natively, return false so that jQuery
    // will bind to the event using DOM methods.
    if ($.support.orientation) { return false; }

    // Get the current orientation to avoid initial double-triggering.
    last_orientation = get_orientation();

    // Because the orientationchange event doesn't exist, simulate the
    // event by testing window dimensions on resize.
    win.bind("resize", handler);
  },
  teardown: function() {
    // If the event is not supported natively, return false so that
    // jQuery will unbind the event using DOM methods.
    if ($.support.orientation) { return false; }

    // Because the orientationchange event doesn't exist, unbind the
    // resize event handler.
    win.unbind("resize", handler);
  },
  add: function(handleObj) {
    // Save a reference to the bound event handler.
    var old_handler = handleObj.handler;

    handleObj.handler = function(event) {
      // Modify event object, adding the .orientation property.
      event.orientation = get_orientation();

      // Call the originally-bound event handler and return its result.
      return old_handler.apply(this, arguments);
    };
  }
};

// If the event is not supported natively, this handler will be bound to
// the window resize event to simulate the orientationchange event.
function handler() {
  // Get the current orientation.
  var orientation = get_orientation();

  if (orientation !== last_orientation) {
    // The orientation has changed, so trigger the orientationchange event.
    last_orientation = orientation;
    win.trigger("orientationchange");
  }
};

// Get the current page orientation. This method is exposed publicly, should it
// be needed, as jQuery.event.special.orientationchange.orientation()
function get_orientation() {
  var elem = document.documentElement;
  return elem && elem.clientWidth / elem.clientHeight < 1.1 ? "portrait" : "landscape";
}

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
    if ($.support.orientation) {
      return (window.orientation == 0 || window.orientation == 180) ? "portrait" : "landscape";
    } else {
      return get_orientation();
    }
  },

  start: function() {
    win.bind("orientationchange.readymade resize.readymade", function(evt) {
      if (evt.orientation) {
        $('html').removeClass("portrait landscape").addClass(evt.orientation);
      }
      detectResolutionBreakpoints();
    });
    win.trigger("orientationchange.readymade");
  }
};

})(jQuery);
