<?php
// admin/class-cotizador-admin.php
if (!defined('ABSPATH')) exit;

class Cotizador_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Cotizador de Interiores',
            'Cotizador',
            'manage_options',
            'cotizador-interiores',
            array($this, 'render_admin_page'),
            'dashicons-calculator',
            30
        );
    }
    
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'toplevel_page_cotizador-interiores') {
            return;
        }
        
        // Cargar media uploader de WordPress
        wp_enqueue_media();
        
        wp_enqueue_style(
            'cotizador-admin-css',
            COTIZADOR_PLUGIN_URL . 'admin/css/admin-styles.css',
            array(),
            COTIZADOR_VERSION
        );
        
        wp_enqueue_script(
            'cotizador-admin-js',
            COTIZADOR_PLUGIN_URL . 'admin/js/admin-script.js',
            array('jquery'),
            COTIZADOR_VERSION,
            true
        );
        
        wp_localize_script('cotizador-admin-js', 'cotizadorAdmin', array(
            'apiUrl' => rest_url('cotizador/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'confirmDelete' => __('¿Estás seguro de que deseas eliminar este ambiente? Esta acción no se puede deshacer.', 'cotizador-interiores'),
            'confirmDeleteUsed' => __('⚠️ Este ambiente podría estar en uso. ¿Deseas eliminarlo de todas formas?', 'cotizador-interiores')
        ));
    }
    
    public function render_admin_page() {
        $ambientes = get_option('cotizador_ambientes');
        $ambientes_interiorismo = get_option('cotizador_interiorismo');
        $config = get_option('cotizador_config');
        
        // Colores disponibles para selección
        $colores_disponibles = array(
            'blue' => 'Azul',
            'green' => 'Verde',
            'orange' => 'Naranja',
            'purple' => 'Púrpura',
            'teal' => 'Turquesa',
            'red' => 'Rojo',
            'white' => 'Blanco',
            'lightgray' => 'Gris Claro',
            'gray' => 'Gris',
            'darkgray' => 'Gris Oscuro',
            'black' => 'Negro',
        );
        ?>
        <div class="wrap cotizador-admin-wrap">
            <h1>
                <span class="dashicons dashicons-calculator"></span>
                Configuración del Cotizador
            </h1>
            
            <div class="cotizador-admin-container">
                <!-- Tabs -->
                <h2 class="nav-tab-wrapper">
                    <a href="#config" class="nav-tab nav-tab-active">Configuración General</a>
                    <a href="#ambientes" class="nav-tab">Ambientes y Precios</a>
                    <a href="#shortcode" class="nav-tab">Uso del Shortcode</a>
                </h2>
                
                <!-- Tab: Configuración General -->
                <div id="config" class="tab-content active">
                    <form id="config-form" method="post">
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="titulo">Título Principal</label>
                                </th>
                                <td>
                                    <input type="text" 
                                           id="titulo" 
                                           name="titulo" 
                                           value="<?php echo esc_attr($config['titulo']); ?>" 
                                           class="regular-text">
                                    <p class="description">El título que aparecerá en el cotizador</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="subtitulo">Subtítulo / Disclaimer</label>
                                </th>
                                <td>
                                    <textarea id="subtitulo" 
                                              name="subtitulo" 
                                              rows="3" 
                                              class="large-text"><?php echo esc_textarea($config['subtitulo']); ?></textarea>
                                    <p class="description">Mensaje o disclaimer que aparece debajo del título</p>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="logo">Logo para PDF</label>
                                </th>
                                <td>
                                    <div class="logo-upload-container">
                                        <?php 
                                        $logo_url = isset($config['logo_url']) ? $config['logo_url'] : '';
                                        if ($logo_url): 
                                        ?>
                                            <div class="logo-preview">
                                                <img src="<?php echo esc_url($logo_url); ?>" alt="Logo" id="logo-preview-img">
                                                <button type="button" class="button button-small" id="remove-logo">
                                                    <span class="dashicons dashicons-trash"></span>
                                                    Eliminar
                                                </button>
                                            </div>
                                        <?php endif; ?>
                                        
                                        <button type="button" class="button" id="upload-logo-btn">
                                            <span class="dashicons dashicons-upload"></span>
                                            <?php echo $logo_url ? 'Cambiar Logo' : 'Subir Logo'; ?>
                                        </button>
                                        <input type="hidden" id="logo-url" name="logo_url" value="<?php echo esc_attr($logo_url); ?>">
                                        
                                        <p class="description">
                                            Logo que aparecerá en la esquina superior derecha del PDF.
                                            <br>Recomendado: PNG o JPG, máximo 500KB, fondo transparente preferible.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        
                        <?php submit_button('Guardar Configuración', 'primary', 'save-config'); ?>
                    </form>
                </div>
                
                <!-- Tab: Ambientes -->
                <div id="ambientes" class="tab-content">
                    <div class="ambientes-header">
                        <p>Configura los tipos de ambientes disponibles y sus precios por m²</p>
                        <button type="button" class="button button-primary" id="add-ambiente-btn">
                            <span class="dashicons dashicons-plus-alt"></span>
                            Agregar Nuevo Ambiente
                        </button>
                    </div>
                    
                    <!-- Modal para agregar ambiente -->
                    <div id="add-ambiente-modal" class="cotizador-modal" style="display: none;">
                        <div class="cotizador-modal-content">
                            <div class="cotizador-modal-header">
                                <h2>Agregar Nuevo Ambiente</h2>
                                <button type="button" class="cotizador-modal-close">&times;</button>
                            </div>
                            <div class="cotizador-modal-body">
                                <form id="add-ambiente-form">
                                    <table class="form-table">
                                        <tr>
                                            <th scope="row">
                                                <label for="new-ambiente-key">ID del Ambiente *</label>
                                            </th>
                                            <td>
                                                <input type="text" 
                                                       id="new-ambiente-key" 
                                                       name="key" 
                                                       class="regular-text"
                                                       placeholder="ej: oficina"
                                                       required>
                                                <p class="description">
                                                    Solo letras minúsculas, números y guiones bajos. Sin espacios.
                                                    <br>Ejemplo: oficina, sala_estar, cocina_comedor
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th scope="row">
                                                <label for="new-ambiente-nombre">Nombre *</label>
                                            </th>
                                            <td>
                                                <input type="text" 
                                                       id="new-ambiente-nombre" 
                                                       name="nombre" 
                                                       class="regular-text"
                                                       placeholder="ej: Oficina"
                                                       required>
                                                <p class="description">Nombre que verán los usuarios</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th scope="row">
                                                <label for="new-ambiente-precio">Precio por m² *</label>
                                            </th>
                                            <td>
                                                <input type="number" 
                                                       id="new-ambiente-precio" 
                                                       name="precio" 
                                                       class="regular-text"
                                                       step="0.01"
                                                       min="0"
                                                       placeholder="ej: 150"
                                                       required>
                                                <span class="description">ARS</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th scope="row">
                                                <label for="new-ambiente-color">Color *</label>
                                            </th>
                                            <td>
                                                <select id="new-ambiente-color" name="color" required>
                                                    <?php foreach ($colores_disponibles as $value => $label): ?>
                                                        <option value="<?php echo esc_attr($value); ?>">
                                                            <?php echo esc_html($label); ?>
                                                        </option>
                                                    <?php endforeach; ?>
                                                </select>
                                                <p class="description">Color del botón en el cotizador</p>
                                            </td>
                                        </tr>
                                    </table>
                                </form>
                            </div>
                            <div class="cotizador-modal-footer">
                                <button type="button" class="button" id="cancel-add-ambiente">Cancelar</button>
                                <button type="button" class="button button-primary" id="save-new-ambiente">
                                    Agregar Ambiente
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <form id="ambientes-form" method="post">
                        <div class="ambientes-notice">
                            <span class="dashicons dashicons-info"></span>
                            Los cambios se guardan automáticamente al hacer clic en "Guardar Ambientes"
                        </div>
                        
                        <table class="wp-list-table widefat fixed striped ambientes-table">
                            <thead>
                                <tr>
                                    <th style="width: 15%;">ID</th>
                                    <th style="width: 25%;">Nombre</th>
                                    <th style="width: 20%;">Precio por m²</th>
                                    <th style="width: 20%;">Color</th>
                                    <th style="width: 20%;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="ambientes-list">
                                <?php foreach ($ambientes as $key => $ambiente): ?>
                                <tr data-ambiente-key="<?php echo esc_attr($key); ?>">
                                    <td>
                                        <strong><?php echo esc_html($key); ?></strong>
                                    </td>
                                    <td>
                                        <input type="text" 
                                               name="ambientes[<?php echo esc_attr($key); ?>][nombre]" 
                                               value="<?php echo esc_attr($ambiente['nombre']); ?>" 
                                               class="regular-text"
                                               required>
                                    </td>
                                    <td>
                                        <input type="number" 
                                               name="ambientes[<?php echo esc_attr($key); ?>][precio]" 
                                               value="<?php echo esc_attr($ambiente['precio']); ?>" 
                                               step="0.01" 
                                               min="0" 
                                               class="small-text"
                                               required>
                                        <span class="description">ARS</span>
                                    </td>
                                    <td>
                                        <select name="ambientes[<?php echo esc_attr($key); ?>][color]">
                                            <?php foreach ($colores_disponibles as $value => $label): ?>
                                                <option value="<?php echo esc_attr($value); ?>" 
                                                        <?php selected($ambiente['color'], $value); ?>>
                                                    <?php echo esc_html($label); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </td>
                                    <td>
                                        <button type="button" 
                                                class="button button-small delete-ambiente-btn" 
                                                data-ambiente-key="<?php echo esc_attr($key); ?>">
                                            <span class="dashicons dashicons-trash"></span>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                        
                        <p class="ambientes-count">
                            Total de ambientes: <strong><?php echo count($ambientes); ?></strong>
                        </p>
                        
                        <?php submit_button('Guardar Ambientes', 'primary large', 'save-ambientes'); ?>
                    </form>
                </div>
                
                <!-- Tab: Shortcode -->
                <div id="shortcode" class="tab-content">
                    <div class="postbox">
                        <div class="inside">
                            <h3>Cómo usar el cotizador</h3>
                            <p>Para mostrar el cotizador en cualquier página o entrada, simplemente copia y pega este shortcode:</p>
                            <div class="shortcode-box">
                                <code>[cotizador_interiores]</code>
                                <button class="button button-small copy-shortcode">Copiar</button>
                            </div>
                            <hr>
                            <h4>Instrucciones:</h4>
                            <ol>
                                <li>Edita la página donde quieres mostrar el cotizador</li>
                                <li>Agrega un bloque de "Shortcode"</li>
                                <li>Pega el código: <code>[cotizador_interiores]</code></li>
                                <li>Publica o actualiza la página</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}