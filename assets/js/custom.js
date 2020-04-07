jQuery(document).ready(function($){
    $('.home-content #submit').click(function(e){
        e.preventDefault();
        var location = $('.home-content #search').val();
        var base = 'https://api.openweathermap.org/data/2.5/weather?q=';
        var key = '&appid=34667b930b9d1bb7dfa30e0163f0e192';
        var url = base + location + key;
        $.get(url, function(data){
            $('#result').html(JSON.stringify(data));
            console.log(data);
        });     
    })
});