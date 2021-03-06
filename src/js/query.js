
//var Stations = new Array();
var stations = [];
$(document).ready(function () {
    $.support.cors = true; // Enable Cross domain requests
    try {
        $.ajaxSetup({
            url: "http://api.trafikinfo.trafikverket.se/v1/data.json",
            error: function (msg) {
                if (msg.statusText == "abort") return;
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
        }
    });
}


function loadNetworkData(from) {
    // Request to load announcements for a station by its signature
    var xmlRequest =
        "<REQUEST version='1.0'>" +
        "<LOGIN authenticationkey='668a9ad34dfb4736880a8ce55c9a5f38' />" +
        "<QUERY objecttype='TrainAnnouncement' " + "orderby='AdvertisedTimeAtLocation' >" +
        "<FILTER>" +
          "<AND>" +
            "<OR>" +
              "<AND>" +
                "<GT name='AdvertisedTimeAtLocation' " + "value='$dateadd(-00:15:00)' />" +
                "<LT name='AdvertisedTimeAtLocation' " + "value='$dateadd(48:00:00)' />" +
              "</AND>" +
              "<AND>" +
                "<GT name='EstimatedTimeAtLocation' " + "value='$dateadd(-00:15:00)'/>" +
                "<LT name='EstimatedTimeAtLocation' " + "value='$dateadd(48:00:00)'/>" +        
              "</AND>" +
            "</OR>" +
            "<EQ name='LocationSignature' value='" + from + "' />" +
            "<EQ name='ActivityType' value='Avgang' />" +
          "</AND>" +
        "</FILTER>" +
        "<INCLUDE>InformationOwner</INCLUDE>" +
        "<INCLUDE>AdvertisedTimeAtLocation</INCLUDE>" +
        "<INCLUDE>TrackAtLocation</INCLUDE>" +
        "<INCLUDE>FromLocation</INCLUDE>" +
        "<INCLUDE>ToLocation</INCLUDE>" +
        "<INCLUDE>EstimatedTimeAtLocation</INCLUDE>" +
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
    var res = lockr.get(from);
    var now = new Date;
    var hoursToMsecs = hours * (60 * 60 * 1000);
    var future48h = 0;
    if(lockr.get(from)) { future48h = new Date(lockr.get(from).date).getTime() + (48 * 60 * 60 * 1000) };

    if(future48h - (now.getTime() + hoursToMsecs) < 0) { // TODO also account for empty lockr
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
    var mnth = new Array();
    mnth[0] = "Jan";
    mnth[1] = "Feb";
    mnth[2] = "Mar";
    mnth[3] = "Apr";
    mnth[4] = "May";
    mnth[5] = "Jun";
    mnth[6] = "Jul";
    mnth[7] = "Aug";
    mnth[8] = "Sep";
    mnth[9] = "Oct";
    mnth[10] = "Nov";
    mnth[11] = "Dec";
    
    if(announcement.length === 0) {messageDisplay2("No results found")} else {messageDisplay2("")};
    $(announcement).each(function (iterator, item) {
        var advertisedtime = new Date(item.AdvertisedTimeAtLocation);
        var amonth = mnth[advertisedtime.getMonth()];
        var aday = advertisedtime.getDate();
        var ahours = advertisedtime.getHours();
        var aminutes = advertisedtime.getMinutes();
        var estimatedtime = new Date(item.EstimatedTimeAtLocation);

        var ehours = estimatedtime.getHours() ? estimatedtime.getHours() : ahours;
        var eminutes = estimatedtime.getMinutes() ? estimatedtime.getMinutes() : aminutes;
        if (aminutes < 10) aminutes = "0" + aminutes;
        if (eminutes < 10) eminutes = "0" + eminutes;
        
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
            after("<tr><td>" + amonth + " " + aday +
                  "</td><td>" + ahours + ":" + aminutes +
                  "</td><td>" + ehours + ":" + eminutes +
                  "</td><td>" + toList.join(', ') +
                  "</td><td>" + item.TrackAtLocation + "</td></tr>");
    });
}

function messageDisplay(str) {
    $("#messagedisplay").text(str);
}

function messageDisplay2(str) {
    $("#messagedisplay2").text(str);
}


