import React from 'react';
import ReactDOM from 'react-dom/client';
import CotizadorInteriores from './Cotizador.jsx';
import './styles.css';

if (import.meta.env.DEV) {
  import('../dev-logo-helper.js').then(() => {
    console.log('✅ Dev Logo Helper cargado');
    console.log('💡 Tip: Ejecuta devLogoHelper.help() en la consola');
  });
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CotizadorInteriores />
  </React.StrictMode>
);