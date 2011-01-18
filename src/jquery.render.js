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
