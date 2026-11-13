import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../services/api';

const Productoras = () => {
  const [productoras, setProductoras] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    estado: 'Activo',
    slogan: '',
    descripcion: ''
  });
  const [editingId, setEditingId] = useState(null);

  const fetchProductoras = async () => {
    try {
      const { data } = await api.get('/productoras');
      setProductoras(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las productoras', 'error');
    }
  };

  useEffect(() => {
    fetchProductoras();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nombre: '', estado: 'Activo', slogan: '', descripcion: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      return Swal.fire('Atención', 'El nombre es obligatorio', 'warning');
    }

    try {
      if (editingId) {
        await api.put(`/productoras/${editingId}`, formData);
        Swal.fire('Éxito', 'Productora actualizada correctamente', 'success');
      } else {
        await api.post('/productoras', formData);
        Swal.fire('Éxito', 'Productora creada correctamente', 'success');
      }
      resetForm();
      fetchProductoras();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la productora', 'error');
    }
  };

  const handleEdit = (productora) => {
    setEditingId(productora.id);
    setFormData({
      nombre: productora.nombre || '',
      estado: productora.estado || 'Activo',
      slogan: productora.slogan || '',
      descripcion: productora.descripcion || ''
    });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Deseas eliminar esta productora?',
      text: 'Esta acción no se puede revertir',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/productoras/${id}`);
        Swal.fire('Eliminado', 'Productora eliminada exitosamente', 'success');
        fetchProductoras();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la productora', 'error');
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{editingId ? 'Editar Productora' : 'Crear Productora'}</h5>
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
                    placeholder="Ej. Paramount Pictures"
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
                  <label className="form-label fw-semibold">Slogan</label>
                  <input
                    type="text"
                    name="slogan"
                    className="form-control"
                    value={formData.slogan}
                    onChange={handleChange}
                    placeholder="Slogan de la productora"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-control"
                    rows="3"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción de la empresa..."
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
              <h5 className="mb-0">Listado de Productoras</h5>
              <span className="badge bg-light text-dark">{productoras.length}</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Slogan</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productoras.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No hay productoras registradas
                        </td>
                      </tr>
                    ) : (
                      productoras.map((item) => (
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
                          <td className="text-muted small">{item.slogan || '-'}</td>
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

export default Productoras;
