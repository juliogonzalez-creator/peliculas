require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'peliculas_db'
});

app.use(cors());
app.use(express.json());

const initializeDatabase = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS generos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      estado VARCHAR(20) DEFAULT 'Activo',
      descripcion TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS directores (
      id SERIAL PRIMARY KEY,
      nombres VARCHAR(150) NOT NULL,
      estado VARCHAR(20) DEFAULT 'Activo',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS productoras (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL,
      estado VARCHAR(20) DEFAULT 'Activo',
      slogan TEXT,
      descripcion TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS tipos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      descripcion TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS medias (
      id SERIAL PRIMARY KEY,
      serial VARCHAR(100) UNIQUE NOT NULL,
      titulo VARCHAR(200) NOT NULL,
      sinopsis TEXT,
      url VARCHAR(255),
      imagen VARCHAR(255),
      anio_estreno INT,
      genero_id INT REFERENCES generos(id) ON DELETE SET NULL,
      director_id INT REFERENCES directores(id) ON DELETE SET NULL,
      productora_id INT REFERENCES productoras(id) ON DELETE SET NULL,
      tipo_id INT REFERENCES tipos(id) ON DELETE SET NULL,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS peliculas (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      genero VARCHAR(100),
      anio INT,
      director VARCHAR(150),
      duracion_min INT,
      calificacion NUMERIC(3,1),
      sinopsis TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(schema);
};

initializeDatabase().catch(console.error);

app.get('/api/generos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM generos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/generos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM generos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Género no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generos', async (req, res) => {
  try {
    const { nombre, estado = 'Activo', descripcion = '' } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const query = `
      INSERT INTO generos (nombre, estado, descripcion)
      VALUES ($1, $2, $3) RETURNING *
    `;
    const result = await pool.query(query, [nombre, estado, descripcion]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/generos/:id', async (req, res) => {
  try {
    const { nombre, estado, descripcion } = req.body;
    const query = `
      UPDATE generos
      SET nombre = COALESCE($1, nombre),
          estado = COALESCE($2, estado),
          descripcion = COALESCE($3, descripcion),
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $4 RETURNING *
    `;
    const result = await pool.query(query, [nombre, estado, descripcion, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Género no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/generos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM generos WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Género no encontrado' });
    res.json({ message: 'Género eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/directores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM directores ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/directores/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM directores WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Director no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/directores', async (req, res) => {
  try {
    const { nombres, estado = 'Activo' } = req.body;
    if (!nombres) return res.status(400).json({ error: 'Los nombres son requeridos' });
    const query = `
      INSERT INTO directores (nombres, estado)
      VALUES ($1, $2) RETURNING *
    `;
    const result = await pool.query(query, [nombres, estado]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/directores/:id', async (req, res) => {
  try {
    const { nombres, estado } = req.body;
    const query = `
      UPDATE directores
      SET nombres = COALESCE($1, nombres),
          estado = COALESCE($2, estado),
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $3 RETURNING *
    `;
    const result = await pool.query(query, [nombres, estado, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Director no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/directores/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM directores WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Director no encontrado' });
    res.json({ message: 'Director eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/productoras', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productoras ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/productoras/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productoras WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Productora no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/productoras', async (req, res) => {
  try {
    const { nombre, estado = 'Activo', slogan = '', descripcion = '' } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const query = `
      INSERT INTO productoras (nombre, estado, slogan, descripcion)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const result = await pool.query(query, [nombre, estado, slogan, descripcion]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/productoras/:id', async (req, res) => {
  try {
    const { nombre, estado, slogan, descripcion } = req.body;
    const query = `
      UPDATE productoras
      SET nombre = COALESCE($1, nombre),
          estado = COALESCE($2, estado),
          slogan = COALESCE($3, slogan),
          descripcion = COALESCE($4, descripcion),
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $5 RETURNING *
    `;
    const result = await pool.query(query, [nombre, estado, slogan, descripcion, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Productora no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/productoras/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM productoras WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Productora no encontrada' });
    res.json({ message: 'Productora eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tipos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tipos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tipos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tipos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tipos', async (req, res) => {
  try {
    const { nombre, descripcion = '' } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const query = `
      INSERT INTO tipos (nombre, descripcion)
      VALUES ($1, $2) RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tipos/:id', async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const query = `
      UPDATE tipos
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $3 RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tipos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tipos WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json({ message: 'Tipo eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/medias', async (req, res) => {
  try {
    const query = `
      SELECT m.*,
             g.nombre AS genero_nombre,
             d.nombres AS director_nombres,
             p.nombre AS productora_nombre,
             t.nombre AS tipo_nombre
      FROM medias m
      LEFT JOIN generos g ON m.genero_id = g.id
      LEFT JOIN directores d ON m.director_id = d.id
      LEFT JOIN productoras p ON m.productora_id = p.id
      LEFT JOIN tipos t ON m.tipo_id = t.id
      ORDER BY m.id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/medias/:id', async (req, res) => {
  try {
    const query = `
      SELECT m.*,
             g.nombre AS genero_nombre,
             d.nombres AS director_nombres,
             p.nombre AS productora_nombre,
             t.nombre AS tipo_nombre
      FROM medias m
      LEFT JOIN generos g ON m.genero_id = g.id
      LEFT JOIN directores d ON m.director_id = d.id
      LEFT JOIN productoras p ON m.productora_id = p.id
      LEFT JOIN tipos t ON m.tipo_id = t.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Media no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/medias', async (req, res) => {
  try {
    const { serial, titulo, sinopsis, url, imagen, anio_estreno, genero_id, director_id, productora_id, tipo_id } = req.body;
    if (!serial || !titulo) return res.status(400).json({ error: 'Serial y título son requeridos' });
    const query = `
      INSERT INTO medias (serial, titulo, sinopsis, url, imagen, anio_estreno, genero_id, director_id, productora_id, tipo_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      serial,
      titulo,
      sinopsis || '',
      url || '',
      imagen || '',
      anio_estreno ? parseInt(anio_estreno, 10) : null,
      genero_id ? parseInt(genero_id, 10) : null,
      director_id ? parseInt(director_id, 10) : null,
      productora_id ? parseInt(productora_id, 10) : null,
      tipo_id ? parseInt(tipo_id, 10) : null
    ];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/medias/:id', async (req, res) => {
  try {
    const { serial, titulo, sinopsis, url, imagen, anio_estreno, genero_id, director_id, productora_id, tipo_id } = req.body;
    const query = `
      UPDATE medias
      SET serial = COALESCE($1, serial),
          titulo = COALESCE($2, titulo),
          sinopsis = COALESCE($3, sinopsis),
          url = COALESCE($4, url),
          imagen = COALESCE($5, imagen),
          anio_estreno = COALESCE($6, anio_estreno),
          genero_id = $7,
          director_id = $8,
          productora_id = $9,
          tipo_id = $10,
          fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $11 RETURNING *
    `;
    const values = [
      serial,
      titulo,
      sinopsis,
      url,
      imagen,
      anio_estreno ? parseInt(anio_estreno, 10) : null,
      genero_id ? parseInt(genero_id, 10) : null,
      director_id ? parseInt(director_id, 10) : null,
      productora_id ? parseInt(productora_id, 10) : null,
      tipo_id ? parseInt(tipo_id, 10) : null,
      req.params.id
    ];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Media no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/medias/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM medias WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Media no encontrada' });
    res.json({ message: 'Media eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/peliculas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM peliculas ORDER BY id ASC');
    res.json({ total: result.rows.length, peliculas: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/peliculas', async (req, res) => {
  try {
    const { titulo, genero, anio, director, duracion_min, calificacion, sinopsis } = req.body;
    const query = `
      INSERT INTO peliculas (titulo, genero, anio, director, duracion_min, calificacion, sinopsis)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const result = await pool.query(query, [titulo, genero, anio, director, duracion_min, calificacion, sinopsis]);
    res.status(201).json({ mensaje: 'Película creada', pelicula: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
