const API_URL = "http://192.168.1.196:3000/rentas"; // URL de tu API

export const agregarRenta = async (renta: any) => {
  try {
    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(renta),
    });
    return await respuesta.json();
  } catch (error) {
    console.error("Error agregando renta:", error);
  }
};
