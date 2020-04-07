var locations = Cookies.get('locations');
if(locations){
    var current = window.location.href;
    current = current.replace('index.html', '');
    if (current.substring(current.length-1) == "/"){
        current = current.substring(0, current.length-1);
    }
    if (current.substring(current.length-1) == "/"){
        current = current.substring(0, current.length-1);
    }
    window.location.replace(current + "/app/index.html");
}
