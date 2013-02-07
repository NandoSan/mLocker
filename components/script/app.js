Lungo.init({
            name: 'mLocker',
            version: '0.1.9'
});

Lungo.ready(function() {
    window.key = "1234567890"
    loadImgs();
});

Lungo.Events.init({
    'tap section#main header nav a:nth-child(2)':function(event){
        getNewImg();
        
    }
});

//print all DeviceStorageCursor properties
//obj=navigator.getDeviceStorage("pictures").enumerate();for (property in obj) {console.log( property + '--> ' + obj[property]+'; ');}
//obj=navigator.getDeviceStorage("pictures").enumerate();for (property in obj) {console.log( property + '--> ' + obj[property]+'; ');}
//navigator.getDeviceStorage("pictures").enumerate().addEventListener('readyState', function(event){console.log('READY --> '+event);});

//JSON.stringify(obj);