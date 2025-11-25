// src/Cotizador.jsx
import React, { useState, useEffect } from 'react';

import Tabs from './Tabs.jsx';
import RenovacionCompleta from './RenovacionCompleta.jsx';

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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            {config.titulo}
          </h1>
          <p className="text-gray-600 italic">
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