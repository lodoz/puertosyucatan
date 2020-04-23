
let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = 'block';

  addBtn.addEventListener('click', (e) => {
    // hide our user interface that shows our A2HS button
    addBtn.style.display = 'none';
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
  });
});

// Progressive Enhancement
if (navigator.serviceWorker) {

    // Register SW
    navigator.serviceWorker.register('sw.js').catch(console.error);

    // Buques cache clean
    function buquesCacheClean(buques) {

        // Get service worker registration
        navigator.serviceWorker.getRegistration().then(function(reg){

            // Only post message to active SW
            if( reg.active ) reg.active.postMessage({ action: 'cleanBuquesCache', buques:buques });
        });
    }
}

// API de API para traer el json con la informacion de los buques
var buques = {
    url: 'https://www.sparp.com.mx/Accesoft/api/ProgramacionBuques',
    query: ''
};

// Actualizar la progamación de buques
function update() {

    // Toggle refresh state
   $('#update .icon').toggleClass('d-none');

    // Llamar la API de API
    $.get( buques.url, buques.query)

        // Success
        .done( function (res) {

            // Empty Element
            $('#buques').empty();

            // Populate array of latest Buques
            var ultimosBuques = [];

            //Poner la cabecera
            $('#buques').append(
              '<div class="container">'+
                  '<div class="row">'+
                      '<div class="col">'+
                          '<h2 class="h6 text-uppercase TITULO">En puerto</h2>'+
                          '<ul class="list-inline mb-4">'+
                              '<li class="list-inline-item ARRIBADO"><a href="#" onclick="Mostrar(\'ENPUERTO\')" class="active" id=\'ENPUERTO\'>Embarcaciones</a></li>'+
                              '<li class="list-inline-item ARRIBADO"><a href="#" onclick="Mostrar(\'REMOLCADOR\')" id=\'REMOLCADOR\'>Remolcadores</a></li>'+
                              '<li class="list-inline-item ARRIBADO"><a href="#" onclick="Mostrar(\'PROLONGADA\')" id=\'PROLONGADA\'>Estadía</a></li>'+
                              '<li class="list-inline-item PROGRAMADO"><a href="#" onclick="Mostrar(\'PROGRAMADO\')" id=\'PROGRAMADO\'>Programados</a></li>'+
                          '</ul>'+
                      '</div>'+
                  '</div>'+
                  '<div class="row cuadros">'
            );

            // Ciclo sobre los buques
            $.each( res, function (i, buque) {

                // Add to latest Buque
                ultimosBuques.push( buque );

                // Add Buque HTML
                if(buque.Estado == 'PROGRAMADO')
                {
                  $('#buques .cuadros').append(
                    '<div class="col-12 col-md-6 col-lg-4 col-xl-3 '+ buque.Estado + '">' +
                    '<div class="card border-0 mb-4 shadow">'+
                        '<div class="card-body">'+
                            '<p><img src="https://www.countryflags.io/'+ buque.Bandera.substring(0, 2) +'/flat/24.png" alt="'+ buque.Bandera +'" title="'+ buque.Bandera +'" loading="lazy" class="mr-2">'+ buque.Buque +'</p>'+
                            '<b>Agencia naviera:</b> '+ buque.Agencia + '<br>' +
                            '<b>Carga:</b> '+ buque.Producto + '<br>'+
                            '<b>ESL:</b> ' + buque.Eslora + '<br>'+
                            '<b>CAL:</b> ' + buque.Calado + '<br>'+
                            '<b>TON:</b> ' + buque.Tonelaje + '<br>'+
                            '<b>Posición autorizada:</b> ' + buque.PosicionAutorizada +'<br>'+
                            '<b>Procedencia:</b> ' + buque.Procedencia +'<br>'+
                            '<b>ETA:</b> ' + buque.ETA + '<br>'+
                            '<b>ETD:</b> ' + buque.ETD +
                        '</div>' +
                    '</div>' +
                    '</div>'
                );
                }
                else
                {
                  $('#buques .cuadros').append(
                    '<div class="col-12 col-md-6 col-lg-4 col-xl-3 '+ buque.Estado + '">' +
                    '<div class="card border-0 mb-4 shadow">'+
                        '<div class="card-body">'+
                            '<p><img src="https://www.countryflags.io/'+ buque.Bandera.substring(0, 2) +'/flat/24.png" alt="'+ buque.Bandera +'" title="'+ buque.Bandera +'" loading="lazy" class="mr-2">'+ buque.Buque +'</p>'+
                            '<b>Carga:</b> '+ buque.Carga + '<br>' +
                            '<b>Posición:</b> '+ buque.Posicion + '<br>'+
                            '<b>Puerto:</b> ' + buque.Puerto + '<br>'+
                            '<b>Arribo:</b> ' + buque.Arribo + '<br>'+
                            '<b>Atraque:</b> ' + buque.Atraque + '<br>'+
                            '<b>ETD:</b> ' + buque.ETD +
                        '</div>' +
                    '</div>' +
                    '</div>'
                );
              }
            });

            //Cerrar estructura html
            $('#buques').append('</div></div>');

            //Actualizar fecha
            var today = new Date();
            var meses = new Array ("enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre");
            var dd = today.getDate();
            var mm = today.getMonth()+1;
            var yyyy = today.getFullYear();
            var factualizada = dd + ' de ' + meses[Number(mm)-1] + yyyy;
            $('#fechaActualizacion').text(factualizada);

            // Inform the SW (if available) of current Buques
            if( navigator.serviceWorker ) buquesCacheClean(ultimosBuques);
        })

        // Failure
        .fail(function(){

            $('.alert').slideDown();
            setTimeout( function() { $('.alert').slideUp() }, 2000);
        })

        // Complete
        .always(function() {

            // Re-Toggle refresh state
            $('#update .icon').toggleClass('d-none');
        });

    // Prevent submission if originates from click
    return false;
}

// Manual refresh
$('#update a').click(update);

// Update buques on load
update();

$(document).ready(function(){
    $('.nav-button').click(function(){
      $('body').toggleClass('nav-open');
    });
    $('.main-menu .nav-item').on('click', function(){
      $('body').toggleClass('nav-open');
    });
    Mostrar('PRINCIPAL');
  });

  function Mostrar(estado){
    if(estado.toUpperCase() == 'PRINCIPAL')
    {
      $('#buques').hide();
      $("#portada").show();
      return;
    }

    $('#buques').show();
    $("#portada").hide();

    //submenus
    $(".ENPUERTO").hide();
    $(".REMOLCADOR").hide();
    $(".PROLONGADA").hide();
    $(".PROGRAMADO").hide();
    $(".ARRIBADO").hide();
    $("#ENPUERTO").removeClass("active");
    $("#REMOLCADOR").removeClass("active");
    $("#PROLONGADA").removeClass("active");
    $("#PROGRAMADO").removeClass("active");
    $(".TITULO").text('En puerto');

    if(estado.toUpperCase() == 'ENPUERTO')
    {
      $(".ARRIBADO").show();
      $(".ENPUERTO").show();
      $("#ENPUERTO").addClass("active");
    }
    if(estado.toUpperCase() == 'REMOLCADOR')
    {
      $(".ARRIBADO").show();
      $(".REMOLCADOR").show();
      $("#REMOLCADOR").addClass("active");
    }
    if(estado.toUpperCase() == 'PROLONGADA')
    {
      $(".ARRIBADO").show();
      $(".PROLONGADA").show();
      $("#PROLONGADA").addClass("active");
    }
    if(estado.toUpperCase() == 'PROGRAMADO')
    {
      $(".TITULO").text('Arribos');
      $(".PROGRAMADO").show();
      $("#PROGRAMADO").addClass("active");
    }
  }
