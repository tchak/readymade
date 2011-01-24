(function($, undefined) {

function camelize(str) {
  return (str || "").replace(/(\-|_)+(.)?/g, function(match, dash, chr) {
    return chr ? chr.toUpperCase() : '';
  });
}

function dataAttr(elem, key) {
  // Try to fetch any
  // data from the HTML5 data-* attribute
  if (elem.nodeType === 1 && $.inArray(key, $.plugin.exceptOptions) == -1) {
    var data = elem.getAttribute("data-"+key);
    try {
      data = data === "true" ? true :
      data === "false" ? false :
      data === "null" ? null :
      !jQuery.isNaN(data) ? parseFloat(data) : data;
    } catch( e ) {}
    return data;
  } else {
    return undefined;
  }
}

$.plugin = $.plugin || {};

$.extend($.plugin, {

  //
  defaultOptions: {},

  //
  exceptOptions: [],

  //
  getOptions: function(element, pluginName) {
    var data = {}, result = {}, attrs = element.attributes, name, option;
    for (var i = 0, l = attrs.length; i < l; i++) {
      name = attrs[i].name;
      if (name.indexOf("data-") === 0) {
        name = name.substr(5);
        option = dataAttr(element, name);
        if (option !== null) { data[name] = option; }
      }
    }
    var options = $.extend({}, $.plugin.defaultOptions[pluginName], data);
    $.each(options, function(key, value) {
      if (key == "icon") {
        result.icons = result.icons || {};
        result.icons.primary = "ui-icon-"+value;
      } else if (key == "icon-primary" || key == "icon-secondary") {
        result.icons = result.icons || {};
        result.icons[key.split("-")[1]] = "ui-icon-"+value;
      } else {
        result[camelize(key)] = value;
      }
    });
    return result;
  }
});

if ($.Widget) {
  $.Widget.prototype._getCreateOptions = function() {
    return $.plugin.getOptions(this.element[0], this.widgetName);
  };
}

})(jQuery);
(function($, undefined) {

var optimizedMapping;

$('html').addClass("ui-rendering");

//
$.fn.render = function() {
  var target = this, mapping = optimizedMapping || $.render.mapping;

  // Do actual rendering
  target.addClass("ui-rendering-fragment");

  var beforeEvent = new $.Event("render:before");
  $(document).trigger(beforeEvent, {"fragment": target});
  if (beforeEvent.result !== false) {
    $.each(mapping, function(method, selector) {
      var fn = $.fn[method];
      if ($.isFunction(fn)) {
        fn.apply(target.filter(selector).add(target.find(selector)), []);
      }
    });
    $(document).trigger("render:after", {"fragment": target});
  }
  return target.removeClass("ui-rendering-fragment");
};

$.render = {

  //
  mapping: {},

  optimize: function() {
    optimizedMapping = {};
    $.each($.render.mapping, function(method, selector) {
      if ($.isFunction($.fn[method])) {
        optimizedMapping[method] = selector;
      }
    });
  },

  start: function() {
    $(function() {
      // Initialize actions
      if ($.actions) { $.actions.start(); }
      // Initialize layout
      if ($.layout) { $.layout.start(); }
      // Watch for dialog open events and render content
      if ($.ui && $.ui.dialog) {
        $(':ui-dialog').live("dialogopen", function() { $(this).render(); });
      }
      $.render.optimize();
      $('body').render();
    });
  }
};

$(document).trigger("render:init").one("render:after", function() {
  $('html').removeClass("ui-rendering");
});

// Default to render on load
if (!("auto" in $.render)) { $.render.auto = true; }
if ($.render.auto === true) { $.render.start(); }

})(jQuery);
(function($, undefined) {

var isLive = false,

// Cached regex to split keys for `live`.
eventSplitter = /^(\w+)\s*(.*)$/,
idSelector = /^#[^\s]*/;

function actionArguments(evt, target) {
  var ref = $(target).attr('href') || $(target).attr("data-target") || "";
  return [evt, ref, (ref.match(idSelector) ? true : false)];
}

if ($.render) {
  $.merge($.plugin.exceptOptions, ["rel", "target"]);
}

$.actions = {

  //
  mapping: {
    "toggle": 'click [data-rel~=toggle]',
    "submit": 'click [data-rel~=submit]',
    "preventDefault": 'click [data-rel~=nodefault]'
  },

  //
  start: function() {
    if (isLive === false) {
      var self = $.actions;
      $.each(self.mapping, function(name, key) {
        if ($.isFunction(self.fn[name])) {
          var match = key.match(eventSplitter);
          var eventName = match[1], selector = match[2];
          $(selector).live(eventName+".readymade", function(evt) {
            self.fn[name].apply(this, actionArguments(evt, this));
          });
        }
      });
      isLive = true;
    }
  },

  //
  stop: function() {
    $.each($.actions.mapping, function(name, key) {
      var match = key.match(eventSplitter);
      var eventName = match[1], selector = match[2];
      $(selector).die(eventName+".readymade");
    });
    isLive = false;
  },

  // Default actions :
  // toggle / submit / preventDefault
  fn: {

    // Use toggle action to switch visibility of some elements
    toggle: function(evt, ref, isId) {
      if (isId) {
        if (!$(ref).toggle().is(':visible')) { evt.preventDefault(); }
      }
    },

    // Use submit action to submit forms. You can submit current elements form
    // or any other form on page by passing an id.
    submit: function(evt, ref, isId) {
      evt.preventDefault();
      if (ref == "") { $(this).closest('form').submit(); }
      else if (isId && $(ref).is('form')) { $(ref).submit(); }
    },

    // Use preventDefault action to break events chane.
    preventDefault: function(evt) {
      evt.preventDefault();
    }
  }
};

})(jQuery);
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
(function($, undefined) {

$.extend(true, $.render, {

  //
  mapping: {
    "button": 'button, input:submit, input:reset, input:button, [data-role=button]',
    "buttonset": '[data-role=buttonset]',
    "datepicker": 'input[data-type=date], [data-role=datepicker]',
    "tabs": '[data-role=tabs]',
    "accordion": '[data-role=accordion]',
    "progressbar": '[data-role=progressbar]',
    "autocomplete": 'input[data-role=autocomplete]',
    // Alpha 1.9 UI widgets
    "spinner": 'input[data-role=spinner]',
    "menu": '[data-role=menu]:visible'
  }
});

$.extend(true, $.plugin, {

  //
  defaultOptions: {
    tabs: {
      cache: true
    },
    dialog: {
      modal:true,
      width: 450,
      buttons: {
        OK: function() {
          var saveEvent = new $.Event("save");
          $(this).trigger(saveEvent);
          if (saveEvent.result !== false) { $(this).dialog("close"); }
        }
      }
    }
  }
});

$.merge($.plugin.exceptOptions, ["type", "role"]);

})(jQuery);
(function($, undefined) {

var dialogCache = {},
isURL = /^[\/]?[\w\-\.]+[^#?\s]+(.*)?(#[\w\-]+)?$/;

$.extend(true, $.actions, {

  //
  mapping: {
    "dialog": 'click [data-rel~=dialog]',
    "menu": 'click [data-rel~=menu]'
  },

  //
  fn: {
    //
    dialog: function(evt, ref, isId) {
      evt.preventDefault();
      if (!$.ui.dialog) { return $.error("UI Dialog plugin is not loaded..."); }
      if (isId) {
        $(ref).dialog();
      } else if (isURL.test(ref)) {
        var content = dialogCache[ref];
        if (!content) {
          $.get(ref, function(data) {
            dialogCache[ref] = $(data).dialog();
          });
        } else {
          $(content).dialog("open");
        }
      }
    },

    //
    menu: function(evt, ref, isId) {
      evt.preventDefault();
      if (!$.ui.menu) { return $.error("UI Menu plugin is not loaded..."); }
      if (isId) { $(ref).menu("open"); }
    }
  }
});

})(jQuery);
