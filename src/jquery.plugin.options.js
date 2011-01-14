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
