# Sistema de Gestión de Películas y Series

Aplicación web desarrollada con Node.js, Express, PostgreSQL y ReactJs.

## Requisitos
- Node.js (v18+)
- PostgreSQL

## Configuración y Ejecución

### 1. Backend (API REST)
```bash
npm install
npm start
```
El servidor se ejecuta en `http://localhost:3000`.

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
La aplicación web se ejecuta en `http://localhost:5173`.

## Módulos
- **Medias**: Gestión completa de películas y series con relaciones.
- **Géneros**: Creación, edición, listado y eliminación de géneros.
- **Directores**: Creación, edición, listado y eliminación de directores.
- **Productoras**: Creación, edición, listado y eliminación de productoras.
- **Tipos**: Creación, edición, listado y eliminación de tipos (Película, Serie).
