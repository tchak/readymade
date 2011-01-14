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
