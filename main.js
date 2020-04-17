
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
    url: 'https://www.sparp.com.mx/Accesoft/api/PersonaConsulta/',
    query: {
        minutes: '3',
        ip: '1'
    }
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
            $('#arribos').empty();

            // Populate array of latest Buques
            var ultimosBuques = [];

            // Ciclo sobre los buques
            $.each( res.Elementos, function (i, buque) {

                // Add to latest Buque
                ultimosBuques.push( buque.Nombre );

                // Add Giphy HTML
                $('#arribos').prepend(
                    '<div class="col-sm-6 col-md-4 col-lg-3 p-1">' +
                    //'<h2>Nombre: <b>' + buque.Nombre + '</b></h2>' +
                    //'<p>Empresa: <b>' + buque.Empresa + '</b></p>' +
                    '<img class="w-100 img-fluid" src="https://www.sparp.com.mx/Accesoft/Imagen/ObtenerImagen/' + buque.URL_Foto + '">' +
                    '</div>'
                );
            });

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

// Update trending giphys on load
update();
