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
        Lungo.Router.back();
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

        $$('article#gallery .button').hide();
        Lungo.Router.section('main');
        loadImgs();
    },
    'tap section#main nav.groupbar a':function(event){
        console.log('TAPPED: -->' + $$(event.target).attr('id'));
        if ('edit' == $$(event.target).attr('id')){
            $$('article#gallery a.button').style('display', 'inline-block');
            $$('#edit').addClass('current');
            $$('#gal').removeClass('current');
            $$('article#gallery img').off('doubleTap');
            $$('article#gallery img').on('tap', function(event){
                console.log('SELECTED IMAGE');
                $$(event.target).toggleClass('selected');
            });
        } else if ('gal' == $$(event.target).attr('id')){
            console.log($$('article#gallery .button'));
            $$('article#gallery a.button').hide();
            $$('#gal').addClass('current');
            $$('#edit').removeClass('current');
            $$('article#gallery img').on('doubleTap', fullScreen);
            $$('article#gallery img').off('tap');
            $$('article#gallery img').removeClass('selected');
        }
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
        $$('article#gallery .button').hide();
        loadImgs();
    },
    'tap article#gallery a#delete':function(event){
        $$('article#gallery img.selected').each(deleteSelected);
    },
    'tap article#gallery a#share':function(event){
        console.log('\nSHARE');
        var selected = $$('article#gallery img.selected').length;
        console.log('number of selected -->' + selected);
        Lungo.Router.section('send');
    },
    'tap section#send a.notif':function(event){
           Lungo.Notification.html('<h1>Lo sentimos</h1><p>El equipo de mLocker lamenta mucho no poder \
ofrecer esta funcionalidad en esta versión de la aplicación. No se preocupe, estará disponible con la mayor \
brevedad posible.</p><p>Para sugerencias puede contactar con nostros desde la sección de información.</p>', "Close");
    }
});
    
function fullScreen(event){
    console.log('DOUBLE TAP FOR FULL SCREEN');
    
}
            
function deleteSelected(index, element){
    console.log('Element id --> ' + element.id);
    var del = element.id.slice(6, element.id.lenght);
    console.log('Whant delete: ' + del);
    deletefromDB(del);
    $$('#'+element.id).remove();
    
}
                  
                  
                  
                  
                  