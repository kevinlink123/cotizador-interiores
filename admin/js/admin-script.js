// admin/js/admin-script.js
jQuery(document).ready(function($) {
    
    // ========================================
    // TABS FUNCTIONALITY
    // ========================================
    $('.nav-tab').on('click', function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        
        $('.nav-tab').removeClass('nav-tab-active');
        $(this).addClass('nav-tab-active');
        
        $('.tab-content').removeClass('active');
        $(target).addClass('active');
    });
    
    // ========================================
    // GUARDAR CONFIGURACIÓN GENERAL
    // ========================================
    $('#config-form').on('submit', function(e) {
        e.preventDefault();
        
        var $button = $('#save-config');
        var buttonText = $button.text();
        
        $button.prop('disabled', true).text('Guardando...');
        
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
                showNotice('Configuración guardada correctamente', 'success');
                $button.prop('disabled', false).text(buttonText);
            },
            error: function() {
                showNotice('Error al guardar la configuración', 'error');
                $button.prop('disabled', false).text(buttonText);
            }
        });
    });
    
    // ========================================
    // GUARDAR AMBIENTES
    // ========================================
    $('#ambientes-form').on('submit', function(e) {
        e.preventDefault();
        
        var $button = $('#save-ambientes');
        var buttonText = $button.text();
        
        $button.prop('disabled', true).text('Guardando...');
        
        var ambientes = {};
        
        // Recopilar datos de ambientes
        $('input[name^="ambientes"]').each(function() {
            var name = $(this).attr('name');
            var matches = name.match(/ambientes\[(.+?)\]\[(.+?)\]/);
            if (matches) {
                var tipo = matches[1];
                var campo = matches[2];
                
                if (!ambientes[tipo]) {
                    ambientes[tipo] = {};
                }
                
                if (campo === 'precio') {
                    ambientes[tipo][campo] = parseFloat($(this).val()) || 0;
                } else {
                    ambientes[tipo][campo] = $(this).val();
                }
            }
        });
        
        // Recopilar selects de color
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
                showNotice('Ambientes actualizados correctamente', 'success');
                $button.prop('disabled', false).text(buttonText);
                updateAmbientesCount();
            },
            error: function() {
                showNotice('Error al actualizar los ambientes', 'error');
                $button.prop('disabled', false).text(buttonText);
            }
        });
    });
    
    // ========================================
    // MODAL: AGREGAR AMBIENTE
    // ========================================
    $('#add-ambiente-btn').on('click', function() {
        $('#add-ambiente-modal').fadeIn(200);
        $('#new-ambiente-key').focus();
    });
    
    $('#cancel-add-ambiente, .cotizador-modal-close').on('click', function() {
        closeAddAmbienteModal();
    });
    
    // Cerrar modal al hacer clic fuera
    $('#add-ambiente-modal').on('click', function(e) {
        if ($(e.target).is('#add-ambiente-modal')) {
            closeAddAmbienteModal();
        }
    });
    
    function closeAddAmbienteModal() {
        $('#add-ambiente-modal').fadeOut(200);
        $('#add-ambiente-form')[0].reset();
    }
    
    // Validar ID del ambiente (solo letras, números y guiones bajos)
    $('#new-ambiente-key').on('input', function() {
        var value = $(this).val();
        var sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        $(this).val(sanitized);
    });
    
    // ========================================
    // GUARDAR NUEVO AMBIENTE
    // ========================================
    $('#save-new-ambiente').on('click', function() {
        var $form = $('#add-ambiente-form');
        
        // Validar formulario HTML5
        if (!$form[0].checkValidity()) {
            $form[0].reportValidity();
            return;
        }
        
        var key = $('#new-ambiente-key').val().trim();
        var nombre = $('#new-ambiente-nombre').val().trim();
        var precio = parseFloat($('#new-ambiente-precio').val());
        var color = $('#new-ambiente-color').val();
        
        // Validaciones adicionales
        if (!key || !nombre || isNaN(precio)) {
            showNotice('Por favor completa todos los campos', 'error');
            return;
        }
        
        // Verificar que el ID no exista
        if ($('tr[data-ambiente-key="' + key + '"]').length > 0) {
            showNotice('Ya existe un ambiente con ese ID. Usa uno diferente.', 'error');
            $('#new-ambiente-key').focus();
            return;
        }
        
        var $button = $(this);
        var buttonText = $button.text();
        $button.prop('disabled', true).text('Agregando...');
        
        // Obtener ambientes actuales
        $.ajax({
            url: cotizadorAdmin.apiUrl + 'ambientes',
            method: 'GET',
            success: function(ambientes) {
                // Agregar nuevo ambiente
                ambientes[key] = {
                    nombre: nombre,
                    precio: precio,
                    color: color
                };
                
                // Guardar
                $.ajax({
                    url: cotizadorAdmin.apiUrl + 'ambientes',
                    method: 'POST',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('X-WP-Nonce', cotizadorAdmin.nonce);
                    },
                    data: JSON.stringify(ambientes),
                    contentType: 'application/json',
                    success: function(response) {
                        showNotice('Ambiente agregado correctamente', 'success');
                        addAmbienteToTable(key, nombre, precio, color);
                        closeAddAmbienteModal();
                        $button.prop('disabled', false).text(buttonText);
                        updateAmbientesCount();
                    },
                    error: function() {
                        showNotice('Error al agregar el ambiente', 'error');
                        $button.prop('disabled', false).text(buttonText);
                    }
                });
            },
            error: function() {
                showNotice('Error al cargar los ambientes', 'error');
                $button.prop('disabled', false).text(buttonText);
            }
        });
    });
    
    // ========================================
    // AGREGAR AMBIENTE A LA TABLA
    // ========================================
    function addAmbienteToTable(key, nombre, precio, color) {
        var coloresOptions = {
            'blue': 'Azul',
            'green': 'Verde',
            'orange': 'Naranja',
            'purple': 'Púrpura',
            'teal': 'Turquesa',
            'red': 'Rojo',
            'pink': 'Rosa',
            'yellow': 'Amarillo',
            'indigo': 'Índigo',
            'cyan': 'Cian'
        };
        
        var colorOptionsHtml = '';
        for (var colorValue in coloresOptions) {
            var selected = colorValue === color ? 'selected' : '';
            colorOptionsHtml += '<option value="' + colorValue + '" ' + selected + '>' + coloresOptions[colorValue] + '</option>';
        }
        
        var newRow = $('<tr data-ambiente-key="' + key + '">');
        newRow.html(
            '<td><strong>' + escapeHtml(key) + '</strong></td>' +
            '<td><input type="text" name="ambientes[' + key + '][nombre]" value="' + escapeHtml(nombre) + '" class="regular-text" required></td>' +
            '<td><input type="number" name="ambientes[' + key + '][precio]" value="' + precio + '" step="0.01" min="0" class="small-text" required> <span class="description">ARS</span></td>' +
            '<td><select name="ambientes[' + key + '][color]">' + colorOptionsHtml + '</select></td>' +
            '<td><button type="button" class="button button-small delete-ambiente-btn" data-ambiente-key="' + key + '"><span class="dashicons dashicons-trash"></span> Eliminar</button></td>'
        );
        
        $('#ambientes-list').append(newRow);
        
        // Animar la nueva fila
        newRow.hide().fadeIn(300);
    }
    
    // ========================================
    // ELIMINAR AMBIENTE
    // ========================================
    $(document).on('click', '.delete-ambiente-btn', function() {
        var key = $(this).data('ambiente-key');
        var $row = $(this).closest('tr');
        var nombre = $row.find('input[name*="nombre"]').val();
        
        if (!confirm(cotizadorAdmin.confirmDelete)) {
            return;
        }
        
        var $button = $(this);
        $button.prop('disabled', true);
        
        // Obtener ambientes actuales
        $.ajax({
            url: cotizadorAdmin.apiUrl + 'ambientes',
            method: 'GET',
            success: function(ambientes) {
                // Eliminar el ambiente
                delete ambientes[key];
                
                // Guardar
                $.ajax({
                    url: cotizadorAdmin.apiUrl + 'ambientes',
                    method: 'POST',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('X-WP-Nonce', cotizadorAdmin.nonce);
                    },
                    data: JSON.stringify(ambientes),
                    contentType: 'application/json',
                    success: function(response) {
                        showNotice('Ambiente "' + nombre + '" eliminado correctamente', 'success');
                        $row.fadeOut(300, function() {
                            $(this).remove();
                            updateAmbientesCount();
                        });
                    },
                    error: function() {
                        showNotice('Error al eliminar el ambiente', 'error');
                        $button.prop('disabled', false);
                    }
                });
            },
            error: function() {
                showNotice('Error al cargar los ambientes', 'error');
                $button.prop('disabled', false);
            }
        });
    });
    
    // ========================================
    // COPIAR SHORTCODE
    // ========================================
    $('.copy-shortcode').on('click', function() {
        var shortcode = '[cotizador_interiores]';
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shortcode).then(function() {
                showNotice('Shortcode copiado al portapapeles', 'success');
            });
        } else {
            // Fallback para navegadores antiguos
            var $temp = $('<input>');
            $('body').append($temp);
            $temp.val(shortcode).select();
            document.execCommand('copy');
            $temp.remove();
            showNotice('Shortcode copiado al portapapeles', 'success');
        }
    });
    
    // ========================================
    // FUNCIONES AUXILIARES
    // ========================================
    function showNotice(message, type) {
        type = type || 'info';
        
        var noticeClass = 'notice notice-' + type + ' is-dismissible';
        var $notice = $('<div class="' + noticeClass + '"><p>' + escapeHtml(message) + '</p></div>');
        
        $('.cotizador-admin-wrap h1').after($notice);
        
        // Auto-dismiss después de 5 segundos
        setTimeout(function() {
            $notice.fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
        
        // Scroll al notice
        $('html, body').animate({
            scrollTop: $('.cotizador-admin-wrap h1').offset().top - 50
        }, 300);
    }
    
    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    function updateAmbientesCount() {
        var count = $('#ambientes-list tr').length;
        $('.ambientes-count strong').text(count);
    }
});