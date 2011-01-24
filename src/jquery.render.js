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
