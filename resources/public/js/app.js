(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(root, factory) {

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = factory(root, exports);
    }
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      root.Lockr = factory(root, exports);
    });
  } else {
    root.Lockr = factory(root, {});
  }

}(this, function(root, Lockr) {
  'use strict';

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
      var len = this.length >>> 0;

      var from = Number(arguments[1]) || 0;
      from = (from < 0)
      ? Math.ceil(from)
      : Math.floor(from);
      if (from < 0)
        from += len;

      for (; from < len; from++)
      {
        if (from in this &&
            this[from] === elt)
          return from;
      }
      return -1;
    };
  }

  Lockr.prefix = "";

  Lockr._getPrefixedKey = function(key, options) {
    options = options || {};

    if (options.noPrefix) {
      return key;
    } else {
      return this.prefix + key;
    }

  };

  Lockr.set = function (key, value, options) {
    var query_key = this._getPrefixedKey(key, options);

    try {
      localStorage.setItem(query_key, JSON.stringify({"data": value}));
    } catch (e) {
      if (console) console.warn("Lockr didn't successfully save the '{"+ key +": "+ value +"}' pair, because the localStorage is full.");
    }
  };

  Lockr.get = function (key, missing, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(localStorage.getItem(query_key));
    } catch (e) {
        try {
            if(localStorage[query_key]) {
                value = JSON.parse('{"data":"' + localStorage.getItem(query_key) + '"}');
            } else{
                value = null;
            }
        } catch (e) {
            if (console) console.warn("Lockr could not load the item with key " + key);
        }
    }
    if(value === null) {
      return missing;
    } else if (typeof value.data !== 'undefined') {
      return value.data;
    } else {
      return missing;
    }
  };

  Lockr.sadd = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json;

    var values = Lockr.smembers(key);

    if (values.indexOf(value) > -1) {
      return null;
    }

    try {
      values.push(value);
      json = JSON.stringify({"data": values});
      localStorage.setItem(query_key, json);
    } catch (e) {
      console.log(e);
      if (console) console.warn("Lockr didn't successfully add the "+ value +" to "+ key +" set, because the localStorage is full.");
    }
  };

  Lockr.smembers = function(key, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(localStorage.getItem(query_key));
    } catch (e) {
      value = null;
    }

    if (value === null)
      return [];
    else
      return (value.data || []);
  };

  Lockr.sismember = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options);

    return Lockr.smembers(key).indexOf(value) > -1;
  };

  Lockr.getAll = function () {
    var keys = Object.keys(localStorage);

    return keys.map(function (key) {
      return Lockr.get(key);
    });
  };

  Lockr.srem = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json,
        index;

    var values = Lockr.smembers(key, value);

    index = values.indexOf(value);

    if (index > -1)
      values.splice(index, 1);

    json = JSON.stringify({"data": values});

    try {
      localStorage.setItem(query_key, json);
    } catch (e) {
      if (console) console.warn("Lockr couldn't remove the "+ value +" from the set "+ key);
    }
  };

  Lockr.rm =  function (key) {
    localStorage.removeItem(key);
  };

  Lockr.flush = function () {
    localStorage.clear();
  };
  return Lockr;

}));

},{}],2:[function(require,module,exports){
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
  

},{"/Users/or/UDACITY/public_transportation/node_modules/lockr/lockr.js":1,"/Users/or/UDACITY/public_transportation/src/js/query.js":3}],3:[function(require,module,exports){

//var Stations = new Array();
var stations = [];
$(document).ready(function () {
    $.support.cors = true; // Enable Cross domain requests
    try {
        $.ajaxSetup({
            url: "http://api.trafikinfo.trafikverket.se/v1/data.json",
            error: function (msg) {
                if (msg.statusText == "abort") return;
                //                alert("Request failed: " + msg.statusText + "\n" + msg.responseText);
                messageDisplay("No network connection");
            }
        });
    }
    catch (e) { messageDisplay("An error ocurred while initializing."); }
    // Create an ajax loading indicator
    var loadingTimer;
    $("#loader").hide();
    $(document).ajaxStart(function () {
        loadingTimer = setTimeout(function () {
            $("#loader").show();
        }, 200);
    }).ajaxStop(function () {
        clearTimeout(loadingTimer);
        $("#loader").hide();
    });
    // Load stations
    PreloadTrainStations();

    // clear input fields when reselected
    $('#station-from').focus(function() { $(this).val('')});
    $('#station-to').focus(function() { $(this).val('')});
    $('#interval').focus(function() { $(this).val('')});
});

function PreloadTrainStations() {
    // Request to load all stations
    var xmlRequest = "<REQUEST>" +
        // Use your valid authenticationkey
        "<LOGIN authenticationkey='668a9ad34dfb4736880a8ce55c9a5f38' />" +
        "<QUERY objecttype='TrainStation'>" +
        "<FILTER/>" +
        "<INCLUDE>Prognosticated</INCLUDE>" +
        "<INCLUDE>AdvertisedLocationName</INCLUDE>" +
        "<INCLUDE>LocationSignature</INCLUDE>" +
        "</QUERY>" +
        "</REQUEST>";
    var stationlist = [];
    if(localStorage.getItem('stationlist') == undefined) {
        console.log ('doing ajax');
    $.ajax({
        type: "POST",
        contentType: "text/xml",
        dataType: "json",
        data: xmlRequest,
        success: function (response) {
            if (response == null) return;
            try {
    
                $(response.RESPONSE.RESULT[0].TrainStation).each(function (iterator, item)
                                                                 {
                                                                     // Save a key/value list of stations
                                                                     //Stations[item.LocationSignature] = item.AdvertisedLocationName;
                                                                     stations.push({label: item.LocationSignature, value: item.AdvertisedLocationName})
                                                                     // Create an array to fill the search field autocomplete.
                                                                     if (item.Prognosticated == true)
                                                                         stationlist.push({ label: item.AdvertisedLocationName, value: item.LocationSignature });
                                                                 });
                lockr.set('stationlist', stationlist);
                lockr.set('stations', stations);
            }
            catch (ex) { console.log ('something bad happened: ' + ex)}
        }
    });
    };
   fillSearchWidget(lockr.get('stationlist'));
};

function fillSearchWidget(data) {
//    console.log ('data: ' + data);
    $("#station-from").val("");
    $("#station-to").val("");    
    $("#station-from").autocomplete({
        // Make the autocomplete fill with matches that "starts with" only
        source: function (request, response) {
            var matches = $.map(data, function (tag) {
                if (tag.label.toUpperCase().indexOf(request.term.toUpperCase()) === 0) {
                    return {
                        label: tag.label,
                        value: tag.value
                    }
                }
            });
            response(matches);
        },
        select: function (event, ui) {
            var selectedObj = ui.item;
            $("#station-from").val(selectedObj.label);
            // Save selected stations signature
            $("#station-from").data("sign", selectedObj.value);
            return false;
        },
        focus: function (event, ui) {
            var selectedObj = ui.item;
            // Show station name in search field
            $("#station-from").val(selectedObj.label);
            return false;
        },
        create: function (e) {
            $(this).prev('.ui-helper-hidden-accessible').remove();
    //        console.log('trying to remove');
        }
    });

    $("#station-to").autocomplete({
        // Make the autocomplete fill with matches that "starts with" only
        source: function (request, response) {
            var matches = $.map(data, function (tag) {
                if (tag.label.toUpperCase().indexOf(request.term.toUpperCase()) === 0) {
                    return {
                        label: tag.label,
                        value: tag.value
                    }
                }
            });
            response(matches);
        },
        select: function (event, ui) {
            var selectedObj = ui.item;
            $("#station-to").val(selectedObj.label);
            // Save selected stations signature
            $("#station-to").data("sign", selectedObj.value);
            return false;
        },
        focus: function (event, ui) {
            var selectedObj = ui.item;
            // Show station name in search field
            $("#station-to").val(selectedObj.label);
            return false;
        },
        create: function (e) {
            $(this).prev('.ui-helper-hidden-accessible').remove();
  //          console.log('trying to remove');
        }
    });
}


function loadNetworkData(from) {
    // Request to load announcements for a station by its signature
    var xmlRequest = "<REQUEST version='1.0'>" +
        "<LOGIN authenticationkey='668a9ad34dfb4736880a8ce55c9a5f38' />" +
        "<QUERY objecttype='TrainAnnouncement' " +
        "orderby='AdvertisedTimeAtLocation' >" +
        "<FILTER>" +
        "<AND>" +
        "<OR>" +
        "<AND>" +
        "<GT name='AdvertisedTimeAtLocation' " +
        "value='$dateadd(-00:15:00)' />" +
        "<LT name='AdvertisedTimeAtLocation' " +
//      "value='$dateadd(" + hours + ":00:00)' />" +
        "value='$dateadd(24:00:00)' />" +
        "</AND>" +
        "<GT name='EstimatedTimeAtLocation' value='$now' />" +
        "</OR>" +
        "<EQ name='LocationSignature' value='" + from + "' />" +
        "<EQ name='ActivityType' value='Avgang' />" +
//      "<EQ name='ToLocation' value='" + to + "' />" +
        "</AND>" +
        "</FILTER>" +
        // Just include wanted fields to reduce response size.
        "<INCLUDE>InformationOwner</INCLUDE>" +
        "<INCLUDE>AdvertisedTimeAtLocation</INCLUDE>" +
        "<INCLUDE>TrackAtLocation</INCLUDE>" +
        "<INCLUDE>FromLocation</INCLUDE>" +
        "<INCLUDE>ToLocation</INCLUDE>" +
        "</QUERY>" +
        "</REQUEST>";
    
    var p = new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            contentType: "text/xml",
            dataType: "json",
            data: xmlRequest,
            success: function (response) {
                if (response == null) reject("no network");
                if (response.RESPONSE.RESULT[0].TrainAnnouncement == null) reject("no departures found");
                try {
                    console.log('about to resolve');
                    resolve(response.RESPONSE.RESULT[0].TrainAnnouncement);
                }
                catch (ex) {
                    console.log('something went wrong with saving the response: ' + ex );
                    reject(ex);
                };
            }
        });
    });
    return p;
};

window.Search = function Search() {
    var from = $("#station-from").data("sign");
    var to = $("#station-to").data("sign");
    var hours = $ ("#interval").val().toString();
    // Clear html table
    $('#timeTableDeparture tr:not(:first)').remove();
    getStoredResponse(from, to, hours);
};

function getStoredResponse(from, to, hours) {
//    Offline.check();
//    console.log('offline is: ' + Offline.state);
    var res = lockr.get(from);
    var now = new Date;
    var hoursToMsecs = hours * (60 * 60 * 1000);
    var future24h = 0;
    if(lockr.get(from)) { future24h = new Date(lockr.get(from).date).getTime() + (24 * 60 * 60 * 1000) };

    if(future24h - (now.getTime() + hoursToMsecs) < 0) { // TODO also account for empty lockr
        loadNetworkData(from).then(function(res){
            saveResponse(from, res);
            console.log('rendering from network');
            messageDisplay('Data from network');
            renderTrainAnnouncement(filterResponse(res, to, hours));
        }).catch(function(err){
            lockr.set(from, "");
            console.log('err: ' + err);
            messageDisplay2('Something bad happened');

        });
    }
    else {
        console.log('rendering from store');
        messageDisplay('Data from local storage');        
        renderTrainAnnouncement(filterResponse(lockr.get(from).result, to, hours));
    };
};
 
function saveResponse(from, res) {
    lockr.set(from, {result: res, date: new Date});
    console.log('saveResponse: ' + from);
};

function filterResponse(res, to, hours) {
    var resp = new Array();
    var nowTime = new Date().getTime();
    var hoursTime = hours * (60 * 60 * 1000);
    
    $(res).each(function (iter, item) {
        var time = new Date(item.AdvertisedTimeAtLocation).getTime();
        if(nowTime < time && time < nowTime + hoursTime) {
            $(item.ToLocation).each(function(iter, item2) {
                if(item2 == to) resp.push(item);
            });
        }
    });
    return resp;
}
  
function renderTrainAnnouncement(announcement) {
    var Sts = lockr.get('stations');
    console.log('announcement.length: ' + announcement.length);
    if(announcement.length === 0) {messageDisplay2("No results found")} else {messageDisplay2("")};
    $(announcement).each(function (iterator, item) {
        var advertisedtime = new Date(item.AdvertisedTimeAtLocation);
        var hours = advertisedtime.getHours()
        var minutes = advertisedtime.getMinutes()
        if (minutes < 10) minutes = "0" + minutes
        var toList = new Array();
        $(item.ToLocation).each(function (iterator, toItem) {
            for (var i = 0; i < Sts.length; i++) {
                if (toItem === Sts[i].label)
                toList.push(Sts[i].value);
            };
        });

        var owner = "";
        if (item.InformationOwner != null) owner = item.InformationOwner;
        jQuery("#timeTableDeparture tr:last").
            after("<tr><td>" + hours + ":" + minutes + "</td><td>" + toList.join(', ') +
                  "</td><td>" + owner + "</td><td style='text-align: center'>" + item.TrackAtLocation +
                  "</td></tr>");
    });
}

function messageDisplay(str) {
    $("#messagedisplay").text(str);
}

function messageDisplay2(str) {
    $("#messagedisplay2").text(str);
}





},{}]},{},[2]);
