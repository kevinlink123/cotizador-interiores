# Cotizador de Interiores - Plugin WordPress

## Descripción
Plugin completo para WordPress que permite mostrar un cotizador interactivo de diseño de interiores con panel de administración.

## Características
- ✅ Cotizador interactivo con React
- ✅ Panel de administración completo
- ✅ Configuración de precios por ambiente
- ✅ Generación de PDF con presupuesto
- ✅ Responsive design con Tailwind CSS
- ✅ API REST para gestión de datos

## Estructura de Archivos

```
cotizador-interiores/
├── cotizador-interiores.php          # Archivo principal del plugin
├── README.md                          # Este archivo
├── includes/
│   └── class-cotizador-api.php       # API REST endpoints
├── admin/
│   ├── class-cotizador-admin.php     # Panel de administración
│   ├── js/
│   │   └── admin-script.js           # JavaScript del admin
│   └── css/
│       └── admin-styles.css          # Estilos del admin
├── public/
│   └── css/
│       └── cotizador.css             # Estilos personalizados
├── src/
│   └── Cotizador.jsx                 # Componente React principal
```

## Compilacion

### 1. Preparar los archivos

Crea la carpeta del plugin con todos los archivos mostrados en la estructura.

### 2. Compilar el componente React

Necesitas compilar tu componente React. Tienes dos opciones:

#### Opción A: Usando comandos de npm (Recomendado)

1. Abrir una terminal y pararse en la raiz del proyecto

Aqui deberas de correr cualquier comando npm correspondiente

2. Correr los comandos

En la terminal copia y pega estos comandos (EN ORDEN) en la terminal.
```bash
npm install
npm run build
```

Esto generara un archivo "cotizador-interiores.zip" que podras cargar en wordpress desde la seccion de plugins.

#### Opción B: Build manual simple
Si prefieres, puedes usar el componente directamente sin compilar, cargando Babel en el navegador (solo para desarrollo).

### 3. Subir a WordPress

1. Ubica el zip `cotizador-interiores.zip` (se crea en la raiz del proyecto luego de compilar) 
2. Ve a WordPress Admin → Plugins
3. Subi el plugin
4. Activa "Cotizador de Interiores"

### 4. Configurar

1. Ve a "Cotizador" en el menú lateral del admin
2. Configura precios y ambientes
3. Usa el shortcode `[cotizador_interiores]` en cualquier página

## Uso

### Shortcode
```
[cotizador_interiores]
```

### En plantillas PHP
```php
<?php echo do_shortcode('[cotizador_interiores]'); ?>
```

## API REST

El plugin expone los siguientes endpoints:

- `GET /wp-json/cotizador/v1/ambientes` - Obtener datos del servicio de renovacion completa
- `GET /wp-json/cotizador/v1/interiorismo` - Obtener datos del servicio de interiorismo
- `GET /wp-json/cotizador/v1/config` - Obtener configuración
- `POST /wp-json/cotizador/v1/ambientes` - Actualizar datos del servicio de renovacion completa (admin)
- `POST /wp-json/cotizador/v1/interiorismo` - Actualizar datos del servicio de interiorismo (admin)
- `POST /wp-json/cotizador/v1/config` - Actualizar config (admin)

## Soporte

Para cualquier duda o problema, contacta al desarrollador.