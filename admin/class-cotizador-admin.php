<?php
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
            'nonce' => wp_create_nonce('wp_rest')
        ));
    }
    
    public function render_admin_page() {
        $ambientes = get_option('cotizador_ambientes');
        $config = get_option('cotizador_config');
        ?>
        <div class="wrap">
            <h1>Configuración del Cotizador</h1>
            
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
                                </td>
                            </tr>
                        </table>
                        
                        <?php submit_button('Guardar Configuración', 'primary', 'save-config'); ?>
                    </form>
                </div>
                
                <!-- Tab: Ambientes -->
                <div id="ambientes" class="tab-content">
                    <p>Configura los tipos de ambientes disponibles y sus precios por m²</p>
                    
                    <form id="ambientes-form" method="post">
                        <table class="wp-list-table widefat fixed striped">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Nombre</th>
                                    <th>Precio por m²</th>
                                    <th>Color</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($ambientes as $key => $ambiente): ?>
                                <tr>
                                    <td><strong><?php echo esc_html($key); ?></strong></td>
                                    <td>
                                        <input type="text" 
                                               name="ambientes[<?php echo $key; ?>][nombre]" 
                                               value="<?php echo esc_attr($ambiente['nombre']); ?>" 
                                               class="regular-text">
                                    </td>
                                    <td>
                                        <input type="number" 
                                               name="ambientes[<?php echo $key; ?>][precio]" 
                                               value="<?php echo esc_attr($ambiente['precio']); ?>" 
                                               step="0.01" 
                                               min="0" 
                                               class="small-text">
                                        <span class="description">ARS</span>
                                    </td>
                                    <td>
                                        <select name="ambientes[<?php echo $key; ?>][color]">
                                            <option value="blue" <?php selected($ambiente['color'], 'blue'); ?>>Azul</option>
                                            <option value="green" <?php selected($ambiente['color'], 'green'); ?>>Verde</option>
                                            <option value="orange" <?php selected($ambiente['color'], 'orange'); ?>>Naranja</option>
                                            <option value="purple" <?php selected($ambiente['color'], 'purple'); ?>>Púrpura</option>
                                            <option value="teal" <?php selected($ambiente['color'], 'teal'); ?>>Turquesa</option>
                                            <option value="red" <?php selected($ambiente['color'], 'red'); ?>>Rojo</option>
                                        </select>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                        
                        <?php submit_button('Guardar Ambientes', 'primary', 'save-ambientes'); ?>
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