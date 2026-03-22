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

// Renderizar el componente cuando el DOM esté listo
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('cotizador-root');
    if (root && window.React && window.ReactDOM) {
      const { createRoot } = window.ReactDOM;
      const rootElement = createRoot(root);
      rootElement.render(React.createElement(CotizadorInteriores));
    }
  });
}

// VIEJARDO
// Renderizar el componente cuando el DOM esté listo
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