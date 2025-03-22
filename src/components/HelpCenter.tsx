<div className="flex flex-col">
  {/* Chat ao Vivo */}
  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
    <div className="flex items-center">
      <Chat size={20} className="text-emerald-500" />
      <h4 className="ml-2 font-semibold">Chat ao Vivo</h4>
    </div>
    <p>Disponível 24/7</p>
    <button className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg">
      Iniciar Chat
    </button>
  </div>

  {/* Email */}
  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
    <div className="flex items-center">
      <Mail size={20} className="text-emerald-500" />
      <h4 className="ml-2 font-semibold">Email</h4>
    </div>
    <p>Resposta em até 24h</p>
    <button className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg">
      Enviar Email
    </button>
  </div>

  {/* Troca de Telefone para WhatsApp */}
  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
    <div className="flex items-center">
      <WhatsApp size={20} className="text-emerald-500" />
      <h4 className="ml-2 font-semibold">WhatsApp</h4>
    </div>
    <p>Seg-Sex, 9h-18h</p>
    <button className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg">
      Ver Número
    </button>
  </div>
</div> 