<?php
/**
 * Plugin Name: Cotizador de Interiores
 * Plugin URI: https://diosespelado.com
 * Description: Cotizador interactivo para diseño de interiores con panel de administración
 * Version: 0.1
 * Author: Vidala Tech
 * License: GPL v2 or later
 * Text Domain: cotizador-interiores
 */

if (!defined('ABSPATH')) exit;

// Definir constantes
define('COTIZADOR_VERSION', '1.0.0');
define('COTIZADOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('COTIZADOR_PLUGIN_URL', plugin_dir_url(__FILE__));

// Incluir archivos necesarios
require_once COTIZADOR_PLUGIN_DIR . 'includes/class-cotizador-api.php';
require_once COTIZADOR_PLUGIN_DIR . 'admin/class-cotizador-admin.php';

class Cotizador_Interiores {
    
    public function __construct() {
        // Hooks de activación/desactivación
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Inicializar componentes
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('cotizador_interiores', array($this, 'render_shortcode'));
    }
    
    public function activate() {
        // Crear opciones por defecto
        $default_ambientes = array(
            'living' => array(
                'nombre' => 'Living',
                'precio' => 150,
                'color' => 'blue'
            ),
            'comedor' => array(
                'nombre' => 'Comedor',
                'precio' => 140,
                'color' => 'green'
            ),
            'cocina' => array(
                'nombre' => 'Cocina',
                'precio' => 200,
                'color' => 'orange'
            ),
            'dormitorio' => array(
                'nombre' => 'Dormitorio',
                'precio' => 130,
                'color' => 'purple'
            ),
            'bano' => array(
                'nombre' => 'Baño',
                'precio' => 250,
                'color' => 'teal'
            )
        );

        $default_interiorismo = array(
            'living' => array(
                'nombre' => 'Living',
                'precio' => 1500,
                'color' => 'blue'
            ),
            'comedor' => array(
                'nombre' => 'Comedor',
                'precio' => 2400,
                'color' => 'green'
            ),
            'cocina' => array(
                'nombre' => 'Cocina',
                'precio' => 2500,
                'color' => 'orange'
            ),
            'dormitorio' => array(
                'nombre' => 'Dormitorio',
                'precio' => 1300,
                'color' => 'purple'
            ),
            'bano' => array(
                'nombre' => 'Baño',
                'precio' => 200,
                'color' => 'teal'
            )
        );
        
        if (!get_option('cotizador_ambientes')) {
            add_option('cotizador_ambientes', $default_ambientes);
        }

        if (!get_option('cotizador_interiorismo')) {
            add_option('cotizador_interiorismo', $default_interiorismo);
        }
        
        if (!get_option('cotizador_config')) {
            add_option('cotizador_config', array(
                'titulo' => 'Jessica Waisman Design - Cotizador de Interiores',
                'subtitulo' => 'Este es un presupuesto aproximado. El precio final puede variar según las características específicas del inmueble y requerimientos adicionales'
            ));
        }
        
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        flush_rewrite_rules();
    }
    
    public function init() {
        new Cotizador_API();
        
        if (is_admin()) {
            new Cotizador_Admin();
        }
    }
    
    public function enqueue_scripts() {
        // Cargar React y ReactDOM desde CDN
        wp_enqueue_script(
            'react',
            'https://unpkg.com/react@18/umd/react.production.min.js',
            array(),
            '18',
            true
        );
        
        wp_enqueue_script(
            'react-dom',
            'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
            array('react'),
            '18',
            true
        );
        
        // Cargar jsPDF
        wp_enqueue_script(
            'jspdf',
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            array(),
            '2.5.1',
            true
        );

        wp_enqueue_style(
            'cotizador-tailwind-css',
            COTIZADOR_PLUGIN_URL . 'build/cotizador.css', // ← Tu Tailwind compilado
            array(),
            COTIZADOR_VERSION
        );
        
        // Cargar nuestro componente React compilado
        wp_enqueue_script(
            'cotizador-app',
            COTIZADOR_PLUGIN_URL . 'build/cotizador.js',
            array('react', 'react-dom', 'jspdf'),
            COTIZADOR_VERSION,
            true
        );
        
        // Pasar datos al JavaScript
        wp_localize_script('cotizador-app', 'cotizadorData', array(
            'apiUrl' => rest_url('cotizador/v1/'),
            'nonce' => wp_create_nonce('wp_rest')
        ));
        
        // // Cargar Tailwind CSS
        // wp_enqueue_style(
        //     'tailwind-css',
        //     'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
        //     array(),
        //     '2.2.19'
        // );
        
        // Estilos personalizados
        wp_enqueue_style(
            'cotizador-styles',
            COTIZADOR_PLUGIN_URL . 'public/css/cotizador.css',
            array(),
            COTIZADOR_VERSION
        );
    }
    
    public function render_shortcode($atts) {
        return '<div id="cotizador-root"></div>';
    }
}

// Inicializar el plugin
new Cotizador_Interiores();