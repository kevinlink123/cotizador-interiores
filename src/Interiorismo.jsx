import React, { useState, useEffect } from "react";
import { Plus, Trash2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function Interiorismo() {
  const [ambientes, setAmbientes] = useState([]);
  const [nextId, setNextId] = useState(1);

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');

  const [preciosAmbientes, setPreciosAmbientes] = useState({});
  const [nombresAmbientes, setNombresAmbientes] = useState({});
  const [coloresAmbientes, setColoresAmbientes] = useState({});
  const [config, setConfig] = useState({
    titulo: "",
    subtitulo: "",
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Obtener la URL de la API desde las variables globales de WordPress
        const apiUrl = window.cotizadorData?.apiUrl || "/wp-json/cotizador/v1/";

        // Cargar ambientes
        const ambientesResponse = await fetch(apiUrl + "interiorismo");
        const ambientesData = await ambientesResponse.json();

        // Cargar configuración
        const configResponse = await fetch(apiUrl + "config");
        const configData = await configResponse.json();

        // Procesar datos de ambientes
        const precios = {};
        const nombres = {};
        const colores = {};

        Object.keys(ambientesData).forEach((key) => {
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
        console.error("Error cargando datos:", error);
        // Usar valores por defecto si falla la carga
        // setPreciosAmbientes({
        //   living: 150,
        //   comedor: 140,
        //   cocina: 200,
        //   dormitorio: 130,
        //   bano: 250
        // });
        // setNombresAmbientes({
        //   living: 'Living',
        //   comedor: 'Comedor',
        //   cocina: 'Cocina',
        //   dormitorio: 'Dormitorio',
        //   bano: 'Baño'
        // });
        // setColoresAmbientes({
        //   living: 'blue',
        //   comedor: 'green',
        //   cocina: 'orange',
        //   dormitorio: 'purple',
        //   bano: 'teal'
        // });
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

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'tx:bg-blue-500 tx:hover:bg-blue-600 tx:text-white',
      green: 'tx:bg-green-500 tx:hover:bg-green-600 tx:text-white',
      orange: 'tx:bg-orange-500 tx:hover:bg-orange-600 tx:text-white',
      purple: 'tx:bg-purple-500 tx:hover:bg-purple-600 tx:text-white',
      teal: 'tx:bg-teal-500 tx:hover:bg-teal-600 tx:text-white',
      red: 'tx:bg-red-500 tx:hover:bg-red-600 tx:text-white',
      white: "tx:bg-[#FFFFFF] tx:hover:bg-[#FFFFFF] tx:text-black",
      lightgray: "tx:bg-[#C2C1C3] tx:hover:bg-[#C2C1C3]/75 tx:text-black",
      gray: "tx:bg-[#858387] tx:hover:bg-[#858387]/75 tx:text-black",
      darkgray: "tx:bg-[#48454B] tx:hover:bg-[#48454B]/75 tx:text-white",
      black: "tx:bg-[#0A070E] tx:hover:bg-[#0A070E]/75 tx:text-white",
    };
    return colorMap[color] || "tx:bg-gray-500 tx:hover:bg-gray-600 tx:text-white";
  };

  const agregarAmbiente = (tipo) => {
    const nuevoAmbiente = {
      id: nextId,
      tipo,
			ancho: '',
			largo: '',
      tier: 'estandar'
    };
    setAmbientes([...ambientes, nuevoAmbiente]);
    setNextId(nextId + 1);
  };

  const eliminarAmbiente = (id) => {
    setAmbientes(ambientes.filter((amb) => amb.id !== id));
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

  const limpiarForm = () => {
    setAmbientes([]);
  };

  const calcularCostoAmbiente = (ambiente) => {
    const precioPorAmb = preciosAmbientes[ambiente.tipo] || 0;
    const multiplicador = TIER_MULTIPLIERS[ambiente.tier];
    return precioPorAmb * multiplicador;
  };

  const calcularTotal = () => {
    return ambientes.reduce(
      (total, amb) => total + calcularCostoAmbiente(amb),
      0
    );
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

        doc.addImage(logoData, "PNG", logoX, logoYPos, logoWidth, logoHeight);
        doc.setFontSize(8);
        doc.text(
          "Jessica Waisman Design",
          logoX - 8,
          logoYPos + logoHeight + 4
        );
      } catch (error) {
        console.error("Error cargando logo:", error);
      }
    }

    // Título
    doc.setFontSize(20);
    doc.text("Cotización Interiorismo + Mobiliario", 20, yPos);

    doc.setFontSize(10);
    doc.text("Presupuesto Aproximado", 20, yPos + 8);
    // doc.text(`Nivel: ${TIER_NAMES[selectedTier]}`, 20, yPos + 13);

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 12, 190, yPos + 12);

    yPos = yPos + 25;

    // Ambientes
    doc.setFontSize(12);
    ambientes.forEach((amb, index) => {
      const costo = calcularCostoAmbiente(amb);
			
      doc.text(`${index + 1}. ${nombresAmbientes[amb.tipo]}`, 20, yPos);
      doc.setFontSize(10);
      doc.text(`Nivel de Terminacion: ${amb.tier}`, 30, yPos + 5);
      doc.text(`Precio: ${preciosAmbientes[amb.tipo]}`, 30, yPos + 10);
      doc.text(
        `Subtotal: ${costo.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        30,
        yPos + 15
      );
			doc.text(`Detalle ambiente: Ancho ${amb.ancho} mts, largo ${amb.largo} mts`, 30, yPos + 20);

      yPos += 30;
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
    doc.setFont("", "bold");
    doc.text(
      `TOTAL APROXIMADO: ${calcularTotal().toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      20,
      yPos
    );

    // Nota al pie
    yPos += 15;
    doc.setFontSize(9);
    doc.setFont("", "normal");
    doc.text(
      "* Este es un presupuesto aproximado. El precio final puede variar según",
      20,
      yPos
    );
    doc.text(
      "las características específicas del inmueble y requerimientos adicionales.",
      20,
      yPos + 5
    );

    // ENVIAR DATOS
    const ambFormateados = ambientes.map(amb => {
      return {
        nombre: amb.tipo.toUpperCase(),
        metros: calcularMetros(amb),
        costo: calcularCostoAmbiente(amb),
        tier: amb.tier
      }
    });
    console.log(ambFormateados);

    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const datosParaSheet = {
      nombre: clienteNombre,
      email: clienteEmail,
      telefono: clienteTelefono,
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
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDIlSI4_sE2dpnw3GO9eVO-HlW_coard0dsT3Q9LOB0fvZ4iZBuo3t8MA06cjivGr8dw/exec';
    
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
      img.crossOrigin = "Anonymous";

      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        try {
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        } catch (e) {
          reject(e);
        }
      };

      img.onerror = function (ev) {
        reject(new Error("No se pudo cargar la imagen", ev));
      };

      // Intentar cargar la imagen
      img.src = url;
    });
  };

  if (loading) {
    return (
      <div className="tx:min-h-screen tx:bg-gradient-to-br tx:from-gray-50 tx:to-gray-100 tx:py-12 tx:px-4">
        <div className="tx:max-w-5xl tx:mx-auto tx:text-center">
          <div className="tx:animate-spin tx:rounded-full tx:h-12 tx:w-12 tx:border-b-2 tx:border-blue-500 tx:mx-auto"></div>
          <p className="tx:mt-4 tx:text-gray-600">Cargando cotizador...</p>
        </div>
      </div>
    );
  }

  return (
		<div className="interiorismo-container tx:max-w-5xl tx:mx-auto">
      {/* Dropshadow */}
        { uploading && 
        <div className='tx:fixed tx:z-10 tx:top-0 tx:left-0 tx:bg-black/50 tx:w-screen tx:h-screen'>
          <div className="tx:w-full tx:h-full tx:flex tx:flex-col tx:justify-center tx:items-center tx:mx-auto tx:text-center">
            <div className="tx:animate-spin tx:rounded-full tx:h-16 tx:w-16 tx:border-b-2 tx:border-blue-800 tx:mx-auto"></div>
            <p className="tx:mt-4 tx:font-semibold tx:text-black">Creando el documento....</p>
          </div>
        </div>
        }

			{/* Botones de Ambientes */}
      <div className="tx:bg-white tx:rounded-lg tx:shadow-md tx:p-6 tx:mb-8">
        <h2 className="tx:text-xl tx:font-semibold tx:text-gray-800 tx:mb-4">
          Selecciona los ambientes a renovar
        </h2>
        <div className="buttons-container tx:grid tx:grid-cols-2 tx:md:grid-cols-3 tx:lg:grid-cols-5 tx:gap-3">
          {Object.keys(preciosAmbientes).map((tipo) => (
            <button
              key={tipo}
              onClick={() => agregarAmbiente(tipo)}
              className={`button ${getColorClasses(coloresAmbientes[tipo])} tx:rounded-lg tx:p-4 tx:flex tx:flex-col tx:items-center tx:gap-2 tx:transition-all tx:transform tx:hover:scale-105 tx:active:scale-110 tx:shadow-md`}
            >
              <Plus size={24} />
              <span className="tx:font-medium">{nombresAmbientes[tipo]}</span>
              <span className="tx:text-xs tx:opacity-90">${preciosAmbientes[tipo]}/Ambiente</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Ambientes Agregados */}
      {ambientes.length > 0 && (
        <div className="tx:bg-white tx:rounded-lg tx:shadow-md tx:p-6 tx:mb-8">
          <h2 className="tx:text-xl tx:font-semibold tx:text-gray-800 tx:mb-4">
            Ambientes agregados
          </h2>
          <div className="tx:space-y-4">
            {ambientes.map((ambiente, index) => (
              <div
                key={ambiente.id}
                className="tx:border tx:border-gray-200 tx:rounded-lg tx:p-4 tx:hover:shadow-md tx:transition-shadow"
              >
                <div className="tx:flex tx:items-start tx:justify-between tx:mb-3">
                  <div className="tx:flex tx:items-center tx:gap-3">
                    <span className="tx:bg-gray-100 tx:text-gray-700 tx:font-semibold tx:rounded-full tx:w-8 tx:h-8 tx:flex tx:items-center tx:justify-center tx:text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="tx:font-semibold tx:text-gray-800">
                        {nombresAmbientes[ambiente.tipo]}
                      </h3>
                      <p className="tx:text-sm tx:text-gray-500">
                        ${preciosAmbientes[ambiente.tipo]}/m²
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarAmbiente(ambiente.id)}
                    className="tx:text-red-500 tx:hover:text-red-700 tx:hover:bg-red-50 tx:p-2 tx:rounded-lg tx:transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="tx:grid tx:grid-cols-2 tx:gap-4 tx:mb-3">
                  <div>
                    <label className="tx:block tx:text-sm tx:font-medium tx:text-gray-700 tx:mb-1">
                      Ancho (metros)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      value={ambiente.ancho}
                      onChange={(e) => {
                        // 1. Eliminar todo excepto números y punto
                        const value = e.target.value.replace(/[^\d.]/g, '');
                        
                        // 2. Evitar múltiples puntos decimales
                        const parts = value.split('.');
                        const sanitized = parts.length > 2 
                          ? parts[0] + '.' + parts.slice(1).join('') 
                          : value;
                        
                        actualizarAmbiente(ambiente.id, 'ancho', sanitized);
                      }}
                      className="tx:w-full tx:px-3 tx:py-2 tx:border tx:border-gray-300 tx:rounded-lg tx:focus:ring-2 tx:focus:ring-blue-500 tx:focus:border-transparent"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="tx:block tx:text-sm tx:font-medium tx:text-gray-700 tx:mb-1">
                      Largo (metros)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      value={ambiente.largo}
                      onChange={(e) => {
                        // 1. Eliminar todo excepto números y punto
                        const value = e.target.value.replace(/[^\d.]/g, '');
                        
                        // 2. Evitar múltiples puntos decimales
                        const parts = value.split('.');
                        const sanitized = parts.length > 2 
                          ? parts[0] + '.' + parts.slice(1).join('') 
                          : value;
                        
                        actualizarAmbiente(ambiente.id, 'largo', sanitized);
                      }}
                      className="tx:w-full tx:px-3 tx:py-2 tx:border tx:border-gray-300 tx:rounded-lg tx:focus:ring-2 tx:focus:ring-blue-500 tx:focus:border-transparent"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div className="tx:bg-gray-50 tx:rounded-lg tx:p-3">
                  <div className="tx:flex tx:justify-between tx:items-center tx:text-sm">
                    {/* <span className="text-gray-600">
                      Superficie: {calcularMetros(ambiente).toFixed(2)} m²
                    </span> */}
                    <span className="tx:font-semibold tx:text-gray-800">
                      ${calcularCostoAmbiente(ambiente).toLocaleString('es-AR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                </div>

                <div className="tx:my-6">
                  <h3 className="tx:text-lg tx:font-medium tx:text-gray-700 tx:mb-3">Nivel de terminación</h3>
                  <div className="tx:grid tx:grid-cols-1 tx:md:grid-cols-3 tx:gap-4">
                    {Object.keys(TIER_MULTIPLIERS).map((tier) => (
                      <label
                        key={tier}
                        className={`tx:relative tx:flex tx:cursor-pointer tx:rounded-lg tx:border tx:p-4 tx:transition-all ${
                          ambiente.tier === tier
                            ? 'tx:border-blue-500 tx:bg-blue-50 tx:ring-2 tx:ring-blue-500'
                            : 'tx:border-gray-300 tx:bg-white tx:hover:border-blue-300 tx:hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="tier"
                          value={tier}
                          checked={ambiente.tier === tier}
                          onChange={(e) => actualizarAmbiente(ambiente.id, 'tier', e.target.value)}
                          className="tx:sr-only"
                        />
                        <div className="tx:flex tx:flex-1 tx:items-center">
                          <div className="tx:flex-shrink-0">
                            <div
                              className={`tx:flex tx:h-6 tx:w-6 tx:items-center tx:justify-center tx:rounded-full tx:border-2 ${
                                ambiente.tier === tier
                                  ? 'tx:border-blue-600 tx:bg-blue-600'
                                  : 'tx:border-gray-300 tx:bg-white'
                              }`}
                            >
                              {ambiente.tier === tier && (
                                <div className="tx:h-2 tx:w-2 tx:rounded-full tx:bg-white"></div>
                              )}
                            </div>
                          </div>
                          <div className="tx:ml-3 tx:flex-1">
                            <div className="tx:flex tx:items-center tx:justify-between">
                              <span
                                className={`tx:block tx:text-sm tx:font-semibold ${
                                  ambiente.tier === tier ? 'tx:text-blue-900' : 'tx:text-gray-900'
                                }`}
                              >
                                {TIER_NAMES[tier]}
                              </span>
                              <span
                                className={`tx:text-xs tx:font-medium ${
                                  ambiente.tier === tier ? 'tx:text-blue-700' : 'tx:text-gray-500'
                                }`}
                              >
                                {tier === 'estandar' ? 'Base' : tier === 'basico' ? '-15%' : '+35%'}
                              </span>
                            </div>
                            <span
                              className={`tx:mt-1 tx:block tx:text-xs ${
                                ambiente.tier === tier ? 'tx:text-blue-700' : 'tx:text-gray-500'
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen y Total */}
      {ambientes.length > 0 && (
        <div className="tx:relative tx:bg-gradient-to-r tx:from-blue-500 tx:to-purple-600 tx:rounded-lg tx:shadow-lg tx:p-6 tx:text-white">
          <button
            onClick={limpiarForm}
            className="tx:absolute tx:top-0 tx:right-0 tx:p-2 tx:m-4 tx:transition-all tx:text-red-500 tx:bg-gray-50 tx:hover:text-red-700 tx:hover:bg-gray-200 tx:hover:scale-115 tx:rounded-lg"
          >
            <Trash2 size={20} />
          </button>
          <div className="tx:mb-6">
            <h2 className="tx:text-2xl tx:font-bold tx:mb-2">Resumen del Presupuesto</h2>
            <p className="tx:text-blue-100 tx:text-sm">
              * Presupuesto aproximado. El precio final puede variar según características específicas.
            </p>
          </div>

          <div className="tx:bg-white tx:bg-opacity-20 tx:rounded-lg tx:p-4 tx:mb-6">
            <div className="tx:flex tx:justify-between tx:items-center">
              <div>
                <p className="tx:text-gray-800 tx:text-sm tx:mb-1">Total de ambientes</p>
                <p className="tx:text-3xl tx:text-gray-800 tx:lg:text-start tx:font-bold">{ambientes.length}</p>
              </div>
            </div>
          </div>

          <div className="tx:bg-white tx:rounded-lg tx:p-6 tx:text-gray-800 tx:mb-6">
            <div className="tx:flex tx:lg:flex-row tx:flex-col tx:justify-between tx:items-center tx:mb-2">
              <span className="tx:lg:text-lg tx:sm:text-sm tx:font-medium">Total Aproximado:</span>
              <span className="tx:lg:text-4xl tx:text-2xl tx:font-bold tx:text-blue-600">
                ${calcularTotal().toLocaleString('es-AR', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          </div>

          {/* Formulario de datos del cliente */}
          <div className="tx:bg-white tx:rounded-lg tx:p-6 tx:mb-6">
            <h3 className="tx:text-lg tx:font-semibold tx:text-gray-800 tx:mb-4">
              Tus datos para el presupuesto
            </h3>
            <div className="tx:grid tx:grid-cols-1 tx:md:grid-cols-3 tx:gap-4 tx:text-gray-900">
              <div>
                <label htmlFor="cliente-nombre" className="tx:block tx:text-sm tx:font-medium tx:text-gray-700 tx:mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="cliente-nombre"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="tx:w-full tx:px-4 tx:py-3 tx:border tx:border-gray-300 tx:rounded-lg tx:focus:ring-2 tx:focus:ring-blue-500 tx:focus:border-transparent tx:transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="cliente-email" className="tx:block tx:text-sm tx:font-medium tx:text-gray-700 tx:mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="cliente-email"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  placeholder="ejemplo@email.com"
                  className="tx:w-full tx:px-4 tx:py-3 tx:border tx:border-gray-300 tx:rounded-lg tx:focus:ring-2 tx:focus:ring-blue-500 tx:focus:border-transparent tx:transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="cliente-telefono" className="tx:block tx:text-sm tx:font-medium tx:text-gray-700 tx:mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="cliente-telefono"
                  value={clienteTelefono}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d\s\-+]/g, '')
                    setClienteTelefono(value)
                  }}
                  placeholder="+54 11 1234-5678"
                  className="tx:w-full tx:px-4 tx:py-3 tx:border tx:border-gray-300 tx:rounded-lg tx:focus:ring-2 tx:focus:ring-blue-500 tx:focus:border-transparent tx:transition-all"
                  required
                />
              </div>
            </div>
            <p className="tx:text-xs tx:text-gray-500 tx:mt-3">
              * Campos requeridos para descargar el presupuesto
            </p>
          </div>

          <button
            onClick={generarPDF}
            className="tx:w-full tx:bg-white tx:text-blue-600 tx:font-semibold tx:py-4 tx:ounded-lg tx:hover:scale-[103%] tx:active:scale-[96%] tx:transition-all tx:flex tx:items-center tx:justify-center tx:gap-2 tx:shadow-lg"
          >
            <Download className='tx:hidden tx:sm:block' size={24} />
            <span className='tx:px-1 tx:lg:px-0'>Descargar Presupuesto en PDF</span>
          </button>
        </div>
      )}

      {/* Mensaje inicial */}
      {ambientes.length === 0 && (
        <div className="tx:bg-white tx:rounded-lg tx:shadow-md tx:p-12 tx:text-center">
          <div className="tx:text-gray-400 tx:mb-4">
            <Plus size={64} className="tx:mx-auto" />
          </div>
          <h3 className="tx:text-xl tx:font-semibold tx:text-gray-600 tx:mb-2">
            Comienza agregando ambientes
          </h3>
          <p className="tx:text-gray-500">
            Selecciona los ambientes que deseas renovar desde los botones de arriba
          </p>
        </div>
      )}
		</div>
	);
}
