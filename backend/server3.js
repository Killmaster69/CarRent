require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Configuración de Multer para manejo de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Usamos un timestamp para evitar nombres duplicados
  }
});

const upload = multer({ storage: storage });

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = "RentCarDB";

// Conectar a la base de datos
async function conectarDB() {
  try {
    await client.connect();
    console.log(`✅ Conectado a MongoDB Atlas - Base de datos: ${dbName}`);
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    process.exit(1);
  }
}
conectarDB();

// 📌 GET - Obtener todos los carros
app.get("/carros", async (req, res) => {
  try {
    const db = client.db(dbName);
    const carros = await db.collection("Carros").find().toArray();
    console.log(`🔹 GET /carros - Se encontraron ${carros.length} carros`);
    res.json(carros);
  } catch (error) {
    console.error("❌ Error al obtener carros:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 📌 POST - Agregar un carro (usando Multer para manejar la imagen)
app.post("/carros", upload.single('imagen'), async (req, res) => {
  try {
    const db = client.db(dbName);
    const nuevoCarro = req.body;

    // Guardamos la ruta de la imagen en lugar de la imagen misma
    const imageUrl = `/uploads/${req.file.filename}`;

    // Validación de campos
    if (!nuevoCarro.matricula || !nuevoCarro.marca || !nuevoCarro.modelo) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Insertar el carro con la ruta de la imagen en la base de datos
    await db.collection("Carros").insertOne({
      ...nuevoCarro,
      imagen: imageUrl,  // Guardamos la ruta de la imagen
    });

    console.log("✅ Carro agregado correctamente.");
    res.json({ mensaje: "Carro agregado correctamente" });
  } catch (error) {
    console.error("❌ Error al agregar carro:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 📌 GET - Obtener todos los clientes
app.get("/clientes", async (req, res) => {
  try {
    const db = client.db(dbName);
    const clientes = await db.collection("Clientes").find().toArray();
    console.log(`🔹 GET /clientes - Se encontraron ${clientes.length} clientes`);
    res.json(clientes);
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 📌 POST - Agregar un cliente
app.post("/clientes", async (req, res) => {
  try {
    const db = client.db(dbName);
    const nuevoCliente = req.body;

    console.log("📥 POST /clientes - Datos recibidos:", nuevoCliente);

    if (!nuevoCliente.nombre || !nuevoCliente.telefono) {
      console.log("❌ Error: Faltan datos obligatorios en el cliente.");
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    await db.collection("Clientes").insertOne(nuevoCliente);
    console.log("✅ Cliente agregado correctamente.");
    res.json({ mensaje: "Cliente agregado correctamente" });
  } catch (error) {
    console.error("❌ Error al agregar cliente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 📌 GET - Obtener todas las rentas
app.get("/rentas", async (req, res) => {
  try {
    const db = client.db(dbName);
    const rentas = await db.collection("Rentas").find().toArray();
    console.log(`🔹 GET /rentas - Se encontraron ${rentas.length} rentas`);
    res.json(rentas);
  } catch (error) {
    console.error("❌ Error al obtener rentas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 📌 POST - Registrar una renta
app.post("/rentas", async (req, res) => {
  try {
    const db = client.db(dbName);
    const nuevaRenta = req.body;

    console.log("📥 POST /rentas - Datos recibidos:", nuevaRenta);

    if (!nuevaRenta.clienteId || !nuevaRenta.carroId) {
      console.log("❌ Error: Faltan datos obligatorios en la renta.");
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Convertir IDs a ObjectId antes de insertarlos en MongoDB
    nuevaRenta.clienteId = new ObjectId(nuevaRenta.clienteId);
    nuevaRenta.carroId = new ObjectId(nuevaRenta.carroId);

    // Insertar nueva renta en la base de datos
    const resultadoRenta = await db.collection("Rentas").insertOne(nuevaRenta);
    console.log("✅ Renta insertada en la BD:", resultadoRenta.insertedId);

    // Actualizar estado del carro a "Rentado"
    const resultadoCarro = await db.collection("Carros").updateOne(
      { _id: nuevaRenta.carroId },
      { $set: { estado: "Rentado" } }
    );

    console.log("🔄 Estado del carro actualizado:", resultadoCarro.modifiedCount > 0 ? "✔️ Éxito" : "❌ Falló");

    res.json({ mensaje: "Renta registrada correctamente", rentaId: resultadoRenta.insertedId });
  } catch (error) {
    console.error("❌ Error al registrar renta:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
// 📌 Verificar RFC
// Ruta para verificar RFC
app.get("/rfc", async (req, res) => {
  try {
    const db = client.db(dbName);
    const { rfc } = req.query; // Obtener RFC del query string

    // Verificar si el RFC ya está registrado en la base de datos
    const clienteExistente = await db.collection("Clientes").findOne({ rfc });

    if (clienteExistente) {
      // Si el RFC ya está registrado
      res.json({ exists: true });
    } else {
      // Si el RFC no está registrado
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("❌ Error al verificar RFC:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});



// Servir imágenes estáticas desde la carpeta 'uploads'
app.use('/uploads', express.static('uploads'));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
