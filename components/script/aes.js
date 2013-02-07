importScripts('sjcl.js'); 

self.onmessage = function(event){
    if(event.data.msg == 'data')
    {
//        console.log('Worker received data: \n' + event.data.data);
//        self.postMessage({cmd:'testCipher', data:sjcl.encrypt("password", "data")});
        self.postMessage({cmd:'ready', cipher:event.data.data});
    }
    
};

//console.log('Worker abaut to send "ready" message');
//self.postMessage('ready');
    