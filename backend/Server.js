require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: '50mb' }));  
app.use(cors());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = "RentCarDB";

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

// 📌 POST - Agregar un carro
app.post("/carros", async (req, res) => {
    try {
        const db = client.db(dbName);
        const nuevoCarro = req.body;

        console.log("📥 POST /carros - Datos recibidos:", nuevoCarro);

        if (!nuevoCarro.matricula || !nuevoCarro.marca || !nuevoCarro.modelo) {
            console.log("❌ Error: Faltan datos obligatorios en el carro.");
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        await db.collection("Carros").insertOne(nuevoCarro);
        console.log("✅ Carro agregado correctamente.");
        res.json({ mensaje: "Carro agregado correctamente" });
    } catch (error) {
        console.error("❌ Error al agregar carro:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 📌 GET - Obtener todos los clientes
// 📌 GET - Obtener todos los clientes
app.get("/clientes", async (req, res) => {
    try {
        const db = client.db(dbName);
        const clientes = await db.collection("Clientes").find().toArray();

        // Convertir _id de ObjectId a string antes de enviarlo
        const clientesConIdString = clientes.map(cliente => ({
            ...cliente,
            _id: cliente._id.toString()  // Convertir ObjectId a string
        }));

        console.log(`🔹 GET /clientes - Se encontraron ${clientes.length} clientes`);
        res.json(clientesConIdString);
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

// 📌 POST - Registrar una renta// Endpoint para registrar la renta
app.post("/rentas", async (req, res) => {
    try {
        const db = client.db(dbName);
        const nuevaRenta = req.body;

        console.log("📥 POST /rentas - Datos recibidos:", nuevaRenta);

        if (!nuevaRenta.rfcCliente || !nuevaRenta.matriculaCarro) {
            console.log("❌ Error: Faltan datos obligatorios en la renta.");
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }

        // Buscar al cliente por su 'RFC'
        const cliente = await db.collection("Clientes").findOne({ rfc: nuevaRenta.rfcCliente });
        if (!cliente) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        // Buscar al carro por su 'Matricula'
        const carro = await db.collection("Carros").findOne({ matricula: nuevaRenta.matriculaCarro });
        if (!carro) {
            return res.status(404).json({ error: "Carro no encontrado" });
        }

        // Crear la renta con los datos del cliente y el carro
        const renta = {
            clienteId: cliente._id, // Almacenar el _id de MongoDB para asociar la renta
            carroId: carro._id,     // Lo mismo para el carro
            precio: nuevaRenta.precio,
            fechaInicio: nuevaRenta.fechaInicio,
            fechaFin: nuevaRenta.fechaFin,
            formaPago: nuevaRenta.formaPago,
            total: nuevaRenta.total,
        };

        // Insertar la renta
        const resultadoRenta = await db.collection("Rentas").insertOne(renta);
        console.log("✅ Renta registrada:", resultadoRenta.insertedId);

        // Actualizar el estado del carro a "Rentado"
        const resultadoCarro = await db.collection("Carros").updateOne(
            { matricula: nuevaRenta.matriculaCarro },
            { $set: { estado: "Rentado" } }
        );

        console.log("🔄 Estado del carro actualizado:", resultadoCarro.modifiedCount > 0 ? "✔️ Éxito" : "❌ Falló");

        res.json({ mensaje: "Renta registrada correctamente", rentaId: resultadoRenta.insertedId });
    } catch (error) {
        console.error("❌ Error al registrar renta:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// 🔹 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
