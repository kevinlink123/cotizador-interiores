// dev-logo-helper.js
// Script auxiliar para facilitar el testing del logo

/**
 * Este script te ayuda a:
 * 1. Generar un logo de prueba
 * 2. Usar logos de ejemplo
 * 3. Testing rápido del PDF
 */

// ============================================
// OPCIÓN 1: Usar un logo de ejemplo de internet
// ============================================
// Puedes pegar estas URLs en el localStorage manualmente
// Abre la consola del navegador y ejecuta:

const logosDeEjemplo = {
  placeholder: 'https://via.placeholder.com/400x150/2271b1/ffffff?text=Tu+Logo',
  
  // Otros ejemplos que puedes usar (asegúrate que permitan CORS)
  example1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/272px-Google_2015_logo.svg.png',
  example2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png'
};

// Para usar un logo de ejemplo, ejecuta esto en la consola del navegador:
// localStorage.setItem('dev_logo_url', 'URL_DEL_LOGO_AQUI');
// location.reload();

console.log('📦 Logos de ejemplo disponibles:', logosDeEjemplo);
console.log('\n💡 Para usar uno, ejecuta en consola:');
console.log('localStorage.setItem("dev_logo_url", "URL_DEL_LOGO");');
console.log('location.reload();');

// ============================================
// OPCIÓN 2: Generar un logo SVG simple
// ============================================
function generarLogoSVG(texto = 'LOGO', color = '#2271b1') {
  const svg = `
    <svg width="400" height="150" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="150" fill="${color}"/>
      <text x="50%" y="50%" 
            font-family="Arial, sans-serif" 
            font-size="48" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle" 
            dominant-baseline="middle">
        ${texto}
      </text>
    </svg>
  `;
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

// ============================================
// OPCIÓN 3: Crear logo canvas simple
// ============================================
function generarLogoCanvas(texto = 'MI LOGO', width = 400, height = 150) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  
  // Fondo
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#2271b1');
  gradient.addColorStop(1, '#135e96');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Texto
  ctx.fillStyle = 'white';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texto, width / 2, height / 2);
  
  return canvas.toDataURL('image/png');
}

// ============================================
// FUNCIONES AUXILIARES PARA LA CONSOLA
// ============================================
window.devLogoHelper = {
  // Establecer logo de ejemplo
  setExampleLogo: function(key = 'placeholder') {
    const url = logosDeEjemplo[key];
    if (!url) {
      console.error('❌ Logo no encontrado. Opciones:', Object.keys(logosDeEjemplo));
      return;
    }
    localStorage.setItem('dev_logo_url', url);
    console.log('✅ Logo establecido:', url);
    console.log('🔄 Recargando página...');
    setTimeout(() => location.reload(), 1000);
  },
  
  // Generar logo SVG personalizado
  setCustomSVG: function(texto = 'LOGO', color = '#2271b1') {
    const logoUrl = generarLogoSVG(texto, color);
    localStorage.setItem('dev_logo_url', logoUrl);
    console.log('✅ Logo SVG generado');
    console.log('🔄 Recargando página...');
    setTimeout(() => location.reload(), 1000);
  },
  
  // Generar logo canvas personalizado
  setCustomCanvas: function(texto = 'MI LOGO') {
    const logoUrl = generarLogoCanvas(texto);
    localStorage.setItem('dev_logo_url', logoUrl);
    console.log('✅ Logo Canvas generado');
    console.log('🔄 Recargando página...');
    setTimeout(() => location.reload(), 1000);
  },
  
  // Limpiar logo
  clearLogo: function() {
    localStorage.removeItem('dev_logo_url');
    console.log('✅ Logo eliminado');
    console.log('🔄 Recargando página...');
    setTimeout(() => location.reload(), 1000);
  },
  
  // Ver logo actual
  getCurrentLogo: function() {
    const logo = localStorage.getItem('dev_logo_url');
    if (logo) {
      console.log('📷 Logo actual:', logo.substring(0, 100) + '...');
      return logo;
    } else {
      console.log('❌ No hay logo configurado');
      return null;
    }
  },
  
  // Ayuda
  help: function() {
    console.log(`
╔════════════════════════════════════════╗
║   🎨 DEV LOGO HELPER - AYUDA          ║
╚════════════════════════════════════════╝

Funciones disponibles:

1️⃣  devLogoHelper.setExampleLogo('placeholder')
    └─ Usa un logo de ejemplo predefinido

2️⃣  devLogoHelper.setCustomSVG('TU TEXTO', '#color')
    └─ Genera un logo SVG personalizado

3️⃣  devLogoHelper.setCustomCanvas('TU LOGO')
    └─ Genera un logo con Canvas

4️⃣  devLogoHelper.clearLogo()
    └─ Elimina el logo actual

5️⃣  devLogoHelper.getCurrentLogo()
    └─ Muestra el logo actual

6️⃣  devLogoHelper.help()
    └─ Muestra esta ayuda

═══════════════════════════════════════

📝 EJEMPLOS DE USO:

// Logo de ejemplo simple
devLogoHelper.setExampleLogo('placeholder');

// Logo SVG personalizado
devLogoHelper.setCustomSVG('JESSICA WAISMAN', '#9333ea');

// Logo Canvas personalizado
devLogoHelper.setCustomCanvas('JW DESIGN');

// Limpiar logo
devLogoHelper.clearLogo();

═══════════════════════════════════════
    `);
  }
};

// Mostrar ayuda automáticamente
console.log('🎨 Dev Logo Helper cargado!');
console.log('📖 Ejecuta: devLogoHelper.help() para ver todas las opciones');

// ============================================
// EXPORTAR PARA USO EN MÓDULOS
// ============================================
export default window.devLogoHelper;