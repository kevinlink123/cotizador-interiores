<?php
if (!defined('ABSPATH')) exit;

class Cotizador_API {
    
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    public function register_routes() {
        // Endpoint para obtener configuración
        register_rest_route('cotizador/v1', '/config', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_config'),
            'permission_callback' => '__return_true'
        ));
        
        // Endpoint para obtener ambientes
        register_rest_route('cotizador/v1', '/ambientes', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_ambientes'),
            'permission_callback' => '__return_true'
        ));

        // Endpoint para obtener interiorismo
        register_rest_route('cotizador/v1', '/interiorismo', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_interiorismo'),
            'permission_callback' => '__return_true'
        ));
        
        // Endpoint para actualizar ambientes (solo admin)
        register_rest_route('cotizador/v1', '/ambientes', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_ambientes'),
            'permission_callback' => array($this, 'check_admin_permission')
        ));

        // Endpoint para actualizar interiorismo (solo admin)
        register_rest_route('cotizador/v1', '/interiorismo', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_interiorismo'),
            'permission_callback' => array($this, 'check_admin_permission')
        ));
        
        // Endpoint para actualizar configuración (solo admin)
        register_rest_route('cotizador/v1', '/config', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_config'),
            'permission_callback' => array($this, 'check_admin_permission')
        ));
    }
    
    public function get_config($request) {
        $config = get_option('cotizador_config');
        return rest_ensure_response($config);
    }

    public function get_interiorismo($request) {
        $ambientes = get_option('cotizador_interiorismo');
        return rest_ensure_response($ambientes);
    }

    public function update_interiorismo($request) {
        $ambientes = $request->get_json_params();
        update_option('cotizador_interiorismo', $ambientes);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Ambientes actualizados correctamente'
        ));
    }
    
    public function get_ambientes($request) {
        $ambientes = get_option('cotizador_ambientes');
        return rest_ensure_response($ambientes);
    }
    
    public function update_ambientes($request) {
        $ambientes = $request->get_json_params();
        update_option('cotizador_ambientes', $ambientes);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Ambientes actualizados correctamente'
        ));
    }
    
    public function update_config($request) {
        $config = $request->get_json_params();
        update_option('cotizador_config', $config);
        
        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Configuración actualizada correctamente'
        ));
    }
    
    public function check_admin_permission() {
        return current_user_can('manage_options');
    }
}