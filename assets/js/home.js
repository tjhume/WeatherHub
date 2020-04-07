jQuery(document).ready(function($){
    /*$('#submit').click(function(e){
        e.preventDefault();
        var location = $('.home-content #search').val();
        var base = 'https://api.openweathermap.org/data/2.5/weather?q=';
        var key = '&appid=34667b930b9d1bb7dfa30e0163f0e192';
        var url = base + location + key;
        $.get(url, function(data){
            $('#result').html(JSON.stringify(data));
            console.log(data);
            var lon = data.coord.lon;
            var lat = data.coord.lat;
            var url2 = 'https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+lon+key;
            $.get(url2, function(data2){
                var tomorrow = data2.daily[1];
                console.log(tomorrow);
            });
        });     
    });*/
});

