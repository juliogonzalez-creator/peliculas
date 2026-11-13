import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Medias from './pages/Medias';
import Generos from './pages/Generos';
import Directores from './pages/Directores';
import Productoras from './pages/Productoras';
import Tipos from './pages/Tipos';

function App() {
  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Medias />} />
          <Route path="/generos" element={<Generos />} />
          <Route path="/directores" element={<Directores />} />
          <Route path="/productoras" element={<Productoras />} />
          <Route path="/tipos" element={<Tipos />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
