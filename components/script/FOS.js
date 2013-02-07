function openDB(data, callback){
    console.log('Going to open a IndexedDB database');
//    console.log('-> ' + data);
    
    var idbreq = indexedDB.open("com-agiledever-bablabl-20", 1);
          
    idbreq.onerror = function(){console.log('ERROR opening the database');};//general_idb_error_handler;
//    console.log('');
    idbreq.onupgradeneeded = function(event) {
        console.log('IDB ugrade needed!!');
//        console.log(event.target);
        var db = idbreq.result;
        console.log('Trying to add an object store');
        var objectStore = db.createObjectStore("files", {autoIncrement: true});
    };
    idbreq.onsuccess=function(){
        console.log('SUCCESS on open database');
        window.db = idbreq.result;
        window.db.onerror = function (event) {
            console.log("Error creating/accessing IndexedDB database");
        };
        callback(data);
    };
}


function getNewImg() {
    var a = new MozActivity({ name: "pick", data: {type: ["image/jpeg", "image/png"]} });
//    for (property in a) {
//        console.log( property + '--> ' + a[property]+'; ');
//    }
    a.onerror = function (event) { console.log('ERROR on picking a photo'); };
    a.onsuccess = function (event) {
        console.log('SUCCESS');  
        
//        var last = $$('article#gallery img:nth-last-child(1)').attr('src').split('.')[0];
        console.log('Returned blob: ' + a.result.blob);
        var fReader = new FileReader();       
        fReader.readAsDataURL(a.result.blob);
        console.log('');
        fReader.onerror = function(event){console.log('ERROR loading a file');};
        fReader.onloadstart = function(event){console.log('START TO load a file');};
        fReader.onprogress = function(event){console.log('LOADING a file');};
        fReader.onloadend = function(event){console.log('LOAD END EVENT..');};
        
        fReader.onload = function (event){
            console.log('');
            $$('article#gallery').append('<img class="shadow" src="' + event.target.result + '">');
//            console.log('RESULT --> ' + event.target.result);
            console.log('');
//            storeNew(event.target.result);
            if (window.db === undefined){
                openDB(event.target.result, storeNew);
            }
            else{
                storeNew(event.target.result);
            }  
        };
        console.log('');
        
    };
}

function storeNew(img)
{    
//    console.log('TEST --> \n' + img);
    var idx = img.indexOf('base64');
    img=img.slice(idx+7, img.lenght);
//    console.log('TEST --> ' + img);
//    console.log('TEST --> \n' + img.replace(/.*base64,/g,''));
    
//    console.log('START encryption');
    var store = new Blob([sjcl.encrypt(window.key, img)]);
//    console.log('END encryption');
    var transaction = db.transaction(["files"], "readwrite");
    transaction.objectStore("files").add(store);
                         
    
/**************** Upgrade implemetation

//    console.log('TESTING WORKERS');
    var worker = new Worker('components/script/aes.js');
    worker.postMessage({msg: 'data', data: img});
    worker.onmessage=function(event){
//        console.log('Received message from worker!!! --> ' + event.data);
        if(event.data.cmd == 'ready'){
//            console.log('Now we will store an encrpted version of image');
//            console.log('received --> ' + event.data.cipher);
           
            var transaction = db.transaction(["files"], "readwrite");
            transaction.objectStore("files").add(event.data.cipher);
        }
    };
*******************/
}

function loadDBImages()
{
   var transaction = db.transaction(["files"]);
    
    var imgsReq = transaction.objectStore("files").openCursor();
    imgsReq.onerror = function(){console.log('Error getting IDB cursor');};
    imgsReq.onsuccess = function(event)
        {
           var cursor = event.target.result;
            if (cursor) {
                console.log("key for cursor " + cursor.key);
                
                var fReader = new FileReader();       
                fReader.readAsBinaryString(cursor.value);
                fReader.onerror = function(event){console.log('ERROR loading a file');};
                fReader.onloadstart = function(event){console.log('START TO load a file');};
                fReader.onprogress = function(event){console.log('LOADING a file');};
                fReader.onloadend = function(event){console.log('LOAD END EVENT..');};
                
                fReader.onload = function (event){
//                    console.log('LOAD event, result -->\n' + sjcl.decrypt(window.key, event.target.result));
                    var src='data:application/octet-stream;base64,';
                    $$('article#gallery').append('<img id="image-' + cursor.key + '" class="shadow" src="' + src.concat(sjcl.decrypt(window.key, event.target.result)) + '">');
                }
                
//                $$('article#gallery').append('<img id="image-' + cursor.key + '" class="shadow" src="' + cursor.value + '">');
//                    console.log('RESULT --> ' + event.target.result);
                
                cursor.continue();
            }
                else {
                console.log("No more entries!");
            } 
        }
    
    
    
/********************************************  When we store Blobs without encryption
    var transaction = db.transaction(["files"]);
    
    var imgsReq = transaction.objectStore("files").openCursor();
    imgsReq.onerror = function(){console.log('Error getting IDB cursor');};
    imgsReq.onsuccess = function(event)
        {
            var cursor = event.target.result;
            if (cursor) {
                console.log("key for cursor " + cursor.key);
                var fReader = new FileReader();
                fReader.readAsDataURL(cursor.value);
                fReader.onloadend = function(event)
                    {
                    $$('article#gallery').append('<img id="image-' + cursor.key + '" class="shadow" src="' + event.target.result + '">');
//                    console.log('RESULT --> ' + event.target.result);
                };
                
                cursor.continue();
            }
                else {
                console.log("No more entries!");
            }
        }
**********************************************/
}

function loadImgs(){
    console.log('loading images...');
    if(window.db === undefined)
        openDB(null, loadDBImages);
}

//sjcl.encrypt("password", "data");