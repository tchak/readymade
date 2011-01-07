(function($, undefined) {

$.extend(true, $.render, {

  //
  mapping: {
    'button': 'button, input:submit, input:reset, input:button, [data-role=button]',
    'buttonset': '[data-role=buttonset]',
    'datepicker': 'input[data-type=date], [data-role=datepicker]',
    'tabs': '[data-role=tabs]',
    'accordion': '[data-role=accordion]',
    'progressbar': '[data-role=progressbar]',
    'autocomplete': '[data-role=autocomplete]',
    // Alpha 1.9 UI widgets
    'spinner': 'input[data-role=spinner]',
    'menu': '[data-role=menu]:visible'
  },

  //
  options: {
    tabs: {
      cache: true
    },
    dialog: {
      modal:true,
      width: 450,
      buttons: {
        OK: function() {
          $(this).dialog('close');
        }
      }
    }
  }
});

$.merge($.render.exceptOptions, ['type', 'role']);

})(jQuery);
