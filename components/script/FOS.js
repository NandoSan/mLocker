function openDB(data, callback){
    console.log('Going to open a IndexedDB database');
    var idbreq = indexedDB.open("com-agiledever-bablabl-20", 1);
    idbreq.onerror = function(){console.log('ERROR opening the database');};//general_idb_error_handler;
    idbreq.onupgradeneeded = function(event) {
        console.log('IDB ugrade needed!!');
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

function emptyDB(){
    var transaction = db.transaction(["files"], "readwrite");
    var req = transaction.objectStore("files").clear();
    req.onerror = function(event){console.log('ERROR clearing the objectStore');};
    req.onsuccess = function(event){
        Lungo.Notification.success(
            "OK",                  //Title
            "Eliminados todos los datos",     //Description
            "check",                    //Icon
            3                          //Time on screen
        );
                    
    };
}

function deletefromDB(key){
    var transaction = db.transaction(["files"], "readwrite");
    transaction.onerror = function(event){console.log('Delete Transaction Error');};
    transaction.oncomplete = function(event){console.log('Delete Transaction Completed');};
    var req = transaction.objectStore("files").delete(key/1);
    req.onerror = function(event){console.log('ERROR deleting form DB');};
    req.onsuccess = function(event){console.log('SUCCESS deleting from de DB');};
                                  
}

function getNewImg() {
    var a = new MozActivity({ name: "pick", data: {type: ["image/jpeg", "image/png"]} });
    a.onerror = function (event) { console.log('ERROR on picking a photo'); };
    a.onsuccess = function (event) {
        Lungo.Element.loading('#load',1);
        console.log('SUCCESS');  
        
        console.log('Returned blob: ' + a.result.blob);
        var fReader = new FileReader();       
        fReader.readAsDataURL(a.result.blob);
        console.log('');
        fReader.onerror = function(event){console.log('ERROR loading a file');};
        fReader.onloadstart = function(event){console.log('START TO load a file');};
        fReader.onprogress = function(event){console.log('LOADING a file');};
        fReader.onloadend = function(event){console.log('LOAD END EVENT..');Lungo.Element.loading('#load',0);};
        
        fReader.onload = function (event){
            console.log('');
            var newId = $$('article#gallery img:last-child').attr('id');
            console.log('\nnewId = '+newId);
            newId = newId.slice(6, newId.length);
            console.log('\nnewId = '+newId);
            newId++;
            console.log('\nnewId = '+newId);
            $$('article#gallery').append('<img id="image-' + newId + '"class="shadow" src="' + event.target.result + '">');
            $$('article#gallery img:last-child').on('doubleTap', fullScreen);
            console.log('\nINDICE LAST ELEMENT --> ' + $$('article#gallery img:last-child').attr('id'));
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
    var idx = img.indexOf('base64');
    img=img.slice(idx+7, img.lenght);
    
//    var store = new Blob([sjcl.encrypt(window.key, img)]);
    var store = new Blob([sjcl.encrypt(localStorage.getItem('fundationKey'), img)]);
    
    var transaction = db.transaction(["files"], "readwrite");
    transaction.objectStore("files").add(store);
}

function loadDBImages()
{
    var transaction = db.transaction(["files"]);
    
    Lungo.Element.loading('#load',1);
    var imgsReq = transaction.objectStore("files").openCursor();
    imgsReq.onerror = function(){
        console.log('Error getting IDB cursor');
        Lungo.Element.loading('#load',0);
        Lungo.Notification.error(
                "ERROR",              
                "Error accessing stored files..sorry",
                "cancel",
                3
            );
    };
    imgsReq.onsuccess = function(event)
        {
            Lungo.Element.loading('#load',0);
            var cursor = event.target.result;
            if (cursor) {
                console.log("key for cursor " + cursor.key);
                
                Lungo.Element.loading('#load',1);
                var fReader = new FileReader();
                fReader.newId=cursor.key;
                
                fReader.readAsBinaryString(cursor.value);
                fReader.onerror = function(event){console.log('ERROR loading a file');};
//                fReader.onloadstart = function(event){console.log('START TO load a file');};
//                fReader.onprogress = function(event){console.log('LOADING a file');};
                fReader.onloadend = function(event){console.log('LOAD END EVENT..');Lungo.Element.loading('#load',0);};
                
                fReader.onload = function (event){
                    var src='data:application/octet-stream;base64,';
//                    $$('article#gallery').append('<img id="image-' + cursor.key + '" class="shadow" src="' + src.concat(sjcl.decrypt(window.key, event.target.result)) + '">');
                    $$('article#gallery').append('<img id="image-' + event.target.newId + '" class="shadow" src="' + src.concat(sjcl.decrypt(localStorage.getItem('fundationKey'), event.target.result)) + '">');
                    $$('article#gallery img:last-child').on('doubleTap', fullScreen);
                    
                }
                cursor.continue();
                
            } else {                
                console.log("No more entries!");
//                Lungo.Element.loading('#load',0);
            } 
        }
}

function loadImgs(){
    console.log('loading images...');
    if(window.db === undefined){openDB(null, loadDBImages);}else{loadDBImages();}
}