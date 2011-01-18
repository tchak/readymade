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

$('html').addClass("render-before");

//
$.fn.render = function() {
  var target = this, mapping = optimizedMapping || $.render.mapping;

  // Do actual rendering
  target.addClass("render-fragment");

  var beforeEvent = new $.Event("renderbefore");
  $(document).trigger(beforeEvent, {"fragment": target});
  if (beforeEvent.result !== false) {
    $.each(mapping, function(method, selector) {
      var fn = $.fn[method];
      if ($.isFunction(fn)) {
        fn.apply(target.filter(selector).add(target.find(selector)), []);
      }
    });
    $(document).trigger("renderafter", {"fragment": target});
  }
  return target.removeClass("render-fragment");
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

$(document).trigger("renderinit").one("renderafter", function() {
  $('html').removeClass("render-before");
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
          $(selector).live(eventName+".actions", function(evt) {
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
      $(selector).die(eventName+".actions");
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
          $(this).dialog("close");
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
