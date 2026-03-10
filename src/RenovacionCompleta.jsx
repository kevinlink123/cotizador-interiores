import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function RenovacionCompleta() {
  const [ambientes, setAmbientes] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [selectedTier, setSelectedTier] = useState('estandar');

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  
  // Datos cargados desde WordPress
  const [preciosAmbientes, setPreciosAmbientes] = useState({});
  const [nombresAmbientes, setNombresAmbientes] = useState({});
  const [coloresAmbientes, setColoresAmbientes] = useState({});
  const [config, setConfig] = useState({
    titulo: 'Jessica Waisman Design - Cotizador de Interiores',
    subtitulo: 'Este es un presupuesto aproximado. El precio final puede variar según las características específicas del inmueble y requerimientos adicionales'
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  // Constantes
  const TIER_MULTIPLIERS = {
    basico: 0.85,
    estandar: 1.0,
    premium: 1.35
  };

  const TIER_NAMES = {
    basico: 'Básico',
    estandar: 'Estándar',
    premium: 'Premium'
  };

  const TIER_DESCRIPTIONS = {
    basico: 'Diseño funcional y económico',
    estandar: 'Balance perfecto calidad-precio',
    premium: 'Diseño de lujo personalizado'
  };

  //Funciones auxiliares
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
    const multiplicador = TIER_MULTIPLIERS[selectedTier];
    return metros * precioPorMetro * multiplicador;
  };

  const calcularTotal = () => {
    return ambientes.reduce((total, amb) => total + calcularCostoAmbiente(amb), 0);
  };

  const limpiarForm = () => {
    setAmbientes([]);
  };

  const generarPDF = async () => {
    if (!clienteNombre.trim() || !clienteEmail.trim() || !clienteTelefono.trim()) {
      alert('Por favor completa tus datos (nombre, email y teléfono) antes de crear el presupuesto orientativo.');
      return;
    }

    const doc = new jsPDF();
    
    let yPos = 20;
    let logoYPos = 10;
    
    // Cargar y agregar logo si existe
    if (config.logo_url) {
      try {
        // Convertir imagen a base64
        const logoData = await getImageAsBase64(config.logo_url);
        
        // Agregar logo en la esquina superior derecha
        const logoWidth = 15;
        const logoHeight = 15;
        const logoX = 190 - logoWidth; // 10px de margen desde la derecha
        
        doc.addImage(logoData, 'PNG', logoX, logoYPos, logoWidth, logoHeight);
        doc.setFontSize(8);
        doc.text("Jessica Waisman Design", logoX - 8, logoYPos + logoHeight + 4);
      } catch (error) {
        console.error('Error cargando logo:', error);
      }
    }
    
    // Título
    doc.setFontSize(20);
    doc.text('Cotización Diseño de Interiores', 20, yPos);
    
    doc.setFontSize(10);
    doc.text('Presupuesto Aproximado', 20, yPos + 8);
    // doc.text(`Nivel: ${TIER_NAMES[selectedTier]}`, 20, yPos + 13);
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 12, 190, yPos + 12);
    
    yPos = yPos + 25;
    
    // Ambientes
    doc.setFontSize(12);
    ambientes.forEach((amb, index) => {
      const metros = calcularMetros(amb);
      const costo = calcularCostoAmbiente(amb);
      
      doc.text(`${index + 1}. ${nombresAmbientes[amb.tipo]}`, 20, yPos);
      doc.setFontSize(10);
      doc.text(`Dimensiones: ${amb.ancho || 0}m x ${amb.largo || 0}m = ${metros.toFixed(2)}m²`, 30, yPos + 5);
      doc.text(`Precio/m²: ${preciosAmbientes[amb.tipo]}`, 30, yPos + 10);
      doc.text(`Subtotal: ${costo.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 30, yPos + 15);
      
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
    doc.text(`TOTAL APROXIMADO: ${calcularTotal().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 20, yPos);
    
    // Nota al pie
    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('', 'normal');
    doc.text('* Este es un presupuesto aproximado. El precio final puede variar según', 20, yPos);
    doc.text('las características específicas del inmueble y requerimientos adicionales.', 20, yPos + 5);
    
    // ENVIAR DATOS
    const ambFormateados = ambientes.map(amb => {
      return {
        nombre: amb.tipo.toUpperCase(),
        metros: calcularMetros(amb),
        costo: calcularCostoAmbiente(amb)
      }
    });
    console.log(ambFormateados);

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const datosParaSheet = {
      nombre: clienteNombre,
      email: clienteEmail,
      telefono: clienteTelefono,
      tier: selectedTier,
      ambientes: ambFormateados,
      total: calcularTotal(),
      pdfBase64: pdfBase64  // ← El PDF completo
    };

    setUploading(true);
    await enviarAGoogleSheets(datosParaSheet);
    setUploading(false);

    // Descargar
    doc.save(`${clienteNombre}-cotizacion-diseno-interiores.pdf`);
  };

  const enviarAGoogleSheets = async (datos) => {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxtVQSBmQ1h2G2XDNcIIrf0Oor5GsQPxPy3SwpGWAHnnNjOGLlMXxm04gNEou7C6fi-Lw/exec';
    
    // Hace una petición HTTP POST a Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',              // Enviar datos
      mode: 'no-cors',             // Necesario para Google
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos)  // Convierte los datos a JSON
    });
  }
  
  // Función auxiliar para convertir imagen a base64
  const getImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (e) {
          reject(e);
        }
      };
      
      img.onerror = function(ev) {
        reject(new Error('No se pudo cargar la imagen', ev));
      };
      
      // Intentar cargar la imagen
      img.src = url;
    });
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

  return(
    <div className="max-w-5xl mx-auto">
        {/* Dropshadow */}
        { uploading && 
        <div className='fixed z-10 top-0 left-0 bg-black/50 w-screen h-screen'>
          <div className="w-full h-full flex flex-col justify-center items-center mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-800 mx-auto"></div>
            <p className="mt-4 font-semibold text-black">Creando el documento....</p>
          </div>
        </div>
        }
        {/* Botones de Ambientes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Selecciona los ambientes a renovar
          </h2>
          <div className="buttons-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.keys(preciosAmbientes).map((tipo) => (
              <button
                key={tipo}
                onClick={() => agregarAmbiente(tipo)}
                className={`button ${getColorClasses(coloresAmbientes[tipo])} text-white rounded-lg p-4 flex flex-col items-center gap-2 transition-all transform hover:scale-105 active:scale-110 shadow-md`}
              >
                <Plus size={24} />
                <span className="font-medium">{nombresAmbientes[tipo]}</span>
                <span className="text-xs opacity-90">${preciosAmbientes[tipo]}/m²</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Tier */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Nivel de terminación</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(TIER_MULTIPLIERS).map((tier) => (
              <label
                key={tier}
                className={`relative flex cursor-pointer rounded-lg border p-4 transition-all ${
                  selectedTier === tier
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier}
                  checked={selectedTier === tier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="sr-only"
                />
                <div className="flex flex-1 items-center">
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        selectedTier === tier
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {selectedTier === tier && (
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`block text-sm font-semibold ${
                          selectedTier === tier ? 'text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        {TIER_NAMES[tier]}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          selectedTier === tier ? 'text-blue-700' : 'text-gray-500'
                        }`}
                      >
                        {tier === 'estandar' ? 'Base' : tier === 'basico' ? '-15%' : '+35%'}
                      </span>
                    </div>
                    <span
                      className={`mt-1 block text-xs ${
                        selectedTier === tier ? 'text-blue-700' : 'text-gray-500'
                      }`}
                    >
                      {TIER_DESCRIPTIONS[tier]}
                    </span>
                  </div>
                </div>
              </label>
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
                  <p className="text-3xl text-gray-800 lg:text-start font-bold">{ambientes.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 text-sm mb-1">Superficie total</p>
                  <p className="lg:text-3xl sm:text-lg text-gray-800 font-bold">
                    {ambientes.reduce((total, amb) => total + calcularMetros(amb), 0).toFixed(2)} m²
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 text-gray-800 mb-6">
              <div className="flex lg:flex-row flex-col justify-between items-center mb-2">
                <span className="lg:text-lg sm:text-sm font-medium">Total Aproximado:</span>
                <span className="lg:text-4xl text-2xl font-bold text-blue-600">
                  ${calcularTotal().toLocaleString('es-AR', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            </div>

            {/* Formulario de datos del cliente */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Tus datos para el presupuesto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-900">
                <div>
                  <label htmlFor="cliente-nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="cliente-nombre"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cliente-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="cliente-email"
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                    placeholder="ejemplo@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cliente-telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="cliente-telefono"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    placeholder="+54 11 1234-5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * Campos requeridos para descargar el presupuesto
              </p>
            </div>

            <button
              onClick={generarPDF}
              className="w-full bg-white text-blue-600 font-semibold py-4 rounded-lg hover:scale-[103%] active:scale-[96%] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className='hidden sm:block' size={24} />
              <span className='px-1 lg:px-0'>Descargar Presupuesto en PDF</span>
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
  )
}