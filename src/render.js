(function($, undefined) {

var optimizedMapping;

//
$('html').addClass('render-loading');

// Options auto load from defaults and data attributes
if ($.Widget) {
  function camelize(str) {
    return (str || "").replace(/(\-|_)+(.)?/g, function(match, dash, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  }

  function dataAttr(elem, key) {
    // Try to fetch any
    // data from the HTML5 data-* attribute
    if (elem.nodeType === 1 && $.inArray(key, $.render.exceptOptions) == -1) {
      var data = elem.getAttribute('data-'+key);
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

  $.Widget.prototype._getCreateOptions = function() {
    var data = {}, result = {}, attrs = this.element[0].attributes, name, option;
    for (var i = 0, l = attrs.length; i < l; i++) {
      name = attrs[i].name;
      if (name.indexOf("data-") === 0) {
        name = name.substr(5);
        option = dataAttr(this.element[0], name);
        if (option) { data[name] = option; }
      }
    }
    var options = $.extend({}, $.render.defaultOptions[this.widgetName], data);
    $.each(options, function(key, value) {
      if (key == 'icon') {
        result.icons = result.icons || {};
        result.icons.primary = 'ui-icon-'+value;
      } else if (key == 'icon-primary' || key == 'icon-secondary') {
        result.icons = result.icons || {};
        result.icons[key.split('-')[1]] = 'ui-icon-'+value;
      } else {
        result[camelize(key)] = value;
      }
    });
    return result;
  };
}

//
$.fn.render = function() {
  var target = this, mapping = optimizedMapping || $.render.mapping;

  // Do actual rendering
  target.addClass('render-working');

  var beforeEvent = new $.Event('renderbefore');
  this.trigger(beforeEvent, {'fragment': target});
  if (beforeEvent.result !== false) {
    $.each(mapping, function(method, selector) {
      var fn = $.fn[method];
      if ($.isFunction(fn)) {
        fn.apply(target.filter(selector).add(target.find(selector)), []);
      }
    });
    $(document).trigger('renderafter', {'fragment': target});
  }
  return target.removeClass('render-working');
};

$.render = {

  //
  mapping: {},

  //
  defaultOptions: {},

  //
  exceptOptions: [],

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
      // Initialize relations
      if ($.actions) { $.actions.start(); }
      // Watch for dialog open events and render content
      if ($.ui && $.ui.dialog) {
        $(':ui-dialog').live('dialogopen', function() { $(this).render(); });
      }
      $.render.optimize();
      $('body').render();
    });
  }
};

$(document).trigger('renderinit').one('renderafter', function() {
  $('html').removeClass('render-loading');
});

// Default to render on load
if (!('auto' in $.render)) { $.render.auto = true; }
if ($.render.auto === true) {
  $.render.start();
}

})(jQuery);
