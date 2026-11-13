import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/">
          <i className="bi bi-film me-2"></i>PeliculasApp
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Medias (Películas/Series)
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/generos">
                Géneros
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/directores">
                Directores
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/productoras">
                Productoras
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/tipos">
                Tipos
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
