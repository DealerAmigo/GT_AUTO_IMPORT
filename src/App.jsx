import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, ShieldCheck, Calendar, Send, MessageSquare, 
  Loader2, Phone, Mail, User, Landmark, HelpCircle, CheckCircle2 
} from 'lucide-react';

// --- CONFIGURACIÓN DE CONEXIÓN ---
const GAS_WEB_APP_URL = "TU_URL_DE_APPS_SCRIPT_AQUÍ"; // REEMPLAZAR CON TU URL DE DEPLOY
const PROXY_KEY = "GTAuto-2025-K9mX8-Secret";

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: '¡Hola! Bienvenido a GT Auto Imports. 🚗 ¿Qué tipo de vehículo estás buscando hoy o en qué puedo ayudarte?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const chatEndRef = useRef(null);

  // Estado del formulario de Pre-cualificación de 19 columnas
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', email: '', vehiculo: '',
    creditTier: 'Bueno (640-699)', creditScore: '',
    tienePronto: 'Sí', cantidadPronto: '',
    tieneTrade: 'No', tradeAno: '', tradeMarca: '', tradeModelo: '', estadoTrade: '',
    consentimiento: 'Sí', resumen: 'Lead pre-cualificado desde el sitio web.'
  });

  // Cargar inventario desde doGet automáticamente al cargar la página
  useEffect(() => {
    fetch(GAS_WEB_APP_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInventory(data);
        } else {
          console.error("Formato de inventario inválido:", data);
        }
      })
      .catch(err => console.error("Error cargando inventario:", err))
      .finally(() => setLoadingInventory(false));
  }, []);

  // Auto-scroll del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Selección rápida de auto del catálogo hacia el Formulario y el Chat
  const handleSelectCar = (carName) => {
    setFormData(prev => ({ ...prev, vehiculo: carName }));
    
    // Inyectar en el chat
    const messageText = `Me interesa obtener más información sobre el vehículo: ${carName}`;
    setUserInput(messageText);
    
    // Desplazar al chat
    document.getElementById('chatbot-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enviar mensaje al bot de Claude (doPost: askClaude)
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || chatLoading) return;

    const userMessage = { role: 'user', content: userInput };
    const updatedMessages = [...chatMessages, userMessage];

    setChatMessages(updatedMessages);
    setUserInput('');
    setChatLoading(true);

    try {
      const res = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'askClaude',
          proxyKey: PROXY_KEY,
          messages: updatedMessages
        })
      });
      const data = await res.json();
      
      if (data.reply) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un inconveniente al conectar con el asistente. Inténtalo de nuevo.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Enviar Lead estructurado (doPost: saveLead)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'saveLead',
          proxyKey: PROXY_KEY,
          data: formData
        })
      });
      const data = await res.json();
      
      if (data.status === 'ok') {
        setFormSubmitted(true);
      } else {
        throw new Error(data.error || "Error al procesar el formulario");
      }
    } catch (err) {
      alert("Inconveniente al procesar la cita: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Car className="text-blue-500 h-8 w-8" />
          <span className="text-xl font-bold tracking-wider">GT AUTO IMPORTS</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm text-slate-400">
          <a href="#catalogo" className="hover:text-white transition">Inventario</a>
          <a href="#pre-cualificacion" className="hover:text-white transition">Pre-Cualificar</a>
          <a href="#chatbot-section" className="hover:text-white transition">Asistente Virtual</a>
        </nav>
        <div className="flex gap-4">
          <a href="tel:7875551234" className="text-slate-400 hover:text-white transition"><Phone className="h-5 w-5" /></a>
          <a href="mailto:willquisnos@gmail.com" className="text-slate-400 hover:text-white transition"><Mail className="h-5 w-5" /></a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto z-10 relative">
          <span className="text-blue-500 font-semibold tracking-wider text-sm uppercase">Importaciones Exclusivas de Puerto Rico</span>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-4 tracking-tight leading-none">
            Encuentra tu próximo vehículo <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Listo para Entrega</span>
          </h1>
          <p className="text-slate-400 mt-6 max-w-2xl mx-auto text-lg">
            Explora nuestro inventario activo en tiempo real, cotiza en segundos con nuestro asistente de IA y agenda tu prueba de manejo hoy mismo.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#catalogo" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg shadow-lg transition">Ver Catálogo</a>
            <a href="#chatbot-section" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 font-semibold rounded-lg transition">Chatear con el Bot</a>
          </div>
        </div>
      </section>

      {/* CATÁLOGO DE INVENTARIO */}
      <section id="catalogo" className="py-16 px-6 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-2">Vehículos Disponibles</h2>
        <p className="text-slate-400 mb-8">Directamente sincronizado con nuestro lote de autos.</p>

        {loadingInventory ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-500 h-10 w-10" />
            <p className="text-slate-400">Sincronizando base de datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inventory.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No hay vehículos reportados en este momento.
              </div>
            ) : (
              inventory.map((car, idx) => (
                <div key={idx} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition flex flex-col justify-between">
                  <div className="p-6">
                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">{car.Clase || 'Importado'}</span>
                    <h3 className="text-xl font-bold mt-1 text-white">{car.Marca} {car.Modelo}</h3>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-3">{car.Descripcion || 'Sin descripción detallada disponible.'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Año: {car.Ano || 'N/A'}</span>
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">Transmisión: {car.Transmision || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="p-6 pt-0 border-t border-slate-800/50 mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-cyan-400">{car.Precio ? `$${car.Precio.toLocaleString()}` : 'Consultar'}</span>
                    <button 
                      onClick={() => handleSelectCar(`${car.Marca} ${car.Modelo}`)}
                      className="px-4 py-2 bg-slate-800 hover:bg-blue-600 text-sm font-semibold rounded transition"
                    >
                      Me Interesa
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* SECCIÓN INTERACTIVA: PRE-CUALIFICACIÓN Y CHATBOT */}
      <section className="bg-slate-900 border-t border-b border-slate-800 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLUMNA 1: FORMULARIO DE PRE-CUALIFICACIÓN */}
          <div id="pre-cualificacion" className="lg:col-span-7 bg-slate-950 p-8 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-emerald-500 h-8 w-8" />
              <div>
                <h3 className="text-2xl font-bold">Pre-Cualificación Rápida</h3>
                <p className="text-slate-400 text-sm">Agenda tu prueba de manejo con tu información financiera lista.</p>
              </div>
            </div>

            {formSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="text-emerald-500 h-16 w-16 mb-4" />
                <h4 className="text-2xl font-bold text-white">¡Pre-Cualificación Enviada!</h4>
                <p className="text-slate-400 mt-2 max-w-md">
                  Hemos agendado tu espacio en nuestro Calendario y notificado a los vendedores. Un representante te contactará en breve.
                </p>
                <button 
                  onClick={() => setFormSubmitted(false)}
                  className="mt-6 px-4 py-2 bg-slate-800 rounded text-sm text-slate-300 hover:bg-slate-700 transition"
                >
                  Registrar otro vehículo
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <input 
                        type="text" required
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        placeholder="Ej: Juan Pérez"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Teléfono de Contacto</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <input 
                        type="tel" required
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        placeholder="Ej: 7875551234"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <input 
                        type="email" required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="ejemplo@correo.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Vehículo de Interés</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <input 
                        type="text" required
                        value={formData.vehiculo}
                        onChange={(e) => setFormData({...formData, vehiculo: e.target.value})}
                        placeholder="Selecciona o escribe el modelo"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Rango de Crédito</label>
                    <select 
                      value={formData.creditTier}
                      onChange={(e) => setFormData({...formData, creditTier: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm outline-none"
                    >
                      <option>Excelente (720+)</option>
                      <option>Bueno (640-699)</option>
                      <option>Regular (580-639)</option>
                      <option>Afectado (Menos de 580)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Score Exacto (Si lo sabe)</label>
                    <input 
                      type="number"
                      value={formData.creditScore}
                      onChange={(e) => setFormData({...formData, creditScore: e.target.value})}
                      placeholder="Ej: 680"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">¿Tiene Pronto?</label>
                    <select 
                      value={formData.tienePronto}
                      onChange={(e) => setFormData({...formData, tienePronto: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm outline-none"
                    >
                      <option>Sí</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Cantidad del Pronto</label>
                    <input 
                      type="text"
                      value={formData.cantidadPronto}
                      onChange={(e) => setFormData({...formData, cantidadPronto: e.target.value})}
                      placeholder="Ej: $2,500"
                      disabled={formData.tienePronto === 'No'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">¿Entrega Auto a Cambio (Trade-In)?</label>
                      <select 
                        value={formData.tieneTrade}
                        onChange={(e) => setFormData({...formData, tieneTrade: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm outline-none"
                      >
                        <option>Sí</option>
                        <option>No</option>
                      </select>
                    </div>
                    {formData.tieneTrade === 'Sí' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Año del Trade-In</label>
                        <input 
                          type="number"
                          value={formData.tradeAno}
                          onChange={(e) => setFormData({...formData, tradeAno: e.target.value})}
                          placeholder="Ej: 2018"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {formData.tieneTrade === 'Sí' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Marca</label>
                        <input 
                          type="text"
                          value={formData.tradeMarca}
                          onChange={(e) => setFormData({...formData, tradeMarca: e.target.value})}
                          placeholder="Ej: Toyota"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Modelo</label>
                        <input 
                          type="text"
                          value={formData.tradeModelo}
                          onChange={(e) => setFormData({...formData, tradeModelo: e.target.value})}
                          placeholder="Ej: Corolla"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Condición del Auto</label>
                        <input 
                          type="text"
                          value={formData.estadoTrade}
                          onChange={(e) => setFormData({...formData, estadoTrade: e.target.value})}
                          placeholder="Ej: Muy buena"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 font-bold rounded-lg shadow-lg flex justify-center items-center gap-2 transition disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Procesando tu cita...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5" />
                      Pre-Cualificar y Reservar Espacio
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* COLUMNA 2: CHATBOT INTERACTIVO CON CLAUDE */}
          <div id="chatbot-section" className="lg:col-span-5 flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden h-[600px] justify-between shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
              <MessageSquare className="text-blue-500 h-6 w-6" />
              <div>
                <h4 className="font-bold text-white text-sm">Asistente Virtual GT Auto</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Conectado al Inventario
                </p>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-slate-900 text-slate-200 rounded-bl-none border border-slate-800'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 text-slate-400 rounded-lg rounded-bl-none border border-slate-800 px-4 py-3 text-sm flex gap-1 items-center">
                    Asistente de IA <span className="typing-dots flex gap-0.5 ml-1"><span className="h-1.5 w-1.5 bg-slate-400 rounded-full"></span><span className="h-1.5 w-1.5 bg-slate-400 rounded-full"></span><span className="h-1.5 w-1.5 bg-slate-400 rounded-full"></span></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input 
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Pregúntale a la IA sobre un vehículo..."
                disabled={chatLoading}
                className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={chatLoading}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          © {new Date().getFullYear()} GT Auto Imports. Todos los derechos reservados.
        </div>
        <div className="flex gap-4">
          <span>Dorado, Puerto Rico</span>
          <span>•</span>
          <a href="tel:7875551234" className="hover:text-white transition">Llámanos</a>
        </div>
      </footer>
    </div>
  );
}