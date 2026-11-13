import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';

const Medias = () => {
  const [medias, setMedias] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [directores, setDirectores] = useState([]);
  const [productoras, setProductoras] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    serial: '',
    titulo: '',
    sinopsis: '',
    url: '',
    imagen: '',
    anio_estreno: new Date().getFullYear(),
    genero_id: '',
    director_id: '',
    productora_id: '',
    tipo_id: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      const [resMedias, resGen, resDir, resProd, resTip] = await Promise.all([
        api.get('/medias'),
        api.get('/generos'),
        api.get('/directores'),
        api.get('/productoras'),
        api.get('/tipos')
      ]);
      setMedias(resMedias.data);
      setGeneros(resGen.data.filter((g) => g.estado === 'Activo'));
      setDirectores(resDir.data.filter((d) => d.estado === 'Activo'));
      setProductoras(resProd.data.filter((p) => p.estado === 'Activo'));
      setTipos(resTip.data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serial.trim() || !formData.titulo.trim()) {
      return Swal.fire('Atención', 'Serial y Título son obligatorios', 'warning');
    }

    try {
      if (editingId) {
        await api.put(`/medias/${editingId}`, formData);
        Swal.fire('Éxito', 'Producción actualizada correctamente', 'success');
      } else {
        await api.post('/medias', formData);
        Swal.fire('Éxito', 'Producción creada correctamente', 'success');
      }
      resetForm();
      const res = await api.get('/medias');
      setMedias(res.data);
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'No se pudo guardar la producción', 'error');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      serial: item.serial || '',
      titulo: item.titulo || '',
      sinopsis: item.sinopsis || '',
      url: item.url || '',
      imagen: item.imagen || '',
      anio_estreno: item.anio_estreno || new Date().getFullYear(),
      genero_id: item.genero_id || '',
      director_id: item.director_id || '',
      productora_id: item.productora_id || '',
      tipo_id: item.tipo_id || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Deseas eliminar esta producción?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/medias/${id}`);
        Swal.fire('Eliminado', 'Producción eliminada exitosamente', 'success');
        const res = await api.get('/medias');
        setMedias(res.data);
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la producción', 'error');
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            {editingId ? 'Editar Película / Serie' : 'Crear Película / Serie'}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Serial (Único) *</label>
                <input
                  type="text"
                  name="serial"
                  className="form-control"
                  value={formData.serial}
                  onChange={handleChange}
                  placeholder="Ej. MOV-001"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Título *</label>
                <input
                  type="text"
                  name="titulo"
                  className="form-control"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Título de la película o serie"
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Año de Estreno</label>
                <input
                  type="number"
                  name="anio_estreno"
                  className="form-control"
                  value={formData.anio_estreno}
                  onChange={handleChange}
                  min="1900"
                  max="2100"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Género</label>
                <select
                  name="genero_id"
                  className="form-select"
                  value={formData.genero_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccione Género...</option>
                  {generos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Director</label>
                <select
                  name="director_id"
                  className="form-select"
                  value={formData.director_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccione Director...</option>
                  {directores.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombres}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Productora</label>
                <select
                  name="productora_id"
                  className="form-select"
                  value={formData.productora_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccione Productora...</option>
                  {productoras.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Tipo</label>
                <select
                  name="tipo_id"
                  className="form-select"
                  value={formData.tipo_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccione Tipo...</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">URL de Contenido</label>
                <input
                  type="url"
                  name="url"
                  className="form-control"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/ver"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">URL de Portada (Imagen)</label>
                <input
                  type="url"
                  name="imagen"
                  className="form-control"
                  value={formData.imagen}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Sinopsis</label>
                <textarea
                  name="sinopsis"
                  className="form-control"
                  rows="2"
                  value={formData.sinopsis}
                  onChange={handleChange}
                  placeholder="Breve resumen de la producción..."
                ></textarea>
              </div>

              <div className="col-12 d-flex gap-2 justify-content-end">
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancelar Edición
                  </button>
                )}
                <button type="submit" className="btn btn-primary px-4">
                  {editingId ? 'Actualizar Producción' : 'Crear Producción'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Catálogo de Películas y Series</h5>
          <span className="badge bg-light text-dark">{medias.length} registrados</span>
        </div>
        <div className="card-body">
          {medias.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No hay películas o series registradas aún.
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {medias.map((media) => (
                <div className="col" key={media.id}>
                  <div className="card h-100 shadow-sm border-0">
                    <img
                      src={
                        media.imagen ||
                        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'
                      }
                      className="card-img-top"
                      alt={media.titulo}
                      style={{ height: '220px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500';
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-dark">{media.serial}</span>
                        {media.tipo_nombre && (
                          <span className="badge bg-info text-dark">{media.tipo_nombre}</span>
                        )}
                      </div>
                      <h5 className="card-title fw-bold mb-1">{media.titulo}</h5>
                      <p className="text-muted small mb-2">Año: {media.anio_estreno || 'N/A'}</p>
                      <p className="card-text text-secondary small flex-grow-1">
                        {media.sinopsis || 'Sin descripción disponible.'}
                      </p>

                      <ul className="list-unstyled small mb-3 border-top pt-2">
                        <li>
                          <strong>Género:</strong> {media.genero_nombre || 'No asignado'}
                        </li>
                        <li>
                          <strong>Director:</strong> {media.director_nombres || 'No asignado'}
                        </li>
                        <li>
                          <strong>Productora:</strong> {media.productora_nombre || 'No asignado'}
                        </li>
                      </ul>

                      <div className="d-flex gap-2">
                        {media.url && (
                          <a
                            href={media.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Ver enlace
                          </a>
                        )}
                        <button
                          className="btn btn-sm btn-outline-primary ms-auto"
                          onClick={() => handleEdit(media)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(media.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Medias;
