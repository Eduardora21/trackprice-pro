const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Endpoint de prueba
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: '¡Servidor de TrackPrice Pro activo desde Docker + Nginx!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});