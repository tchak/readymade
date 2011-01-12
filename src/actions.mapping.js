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
