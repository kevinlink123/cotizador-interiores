import { useState } from 'react';

const ModalPresupuesto = ({ isOpen, onClose, datosPresupuesto }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleWhatsAppMessage = () => {
    // Número de teléfono (incluir código de país sin el signo +)
    const numeroTelefono = "541150111130"; // Cambia por el número real
    
    // Texto del mensaje
    const mensaje = `Hola! Acabo de usar el cotizador para generar un presupuesto preliminar:
    
Numero de telefono: ${datosPresupuesto.numero || 'Sin número'}
Interesado: ${datosPresupuesto.cliente || 'No especificado'}
Presupuesto aproximado: ${datosPresupuesto.total || '$0'}
Fecha de solicitud: ${new Date().toLocaleDateString()}

¡Quedamos atento a su respuesta para seguir adelante con el proyecto!`;
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Crear URL de WhatsApp Web (funciona en desktop y mobile)
    const whatsappUrl = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="tx:fixed tx:inset-0 tx:z-50 tx:flex tx:items-center tx:justify-center">
      {/* Overlay */}
      <div 
        className="tx:fixed tx:inset-0 tx:bg-black/70 tx:bg-opacity-50 tx:transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="tx:relative tx:bg-white tx:rounded-lg tx:shadow-xl tx:max-w-md tx:w-full tx:mx-4 tx:transform tx:transition-all">
        {/* Header */}
        <div className="tx:flex tx:flex-col tx:items-center tx:justify-between tx:p-4 tx:border-b tx:border-gray-200">
          <h3 className="tx:my-2 tx:text-xl tx:font-semibold tx:text-gray-900 tx:text-center">
            Presupuesto Preliminar Generado
          </h3>
          <h4 className="tx:w-full tx:text-sm tx:italic tx:text-gray-500 tx:text-center">
            Recuerde que el presupuesto carece de carácter contractual y es de caracter orientativo
          </h4>
          <button
            onClick={onClose}
            className="tx:text-gray-400 tx:hover:text-gray-600 tx:transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="tx:p-4">
          <div className="tx:mb-4">
            <p className="tx:text-gray-600 mb-2">
              El presupuesto se ha generado correctamente.
            </p>
            <div className="tx:bg-gray-50 tx:p-3 tx:rounded-md tx:text-sm">
              <p><strong>Numero de Telefono:</strong> {datosPresupuesto.numero || 'N/A'}</p>
              <p><strong>Nombre:</strong> {datosPresupuesto.cliente || 'N/A'}</p>
              <p><strong>Total:</strong> {datosPresupuesto.total || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Footer con botones */}
        <div className="tx:flex tx:flex-col tx:sm:flex-row tx:gap-3 tx:p-4 tx:border-t tx:border-gray-200">
          
          <button
            onClick={handleWhatsAppMessage}
            className="tx:flex-1 tx:px-4 tx:py-2 tx:bg-green-600 tx:text-white tx:rounded-lg tx:hover:bg-green-700 tx:transition-colors tx:flex tx:items-center tx:justify-center tx:gap-2"
          >
            <svg className="tx:w-4 tx:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Enviar por WhatsApp
          </button>
          
          <button
            onClick={onClose}
            className="tx:px-4 tx:py-2 tx:bg-gray-200 tx:text-gray-800 tx:rounded-lg tx:hover:bg-gray-300 tx:transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPresupuesto;