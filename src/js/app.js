(function ($) {

    lockr = require ('lockr');
    query = require ('./query.js');

    console.log('app.js loaded');

    var $loading = $('#loadingDiv').hide();

    $(document)
        .ajaxStart(function () {
            $loading.show();
        })
        .ajaxStop(function () {
            $loading.hide();
        });
    
})(jQuery);
  
