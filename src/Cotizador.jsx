import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function CotizadorInteriores() {
  const [ambientes, setAmbientes] = useState([]);
  const [nextId, setNextId] = useState(1);
  
  // Datos cargados desde WordPress
  const [preciosAmbientes, setPreciosAmbientes] = useState({});
  const [nombresAmbientes, setNombresAmbientes] = useState({});
  const [coloresAmbientes, setColoresAmbientes] = useState({});
  const [config, setConfig] = useState({
    titulo: 'Jessica Waisman Design - Cotizador de Interiores',
    subtitulo: 'Este es un presupuesto aproximado. El precio final puede variar según las características específicas del inmueble y requerimientos adicionales'
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos desde la API de WordPress
  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener la URL de la API desde las variables globales de WordPress
        const apiUrl = window.cotizadorData?.apiUrl || '/wp-json/cotizador/v1/';
        
        // Cargar ambientes
        const ambientesResponse = await fetch(apiUrl + 'ambientes');
        const ambientesData = await ambientesResponse.json();
        
        // Cargar configuración
        const configResponse = await fetch(apiUrl + 'config');
        const configData = await configResponse.json();
        
        // Procesar datos de ambientes
        const precios = {};
        const nombres = {};
        const colores = {};
        
        console.log(ambientesData);

        Object.keys(ambientesData).forEach(key => {
          precios[key] = parseFloat(ambientesData[key].precio);
          nombres[key] = ambientesData[key].nombre;
          colores[key] = ambientesData[key].color;
        });
        
        setPreciosAmbientes(precios);
        setNombresAmbientes(nombres);
        setColoresAmbientes(colores);
        setConfig(configData);
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        // Usar valores por defecto si falla la carga
        setPreciosAmbientes({
          living: 150,
          comedor: 140,
          cocina: 200,
          dormitorio: 130,
          bano: 250
        });
        setNombresAmbientes({
          living: 'Living',
          comedor: 'Comedor',
          cocina: 'Cocina',
          dormitorio: 'Dormitorio',
          bano: 'Baño'
        });
        setColoresAmbientes({
          living: 'blue',
          comedor: 'green',
          cocina: 'orange',
          dormitorio: 'purple',
          bano: 'teal'
        });
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Mapeo de colores a clases de Tailwind
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      orange: 'bg-orange-500 hover:bg-orange-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      teal: 'bg-teal-500 hover:bg-teal-600',
      red: 'bg-red-500 hover:bg-red-600'
    };
    return colorMap[color] || 'bg-gray-500 hover:bg-gray-600';
  };

  const agregarAmbiente = (tipo) => {
    const nuevoAmbiente = {
      id: nextId,
      tipo,
      ancho: '',
      largo: ''
    };
    setAmbientes([...ambientes, nuevoAmbiente]);
    setNextId(nextId + 1);
  };

  const eliminarAmbiente = (id) => {
    setAmbientes(ambientes.filter(amb => amb.id !== id));
  };

  const actualizarAmbiente = (id, campo, valor) => {
    setAmbientes(ambientes.map(amb => 
      amb.id === id ? { ...amb, [campo]: valor } : amb
    ));
  };

  const calcularMetros = (ambiente) => {
    const ancho = parseFloat(ambiente.ancho) || 0;
    const largo = parseFloat(ambiente.largo) || 0;
    return ancho * largo;
  };

  const calcularCostoAmbiente = (ambiente) => {
    const metros = calcularMetros(ambiente);
    const precioPorMetro = preciosAmbientes[ambiente.tipo] || 0;
    return metros * precioPorMetro;
  };

  const calcularTotal = () => {
    return ambientes.reduce((total, amb) => total + calcularCostoAmbiente(amb), 0);
  };

  const limpiarForm = () => {
    setAmbientes([]);
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Cotización Diseño de Interiores', 20, 20);
    
    doc.setFontSize(10);
    doc.text('Presupuesto Aproximado', 20, 28);
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    let yPos = 45;
    
    // Ambientes
    doc.setFontSize(12);
    ambientes.forEach((amb, index) => {
      const metros = calcularMetros(amb);
      const costo = calcularCostoAmbiente(amb);
      
      doc.text(`${index + 1}. ${nombresAmbientes[amb.tipo]}`, 20, yPos);
      doc.setFontSize(10);
      doc.text(`Dimensiones: ${amb.ancho || 0}m x ${amb.largo || 0}m = ${metros.toFixed(2)}m²`, 30, yPos + 5);
      doc.text(`Precio/m²: $${preciosAmbientes[amb.tipo]}`, 30, yPos + 10);
      doc.text(`Subtotal: $${costo.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 30, yPos + 15);
      
      yPos += 25;
      doc.setFontSize(12);
      
      // Nueva página si es necesario
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Total
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.setFontSize(14);
    doc.setFont('', 'bold');
    doc.text(`TOTAL APROXIMADO: $${calcularTotal().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPos);
    
    // Nota al pie
    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('', 'normal');
    doc.text('* Este es un presupuesto aproximado. El precio final puede variar según', 20, yPos);
    doc.text('las características específicas del inmueble y requerimientos adicionales.', 20, yPos + 5);
    
    // Descargar
    doc.save('cotizacion-diseno-interiores.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cotizador...</p>
        </div>
      </div>
    );
  }

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

        {/* Botones de Ambientes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Selecciona los ambientes a renovar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.keys(preciosAmbientes).map((tipo) => (
              <button
                key={tipo}
                onClick={() => agregarAmbiente(tipo)}
                className={`${getColorClasses(coloresAmbientes[tipo])} text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all transform hover:scale-105 shadow-md`}
              >
                <Plus size={24} />
                <span className="font-medium">{nombresAmbientes[tipo]}</span>
                <span className="text-xs opacity-90">${preciosAmbientes[tipo]}/m²</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Ambientes Agregados */}
        {ambientes.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Ambientes agregados
            </h2>
            <div className="space-y-4">
              {ambientes.map((ambiente, index) => (
                <div
                  key={ambiente.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-gray-100 text-gray-700 font-semibold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {nombresAmbientes[ambiente.tipo]}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ${preciosAmbientes[ambiente.tipo]}/m²
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarAmbiente(ambiente.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ancho (metros)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={ambiente.ancho}
                        onChange={(e) => actualizarAmbiente(ambiente.id, 'ancho', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Largo (metros)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={ambiente.largo}
                        onChange={(e) => actualizarAmbiente(ambiente.id, 'largo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Superficie: {calcularMetros(ambiente).toFixed(2)} m²
                      </span>
                      <span className="font-semibold text-gray-800">
                        ${calcularCostoAmbiente(ambiente).toLocaleString('es-AR', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen y Total */}
        {ambientes.length > 0 && (
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <button
              onClick={limpiarForm}
              className="absolute top-0 right-0 p-2 m-4 transition-all text-red-500 bg-gray-50 hover:text-red-700 hover:bg-gray-200 hover:scale-115 rounded-lg"
            >
              <Trash2 size={20} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Resumen del Presupuesto</h2>
              <p className="text-blue-100 text-sm">
                * Presupuesto aproximado. El precio final puede variar según características específicas.
              </p>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-800 text-sm mb-1">Total de ambientes</p>
                  <p className="text-3xl text-gray-800 font-bold">{ambientes.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 text-sm mb-1">Superficie total</p>
                  <p className="text-3xl text-gray-800 font-bold">
                    {ambientes.reduce((total, amb) => total + calcularMetros(amb), 0).toFixed(2)} m²
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 text-gray-800 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium">Total Aproximado:</span>
                <span className="text-4xl font-bold text-blue-600">
                  ${calcularTotal().toLocaleString('es-AR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={generarPDF}
              className="w-full bg-white text-blue-600 font-semibold py-4 rounded-lg hover:scale-[103%] active:scale-[96%] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Download size={24} />
              Descargar Presupuesto en PDF
            </button>
          </div>
        )}

        {/* Mensaje inicial */}
        {ambientes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Plus size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Comienza agregando ambientes
            </h3>
            <p className="text-gray-500">
              Selecciona los ambientes que deseas renovar desde los botones de arriba
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

if (typeof window !== 'undefined' && document.getElementById('cotizador-root')) {
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