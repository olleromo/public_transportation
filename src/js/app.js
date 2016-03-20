(function ($) {
    
//    foundation = require ('/Users/or/UDACITY/public_transportation/node_modules/foundation-sites/dist/foundation.js');

    lockr = require ('/Users/or/UDACITY/public_transportation/node_modules/lockr/lockr.js');
    javascript_search = require ('/Users/or/UDACITY/public_transportation/src/js/query.js');

    console.log('app.js loaded');

    // offline.js options
    // Offline.options = {checks: {xhr: {url: '/connection-test'}},
    //                    checkOnLoad: true,
    //                    interceptRequests: true,
    //                    reconnect: {
    //                        initialDelay: 3,
    //                        // delay: (1.5 * last delay, capped at 1 hour)
    //                    },
    //                    requests: true,
    //                    game: false
    //                   };

    // Offline.on(event, handler, context) {
    //     function(event){
    //         if(event == 'up'){
    //             console.log('offline signals up: ' + event);
    //         };
    //         if(event == 'down') {
    //             console.log('offline signals down: ' + event);
    //         };
    //     };
   
    var $loading = $('#loadingDiv').hide();

    $(document)
        .ajaxStart(function () {
            $loading.show();
        })
        .ajaxStop(function () {
            $loading.hide();
        });
    
})(jQuery);
  
