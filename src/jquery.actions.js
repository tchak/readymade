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
