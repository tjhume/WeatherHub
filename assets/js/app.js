var gettingCurrent = false;
var gettingLocation = false;

//Cookies.remove('locations');

jQuery(document).ready(function($){
    var location = getLocation('location');
    window.history.replaceState(null, null, window.location.pathname);
    if(location){
        location = location.replace('+', ' ').toLowerCase();
    }

    var locations = Cookies.get('locations');
    if(locations){
        if(locations.includes('|')){
            locations = locations.split('|');
            for(var i = 0; i < locations.length; i++){
                $('.location-select').append('<div class="box-wrap"><div class="location-box" role="button">'+locations[i]+'</div><div class="close">x</div></div>');
            }
        }else{
            $('.location-select').append('<div class="box-wrap"><div class="location-box" role="button">'+locations+'</div><div class="close">x</div></div>');
        }
    }

    // If we are entering the page with a query from the home page
    if(location != '' && location != undefined && location.toLowerCase() != 'current location'){
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
        if(location == '' || location.toLowerCase() == 'current location'){
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

    $('.location-select .box-wrap .location-box').on('click', function(){
        if(!$(this).hasClass('current')){
            $('.loading').css('display', 'block');
            $('.form-overlay').css('display', 'none');
            var find = $(this).html();
            find = find.replace('<span>', '');
            find = find.replace('</span>', '');
            getInfo(find);
        }else{
            $('.loading').css('display', 'block');
            $('.form-overlay').css('display', 'none');
            getCurrentLocation();
        }
    });

    $('.location-select .close').on('click', function(){
        var location = $(this).siblings('.location-box').html();

        var locations = [];
        var cookie = Cookies.get('locations');
        if(cookie){
            if(cookie.includes('|')){
                locations = cookie.split('|');
            }else{
                locations.push(cookie);
            }
        }

        for(var i = 0; i < locations.length; i++){
            if(location == locations[i]){
                locations.splice(i, 1);
                break;
            }
        }

        Cookies.set('locations', locations.join('|'), { path: '/' });
        $(this).closest('.box-wrap').remove();
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
    location = location.toLowerCase();

    // Wraps states in a span to capitalize them in CSS
    states = location.split(' ');
    var temp = '';
    for(var i = 0; i < states.length; i++){
        if(states[i].length == 2 || (states[i].length == 3 && states[i].substring(states[i].length-1) == ",")){
            if(i + 1 < states.length){
                temp += ('<span>' + states[i] + '</span> ');
            }else{
                temp += ('<span>' + states[i] + '</span>');
            }
        }else if(i + 1 < states.length){
            temp += states[i] + ' ';
        }else{
            temp += states[i];
        }
        location = temp;
    }

    // Successful location request
    request.done(function(data){
        var tomorrow = data.daily[1];

        var locations = [];
        var cookie = Cookies.get('locations');
        if(cookie){
            if(cookie.includes('|')){
                locations = cookie.split('|');
            }else{
                locations.push(cookie);
            }
        }
        if(!gettingCurrent && !locations.includes(location) && location != 'current location'){
            locations.push(location);
            $('.location-select').append('<div class="box-wrap"><div class="location-box" role="button">'+location+'</div><div class="close">x</div></div>');
            $('.location-select .box-wrap .location-box').off();
            $('.location-select .box-wrap .location-box').on('click', function(){
                if(!$(this).hasClass('current')){
                    $('.loading').css('display', 'block');
                    $('.form-overlay').css('display', 'none');
                    var find = $(this).html();
                    find = find.replace('<span>', '');
                    find = find.replace('</span>', '');
                    getInfo(find);
                }else{
                    $('.loading').css('display', 'block');
                    $('.form-overlay').css('display', 'none');
                    getCurrentLocation();
                }
            });
            $('.location-select .close').off();
            $('.location-select .close').on('click', function(){
                var location = $(this).siblings('.location-box').html();

                var locations = [];
                var cookie = Cookies.get('locations');
                if(cookie){
                    if(cookie.includes('|')){
                        locations = cookie.split('|');
                    }else{
                        locations.push(cookie);
                    }
                }
                
                for(var i = 0; i < locations.length; i++){
                    if(location == locations[i]){
                        locations.splice(i, 1);
                        break;
                    }
                }

                Cookies.set('locations', locations.join('|'), { path: '/' });
                $(this).closest('.box-wrap').remove();
            });
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