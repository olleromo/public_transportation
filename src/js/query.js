
//var Stations = new Array();
var db = new PouchDB('todos');
var stations = [];
$(document).ready(function () {
    $.support.cors = true; // Enable Cross domain requests
    try {
        $.ajaxSetup({
            url: "http://api.trafikinfo.trafikverket.se/v1/data.json",
            error: function (msg) {
                if (msg.statusText == "abort") return;
                alert("Request failed: " + msg.statusText + "\n" + msg.responseText);
            }
        });
    }
    catch (e) { alert("Ett fel uppstod vid initialisering."); }
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

    if(typeof(localStorage) !== "undefined") {
        console.log('Storage exists');
    } else {
    console.log('Storage doesn\'t exist'); 
    };

    // PouchDB stuff --------------------------------------------
    // function addTodo(text) {
    //     var todo = {
    //         _id: new Date().toISOString(),
    //         title: text,
    //         completed: false
    //     };
    //     db.put(todo, function callback(err, result) {
    //         if (!err) {
    //             console.log('Successfully posted a todo!');
    //         }
    //     });
    // };
    // addTodo ('savin');
    
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
        }
    });
}

window.Search = function Search() {
    var from = $("#station-from").data("sign");
    var to = $ ("#station-to").data ("sign");
    // Clear html table
    $('#timeTableDeparture tr:not(:first)').remove();

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
        "value='$dateadd(10:00:00)' />" +
        "</AND>" +
        "<GT name='EstimatedTimeAtLocation' value='$now' />" +
        "</OR>" +
        "<EQ name='LocationSignature' value='" + from + "' />" +
        "<EQ name='ActivityType' value='Avgang' />" +
        "<EQ name='ToLocation' value='" + to + "' />" +
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
    $.ajax({
        type: "POST",
        contentType: "text/xml",
        dataType: "json",
        data: xmlRequest,
        success: function (response) {
            if (response == null) return;
            if (response.RESPONSE.RESULT[0].TrainAnnouncement == null)
                jQuery("#timeTableDeparture tr:last").
                after("<tr><td colspan='4'>No departures were found</td></tr>");
            try {
                renderTrainAnnouncement(response.RESPONSE.RESULT[0].TrainAnnouncement);
            }
            catch (ex) { }
        }
    });
}
 
function renderTrainAnnouncement(announcement) {
    var Sts = lockr.get('stations');
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




