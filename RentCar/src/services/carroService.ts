const API_URL = "http://192.168.1.196:3000/carros"; // URL de tu API para obtener los carros

// Función para obtener los carros desde la API
export const obtenerCarros = async () => {
  try {
    const respuesta = await fetch(API_URL);
    return await respuesta.json();
  } catch (error) {
    console.error("Error obteniendo carros:", error);
    return []; // Devuelve un array vacío en caso de error
  }
};

// Función para agregar un carro a la base de datos
export const agregarCarro = async (carro: any) => {
  try {
    const respuesta = await fetch(API_URL, {
      method: 'POST', // Método para agregar un nuevo carro
      headers: {
        'Content-Type': 'multipart/form-data', // Cambiamos para permitir el envío de imágenes
      },
      body: carro, // Enviamos el FormData
    });

    if (!respuesta.ok) {
      throw new Error('Error al agregar el carro');
    }

    return await respuesta.json(); // Retorna la respuesta JSON de la API
  } catch (error) {
    console.error('Error al agregar el carro:', error);
    throw error; // Lanza el error si hay un problema
  }
};

// Verificar si la matrícula ya está registrada
export const verificarMatricula = async (matricula: string) => {
  try {
    const response = await fetch(`${API_URL}?matricula=${matricula}`);
    const carros = await response.json();

    // Si la respuesta contiene algún carro con la misma matrícula, significa que ya existe
    return carros.some((carro: any) => carro.matricula === matricula);
  } catch (error) {
    console.error("Error verificando matrícula:", error);
    return false;
  }
};
