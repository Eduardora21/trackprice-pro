const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar base de datos SQLite en un archivo local
const db = new sqlite3.Database('precios.db');

// Crear tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS historial (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto TEXT,
      precio REAL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint POST: Rastrear y guardar precio
app.post('/api/rastrear', async (req, res) => {
  const { nombreProducto, url, selector } = req.body;

  try {
    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      }
    });

    const $ = cheerio.load(data);
    const textoPrecio = $(selector).text().trim();
    const precioNum = parseFloat(textoPrecio.replace(/[^0-9.]/g, ''));

    if (isNaN(precioNum)) {
      return res.status(400).json({ success: false, error: 'No se pudo extraer un número válido con ese selector.' });
    }

    const stmt = db.prepare('INSERT INTO historial (producto, precio) VALUES (?, ?)');
    stmt.run(nombreProducto, precioNum, function(err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, producto: nombreProducto, precio: precioNum });
    });
    stmt.finalize();

  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar la URL: ' + err.message });
  }
});

// Endpoint GET: Obtener historial
app.get('/api/historial', (req, res) => {
  db.all('SELECT * FROM historial ORDER BY fecha DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});