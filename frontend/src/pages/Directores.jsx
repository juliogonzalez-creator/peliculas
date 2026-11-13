import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';

const Directores = () => {
  const [directores, setDirectores] = useState([]);
  const [formData, setFormData] = useState({ nombres: '', estado: 'Activo' });
  const [editingId, setEditingId] = useState(null);

  const fetchDirectores = async () => {
    try {
      const { data } = await api.get('/directores');
      setDirectores(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los directores', 'error');
    }
  };

  useEffect(() => {
    fetchDirectores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nombres: '', estado: 'Activo' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombres.trim()) {
      return Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
    }

    try {
      if (editingId) {
        await api.put(`/directores/${editingId}`, formData);
        Swal.fire('Éxito', 'Director actualizado correctamente', 'success');
      } else {
        await api.post('/directores', formData);
        Swal.fire('Éxito', 'Director creado correctamente', 'success');
      }
      resetForm();
      fetchDirectores();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar el director', 'error');
    }
  };

  const handleEdit = (director) => {
    setEditingId(director.id);
    setFormData({
      nombres: director.nombres || '',
      estado: director.estado || 'Activo'
    });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Deseas eliminar este director?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/directores/${id}`);
        Swal.fire('Eliminado', 'Director eliminado exitosamente', 'success');
        fetchDirectores();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el director', 'error');
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{editingId ? 'Editar Director' : 'Crear Director'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    className="form-control"
                    value={formData.nombres}
                    onChange={handleChange}
                    placeholder="Ej. Steven Spielberg"
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
              <h5 className="mb-0">Listado de Directores</h5>
              <span className="badge bg-light text-dark">{directores.length}</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Nombres</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {directores.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">
                          No hay directores registrados
                        </td>
                      </tr>
                    ) : (
                      directores.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td className="fw-semibold">{item.nombres}</td>
                          <td>
                            <span
                              className={`badge ${
                                item.estado === 'Activo' ? 'bg-success' : 'bg-secondary'
                              }`}
                            >
                              {item.estado}
                            </span>
                          </td>
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

export default Directores;
