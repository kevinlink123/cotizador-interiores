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
│   ├── class-cotizador-api.php       # API REST endpoints
│   └── class-cotizador-db.php        # Gestión de base de datos
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
└── build/
    └── cotizador.js                  # React compilado (generar)
```

## Instalación

### 1. Preparar los archivos

Crea la carpeta del plugin con todos los archivos mostrados en la estructura.

### 2. Compilar el componente React

Necesitas compilar tu componente React. Tienes dos opciones:

#### Opción A: Usando Vite (Recomendado)

1. En la carpeta del plugin, crea un `package.json`:
```json
{
  "name": "cotizador-interiores",
  "version": "1.0.0",
  "scripts": {
    "build": "vite build"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0"
  },
  "dependencies": {
    "jspdf": "^2.5.1",
    "lucide-react": "^0.263.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

2. Crea `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: 'src/Cotizador.jsx',
      output: {
        entryFileNames: 'cotizador.js',
        format: 'iife',
        name: 'Cotizador'
      },
      external: ['react', 'react-dom', 'jspdf']
    }
  }
})
```

3. Ejecuta:
```bash
npm install
npm run build
```

#### Opción B: Build manual simple
Si prefieres, puedes usar el componente directamente sin compilar, cargando Babel en el navegador (solo para desarrollo).

### 3. Subir a WordPress

1. Copia la carpeta `cotizador-interiores` completa a `wp-content/plugins/`
2. Ve a WordPress Admin → Plugins
3. Activa "Cotizador de Interiores"

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

- `GET /wp-json/cotizador/v1/ambientes` - Obtener ambientes
- `GET /wp-json/cotizador/v1/config` - Obtener configuración
- `POST /wp-json/cotizador/v1/ambientes` - Actualizar ambientes (admin)
- `POST /wp-json/cotizador/v1/config` - Actualizar config (admin)

## Soporte

Para cualquier duda o problema, contacta al desarrollador.