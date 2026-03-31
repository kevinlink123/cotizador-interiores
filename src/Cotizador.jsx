// src/Cotizador.jsx
import React, { useState, useEffect } from 'react';

import Tabs from './Tabs.jsx';
import RenovacionCompleta from './RenovacionCompleta.jsx';
import Interiorismo from './Interiorismo.jsx';

export default function CotizadorInteriores() {
  const [config, setConfig] = useState({
    titulo: 'Jessica Waisman Design - Cotizador de Interiores',
    subtitulo: 'Este es un presupuesto aproximado. El precio final puede variar según las características específicas del inmueble y requerimientos adicionales'
  });

  const tabs = [
    {
      label: "Renovacion Completa",
      content: <RenovacionCompleta />
    },
    {
      label: "Interiorismo + Mobiliario",
      content: <Interiorismo />
    }
  ];

  return (
    <div className="tx:min-h-screen tx:bg-gradient-to-br tx:from-gray-50 tx:to-gray-100 tx:py-12 tx:px-4">
      <div className="tx:max-w-5xl tx:mx-auto">
        {/* Header */}
        <div className="tx:text-center tx:mb-12">
          <h1 className="tx:text-4xl tx:font-bold tx:text-gray-800 tx:mb-3">
            {config.titulo}
          </h1>
          <p className="tx:text-gray-600 tx:italic">
            {config.subtitulo}
          </p>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs}/>
      </div>
    </div>
  );
}

// Renderizar con Shadow DOM
if (typeof window !== 'undefined') {
  const initCotizador = () => {
    const hostElement = document.getElementById('cotizador-root');
    
    if (!hostElement || hostElement.hasAttribute('data-cotizador-initialized')) {
      return;
    }
    
    if (!window.React || !window.ReactDOM) {
      console.error('React o ReactDOM no están cargados');
      return;
    }
    
    // Marcar como inicializado
    hostElement.setAttribute('data-cotizador-initialized', 'true');
    
    // Crear Shadow DOM
    const shadowRoot = hostElement.attachShadow({ mode: 'open' });
    
    // Crear contenedor para React
    const reactContainer = document.createElement('div');
    shadowRoot.appendChild(reactContainer);
    
    // Inyectar CSS de Tailwind en el Shadow DOM
    const styleElement = document.createElement('style');
    
    // Obtener el CSS compilado de Tailwind
    fetch(window.cotizadorData?.cssUrl || '/wp-content/plugins/cotizador-interiores/build/cotizador.css')
      .then(response => response.text())
      .then(css => {
        styleElement.textContent = css;
        shadowRoot.insertBefore(styleElement, reactContainer);
        
        // Renderizar React dentro del Shadow DOM
        const { createRoot } = window.ReactDOM;
        const root = createRoot(reactContainer);
        root.render(React.createElement(CotizadorInteriores));
      })
      .catch(error => {
        console.error('Error cargando CSS:', error);
        // Renderizar sin CSS como fallback
        const { createRoot } = window.ReactDOM;
        const root = createRoot(reactContainer);
        root.render(React.createElement(CotizadorInteriores));
      });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCotizador);
  } else {
    initCotizador();
  }
}

// OLD
// // Renderizar el componente cuando el DOM esté listo
// if (typeof window !== 'undefined') {
//   window.addEventListener('DOMContentLoaded', () => {
//     const root = document.getElementById('cotizador-root');
//     if (root && window.React && window.ReactDOM) {
//       const { createRoot } = window.ReactDOM;
//       const rootElement = createRoot(root);
//       rootElement.render(React.createElement(CotizadorInteriores));
//     }
//   });
// }