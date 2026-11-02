/**
 * ==============================================================================
 *  BACKEND API REST - BASE DE DATOS DE PELÍCULAS (POSTGRESQL + EXPRESS)
 * ==============================================================================
 *
 *  Conexión directa a PostgreSQL ('peliculas_db')
 *
 *  Para ejecutar:
 *      node servidor_peliculas.js
 * ==============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// ==============================================================================
// 1. CONFIGURACIÓN Y CONEXIÓN A POSTGRESQL
// ==============================================================================
const PUERTO = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'peliculas_db',
});

// Probar conexión inicial
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL en la base de datos:', process.env.DB_NAME || 'peliculas_db');
    release();
  }
});

// ==============================================================================
// 2. MIDDLEWARES
// ==============================================================================
app.use(cors());
app.use(express.json());

// Endpoint raíz de bienvenida / info
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API REST de Películas activa con PostgreSQL',
    documentacion_rapida: {
      getAll: 'GET http://localhost:3000/api/peliculas',
      getById: 'GET http://localhost:3000/api/peliculas/:id',
      create: 'POST http://localhost:3000/api/peliculas',
      updateFull: 'PUT http://localhost:3000/api/peliculas/:id',
      updatePartial: 'PATCH http://localhost:3000/api/peliculas/:id',
      delete: 'DELETE http://localhost:3000/api/peliculas/:id'
    }
  });
});

// ==============================================================================
// 3. ENDPOINTS CRUD
// ==============================================================================

/**
 * [GET] Obtener todas las películas (opcional: filtrar por query ?genero= o ?titulo=)
 * Ruta: http://localhost:3000/api/peliculas
 */
app.get('/api/peliculas', async (req, res) => {
  try {
    const { genero, titulo } = req.query;
    let consulta = 'SELECT * FROM peliculas';
    const valores = [];

    if (genero || titulo) {
      const condiciones = [];
      if (genero) {
        valores.push(`%${genero}%`);
        condiciones.push(`genero ILIKE $${valores.length}`);
      }
      if (titulo) {
        valores.push(`%${titulo}%`);
        condiciones.push(`titulo ILIKE $${valores.length}`);
      }
      consulta += ' WHERE ' + condiciones.join(' AND ');
    }

    consulta += ' ORDER BY id ASC';

    const resultado = await pool.query(consulta, valores);
    return res.json({
      total: resultado.rows.length,
      peliculas: resultado.rows
    });
  } catch (error) {
    console.error('Error en GET /api/peliculas:', error);
    return res.status(500).json({ error: 'Error interno en el servidor', detalle: error.message });
  }
});

/**
 * [GET] Obtener una sola película por su ID
 * Ruta: http://localhost:3000/api/peliculas/:id
 */
app.get('/api/peliculas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('SELECT * FROM peliculas WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: `Película con ID ${id} no encontrada`
      });
    }

    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error(`Error en GET /api/peliculas/${id}:`, error);
    return res.status(500).json({ error: 'Error interno en el servidor', detalle: error.message });
  }
});

/**
 * [POST] Crear una nueva película
 * Ruta: http://localhost:3000/api/peliculas
 * Body esperado:
 * {
 *   "titulo": "Oppenheimer",
 *   "genero": "Drama / Biografía",
 *   "anio": 2023,
 *   "director": "Christopher Nolan",
 *   "duracion_min": 180,
 *   "calificacion": 8.9,
 *   "sinopsis": "La historia del científico estadounidense J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica."
 * }
 */
app.post('/api/peliculas', async (req, res) => {
  try {
    const { titulo, genero, anio, director, duracion_min, calificacion, sinopsis } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'El campo "titulo" es obligatorio' });
    }

    const consulta = `
      INSERT INTO peliculas (titulo, genero, anio, director, duracion_min, calificacion, sinopsis)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const valores = [
      titulo,
      genero || null,
      anio || null,
      director || null,
      duracion_min || null,
      calificacion || null,
      sinopsis || null
    ];

    const resultado = await pool.query(consulta, valores);

    return res.status(201).json({
      mensaje: 'Película creada exitosamente en PostgreSQL',
      pelicula: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error en POST /api/peliculas:', error);
    return res.status(500).json({ error: 'Error interno en el servidor', detalle: error.message });
  }
});

/**
 * [PUT] Actualización total de una película
 * Ruta: http://localhost:3000/api/peliculas/:id
 */
app.put('/api/peliculas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { titulo, genero, anio, director, duracion_min, calificacion, sinopsis } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'El campo "titulo" es obligatorio para actualizar' });
    }

    const consulta = `
      UPDATE peliculas
      SET titulo = $1, genero = $2, anio = $3, director = $4, duracion_min = $5, calificacion = $6, sinopsis = $7
      WHERE id = $8
      RETURNING *;
    `;
    const valores = [titulo, genero, anio, director, duracion_min, calificacion, sinopsis, id];

    const resultado = await pool.query(consulta, valores);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: `Película con ID ${id} no encontrada`
      });
    }

    return res.json({
      mensaje: `Película con ID ${id} actualizada completamente`,
      pelicula: resultado.rows[0]
    });
  } catch (error) {
    console.error(`Error en PUT /api/peliculas/${id}:`, error);
    return res.status(500).json({ error: 'Error interno en el servidor', detalle: error.message });
  }
});

/**
 * [PATCH] Actualización parcial de una película (solo modifica los campos enviados)
 * Ruta: http://localhost:3000/api/peliculas/:id
 * Body ejemplo: { "calificacion": 9.5 }
 */
app.patch('/api/peliculas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const camposPermitidos = ['titulo', 'genero', 'anio', 'director', 'duracion_min', 'calificacion', 'sinopsis'];
    const actualizaciones = [];
    const valores = [];

    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        valores.push(req.body[campo]);
        actualizaciones.push(`${campo} = $${valores.length}`);
      }
    });

    if (actualizaciones.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos válidos para actualizar' });
    }

    valores.push(id);
    const consulta = `
      UPDATE peliculas
      SET ${actualizaciones.join(', ')}
      WHERE id = $${valores.length}
      RETURNING *;
    `;

    const resultado = await pool.query(consulta, valores);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: `Película con ID ${id} no encontrada`
      });
    }

    return res.json({
      mensaje: `Película con ID ${id} modificada parcialmente`,
      pelicula: resultado.rows[0]
    });
  } catch (error) {
    console.error(`Error en PATCH /api/peliculas/${id}:`, error);
    return res.status(500).json({ error: 'Error interno en el servidor', detalle: error.message });
  }
});

/**
 * [DELETE] Eliminar una película por su ID
 * Ruta: http://localhost:3000/api/peliculas/:id
 */
app.delete('/api/peliculas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM peliculas WHERE id = $1 RETURNING *;', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: `Película con ID ${id} no encontrada`
      });
    }

    return res.json({
      mensaje: `Película con ID ${id} eliminada exitosamente`,
      peliculaEliminada: resultado.rows[0]
    });
  } catch (error) {
    console.error(`Error en DELETE /api/peliculas/${id}:`, error);
    return res.status(500).json({ error: 'Error interno en el servidor', detalle: error.message });
  }
});

// ==============================================================================
// 4. INICIAR EL SERVIDOR
// ==============================================================================
app.listen(PUERTO, () => {
  console.log(`====================================================`);
  console.log(`🎬 Servidor de películas activo`);
  console.log(`🚀 Escuchando en: http://localhost:${PUERTO}`);
  console.log(`🐘 Conectado a PostgreSQL: database '${process.env.DB_NAME || 'peliculas_db'}'`);
  console.log(`📋 Endpoint base: http://localhost:${PUERTO}/api/peliculas`);
  console.log(`====================================================`);
});
