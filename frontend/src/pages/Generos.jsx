import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';

const Generos = () => {
  const [generos, setGeneros] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', estado: 'Activo', descripcion: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchGeneros = async () => {
    try {
      const { data } = await api.get('/generos');
      setGeneros(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los géneros', 'error');
    }
  };

  useEffect(() => {
    fetchGeneros();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nombre: '', estado: 'Activo', descripcion: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      return Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
    }

    try {
      if (editingId) {
        await api.put(`/generos/${editingId}`, formData);
        Swal.fire('Éxito', 'Género actualizado correctamente', 'success');
      } else {
        await api.post('/generos', formData);
        Swal.fire('Éxito', 'Género creado correctamente', 'success');
      }
      resetForm();
      fetchGeneros();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar el género', 'error');
    }
  };

  const handleEdit = (genero) => {
    setEditingId(genero.id);
    setFormData({
      nombre: genero.nombre || '',
      estado: genero.estado || 'Activo',
      descripcion: genero.descripcion || ''
    });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Deseas eliminar este género?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/generos/${id}`);
        Swal.fire('Eliminado', 'Género eliminado exitosamente', 'success');
        fetchGeneros();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el género', 'error');
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{editingId ? 'Editar Género' : 'Crear Género'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    className="form-control"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Terror, Comedia"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Estado</label>
                  <select
                    name="estado"
                    className="form-select"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-control"
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción del género..."
                  ></textarea>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Listado de Géneros</h5>
              <span className="badge bg-light text-dark">{generos.length}</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Descripción</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generos.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No hay géneros registrados
                        </td>
                      </tr>
                    ) : (
                      generos.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td className="fw-semibold">{item.nombre}</td>
                          <td>
                            <span
                              className={`badge ${
                                item.estado === 'Activo' ? 'bg-success' : 'bg-secondary'
                              }`}
                            >
                              {item.estado}
                            </span>
                          </td>
                          <td className="text-muted small">{item.descripcion || '-'}</td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(item)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(item.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generos;
