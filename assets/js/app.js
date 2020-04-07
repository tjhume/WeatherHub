jQuery(document).ready(function($){
    // If we are entering the page with a query from the home page
    if(getLocation('location') != '' && getLocation('location') != undefined && getLocation('location').toLowerCase() != 'current location'){   

    }
    //If we are entering the page with no query
    else{
        location = 'Current Location';
        getCurrentLocation();
    }
});


//Functions

function getLocation(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for(var i = 0; i< sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if(sParameterName[0] == sParam){
            return decodeURIComponent(sParameterName[1]);
        }
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geoSuccess, geoErr);
    } else {
        $('#error').html('Geolocation is not supported on this browser');
    }
}

function geoSuccess(pos){
    alert('Successful geolocation!');
}

function geoErr(err){
    alert('Something went wrong with geolocation.');
}