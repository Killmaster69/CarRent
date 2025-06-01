const API_URL = "http://192.168.1.196:3000/clientes"; // Asegúrate de cambiar esto si usas un túnel como `ngrok`

// Agregar cliente
export const agregarCliente = async (cliente: any) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(cliente)
    });

    if (!response.ok) {
      throw new Error('Error al agregar cliente');
    }

    return await response.json();
  } catch (error) {
    console.error("Error al agregar cliente:", error);
    throw error; // Lanza el error para que sea manejado en el componente
  }
};

// Obtener clientes
export const obtenerClientes = async () => {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    return [];
  }
};

export const verificarRFC = async (rfc: string) => {
  try {
    const response = await fetch(`${API_URL}/clientes?rfc=${rfc}`);
    
    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor");
    }

    const data = await response.json();

    // Verifica si la propiedad 'exists' es true
    return data.exists;
  } catch (error) {
    console.error("Error verificando RFC:", error);
    return false;
  }
};
