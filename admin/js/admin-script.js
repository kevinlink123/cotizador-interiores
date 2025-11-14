jQuery(document).ready(function($) {
    
  // Tabs functionality
  $('.nav-tab').on('click', function(e) {
      e.preventDefault();
      var target = $(this).attr('href');
      
      $('.nav-tab').removeClass('nav-tab-active');
      $(this).addClass('nav-tab-active');
      
      $('.tab-content').removeClass('active');
      $(target).addClass('active');
  });
  
  // Guardar configuración general
  $('#config-form').on('submit', function(e) {
      e.preventDefault();
      
      var data = {
          titulo: $('#titulo').val(),
          subtitulo: $('#subtitulo').val()
      };
      
      $.ajax({
          url: cotizadorAdmin.apiUrl + 'config',
          method: 'POST',
          beforeSend: function(xhr) {
              xhr.setRequestHeader('X-WP-Nonce', cotizadorAdmin.nonce);
          },
          data: JSON.stringify(data),
          contentType: 'application/json',
          success: function(response) {
              alert('Configuración guardada correctamente');
          },
          error: function() {
              alert('Error al guardar la configuración');
          }
      });
  });
  
  // Guardar ambientes
  $('#ambientes-form').on('submit', function(e) {
      e.preventDefault();
      
      var ambientes = {};
      $('input[name^="ambientes"]').each(function() {
          var name = $(this).attr('name');
          var matches = name.match(/ambientes\[(.+?)\]\[(.+?)\]/);
          if (matches) {
              var tipo = matches[1];
              var campo = matches[2];
              
              if (!ambientes[tipo]) {
                  ambientes[tipo] = {};
              }
              
              ambientes[tipo][campo] = $(this).val();
          }
      });
      
      $('select[name^="ambientes"]').each(function() {
          var name = $(this).attr('name');
          var matches = name.match(/ambientes\[(.+?)\]\[(.+?)\]/);
          if (matches) {
              var tipo = matches[1];
              ambientes[tipo].color = $(this).val();
          }
      });
      
      $.ajax({
          url: cotizadorAdmin.apiUrl + 'ambientes',
          method: 'POST',
          beforeSend: function(xhr) {
              xhr.setRequestHeader('X-WP-Nonce', cotizadorAdmin.nonce);
          },
          data: JSON.stringify(ambientes),
          contentType: 'application/json',
          success: function(response) {
              alert('Ambientes actualizados correctamente');
          },
          error: function() {
              alert('Error al actualizar los ambientes');
          }
      });
  });
  
  // Copiar shortcode
  $('.copy-shortcode').on('click', function() {
      var shortcode = '[cotizador_interiores]';
      navigator.clipboard.writeText(shortcode).then(function() {
          alert('Shortcode copiado al portapapeles');
      });
  });
});