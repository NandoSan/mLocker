Lungo.init({
            name: 'mLocker',
            version: '0.1.9'
});

Lungo.ready(function() {
//    window.key = "1234567890";
    console.log('LUNGO READY');
    if(localStorage.getItem('fundationKey')){
        $$('a#newuser').hide();    
    }
    
});

Lungo.Events.init({
    'tap section#main header nav a:nth-child(2)':function(event){
        getNewImg();
    },
    'tap section#main header nav a:nth-child(3)':function(event){
        $$('article#gallery img').remove();
        for(i=0;i<$$('section#login form input').length;i++){
            $$('section#login form input')[i].value='';
        }
//        while(Lungo.Router.History.current() != 'login'){
            Lungo.Router.back();
//        }
    },
    'tap a#in':function(event){
        if(localStorage.getItem('fundationKey') === undefined || localStorage.getItem('fundationKey') == null){
            Lungo.Notification.error(
                "ERROR",              
                "No existe ningun usuario",
                "cancel",
                3
            );
            return;
        }
        var user = $$('article#log form input:nth-child(1)').val();
        var pas = $$('article#log form input:nth-child(2)').val();
        
        var bitArray = sjcl.hash.sha256.hash(user.concat(pas));  
        var digest_sha256 = sjcl.codec.hex.fromBits(bitArray);
        
        if(localStorage.getItem('fundationKey') !== digest_sha256){
            Lungo.Notification.error(
                "ERROR",              
                "Usuario o contraseña incorecta",
                "cancel",
                3
            );
            return;
        }

        Lungo.Router.section('main');
        loadImgs();
    },
    'tap article#sets #change':function(event){
        Lungo.Notification.confirm({
            icon: 'warning',
            title: 'Cuidado',
            description: 'Cambiando el usuario o la contraseña, todos los datos serán eliminados.',
            accept: {
                label: 'Eliminar datos',
                callback: function(){
                    Lungo.Notification.hide();
                    $$('a#newuser').show();
                    delete localStorage.fundationKey;
                    emptyDB();
                    $$('section#login article').toggleClass('current');
                    while(Lungo.Router.History.current() != 'login'){
                        Lungo.Router.back();
                    }
                }
            },
            cancel: {
                label: 'No quiero!'
            }
        });
    },
    'tap a#new':function(event){
        var user = $$('article#newpass form input:nth-child(1)').val();
        var pas1 = $$('article#newpass form input:nth-child(2)').val();
        var pas2 = $$('article#newpass form input:nth-child(3)').val();
        
        var error = "noerror";
        if(!pas1 || !pas2){
            error = "Campo contraseña vacío";
        } else if(!(pas1 === pas2)){
            error = "Las contraseñas no coinciden";
        } else if(!user){
            error = "Nombre de usuario necesario";
        }
        
        if (error !== "noerror"){
            Lungo.Notification.error(
                "ERROR",              
                error,
                "cancel",
                3
            );
            return;
        }
        
        var bitArray = sjcl.hash.sha256.hash(user.concat(pas1));  
        var digest_sha256 = sjcl.codec.hex.fromBits(bitArray);
        
        localStorage.setItem('fundationKey', digest_sha256);
        
        Lungo.Router.section('main');
        loadImgs();
    }
});