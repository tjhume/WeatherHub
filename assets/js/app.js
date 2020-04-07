var gettingCurrent = false;
var gettingLocation = false;

//Cookies.remove('locations');

jQuery(document).ready(function($){
    var location = getLocation('location');
    if(location){
        location = location.replace('+', ' ');
    }

    var locations = Cookies.get('locations');
    if(locations){
        if(locations.includes('|')){
            locations = locations.split('|');
            for(var i = 0; i < locations.length; i++){
                $('.location-select').append('<div class="location-box" role="button">'+locations[i]+'</div>');
            }
        }else{
            $('.location-select').append('<div class="location-box" role="button">'+locations+'</div>');
        }
    }

    // If we are entering the page with a query from the home page
    if(location != '' && location != undefined && location.toLowerCase() != 'current+location'){
        getInfo(location);
    }
    // If we are entering the page with no query and no default location, use geolocation
    else{
        getCurrentLocation();
    }

    $('.add-location .location-box').click(function(){
        if(!gettingCurrent && !gettingLocation){
            $('.form-overlay .error').html('');
            $('.form-overlay').css('display', 'block');
        }
    });

    $('#submit-button').click(function(){
        var location = $('#search').val();
        if(location == ''){
            $('.form-overlay .error').html('Invalid input');
        }else{
            $('.loading').css('display', 'block');
            $('.form-overlay').css('display', 'none');
            getInfo(location);
        }
    });

    $('#cancel-button').click(function(){
        $('.form-overlay').css('display', 'none');
    });
});


// Functions

// Get location from the URL
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

// Uses geolocation to get the current location
function getCurrentLocation() {
    gettingCurrent = true;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geoSuccess, geoErr);
    } else {
        gettingCurrent = false;
        $('.loading').css('display', 'none');
        alert('Geolocation is not supported on this browser.');
    }
}

// If geolocation succeeds we move over to the getInfoLatLon function
function geoSuccess(pos){
    var request = $.get('https://api.openweathermap.org/data/2.5/weather?lat='+pos.coords.latitude+'&lon='+pos.coords.longitude+key);

    request.done(function(data){
        console.log(data);
        getInfoLatLon(pos.coords.latitude, pos.coords.longitude, data.name, data.main.temp, data.main.feels_like, data.weather[0].description);
    });

    request.fail(function(){
        gettingCurrent = false;
        $('.loading').css('display', 'none');
        alert('Something went wrong with geolocation');
    });
}

// Alert if geolocation failes
function geoErr(err){
    gettingCurrent = false;
    $('.loading').css('display', 'none');
    alert('Something went wrong with geolocation.');
}

var key = '&appid=34667b930b9d1bb7dfa30e0163f0e192';

// How we normally display a location
function getInfo(location){
    gettingLocation = true;
    var base = 'https://api.openweathermap.org/data/2.5/weather?q=';
    var url = base + location + key;
    var request = $.get(url);

    // Successful request
    request.done(function(data){
        var lon = data.coord.lon;
        var lat = data.coord.lat;

        //Move over to lat/long request
        getInfoLatLon(lat, lon, location, data.main.temp, data.main.feels_like, data.weather[0].description);
    });

    // Alert if request failed
    request.fail(function(){
        gettingLocation = false;
        gettingCurrent = false;
        $('.loading').css('display', 'none');
        alert('Something went wrong with your request!')
    });
}

/**
 * ALL SUCCESSFUL REQUESTS FOR LOCATION ARRIVE HERE
 */
function getInfoLatLon(lat, lon, location, currentTemp, currentFeels, currentDesc){
    var url = 'https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+lon+key;
    var request = $.get(url);

    // Successful location request
    request.done(function(data){
        var tomorrow = data.daily[1];
        console.log(tomorrow);

        var locations = [];
        var cookie = Cookies.get('locations');
        if(cookie){
            if(cookie.includes('|')){
                locations = cookie.split('|');
            }else{
                locations.push(cookie);
            }
        }
        if(!gettingCurrent && !locations.includes(location) && location.toLowerCase() != 'current location'){
            locations.push(location);
            $('.location-select').append('<div class="location-box" role="button">'+location+'</div>');
            Cookies.set('locations', locations.join('|'), { path: '/' });
        }

        $('.current-location-box').html('Location: ' + location);
        $('.condition').html(currentDesc + ', ' + KtoF(currentTemp) + '&deg;');
        $('.feels').html('Feels like: ' + KtoF(currentFeels) + '&deg;');
        $('.tomorrow').html('Tomorrow: ' + tomorrow.weather[0].description + ' ' + KtoF(tomorrow.temp.day) + '&deg;');

        gettingLocation = false;
        gettingCurrent = false;
        $('.loading').css('display', 'none');
    });

    // Failed location request
    request.fail(function(){
        gettingLocation = false;
        gettingCurrent = false;
        $('.loading').css('display', 'none');
        alert('Something went wrong with your request!');
    });
}

// Kelvin to Fahrenheit
function KtoF(temp) {
    temp = parseFloat(temp);
    return Math.round(((temp-273.15)*1.8)+32);
}