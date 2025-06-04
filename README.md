# 🖨️ Sistema Web de Impresiones 3D

Este proyecto es una plataforma web que permite a los usuarios visualizar, comprar y personalizar modelos 3D. Ofrece múltiples servicios como catálogo de modelos, pagos en línea (con Culqi), seguimiento de pedidos, y opciones de delivery o recojo en tienda. Funciona sobre una arquitectura SOA y es accesible desde web (móvil y escritorio a futuro).

---

## 🚀 Tecnologías principales

- Backend: **Laravel 12**
- Frontend Web: **React + Vite**
- Base de datos: **MySQL**
- API: RESTful
- Pasarela de pago: **Culqi**
- Arquitectura: **SOA (Arquitectura Orientada a Servicios)**

---

## 📁 Estructura del proyecto

```
/backend-laravel
├── app/
├── routes/
├── database/
├── tests/
└── ...

/frontend-web
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── ...
```

---

## 🧑‍💻 Instalación del Backend (Laravel)

```bash
git clone https://github.com/AurelMV/metslab-dev.git
cd backend-laravel

# Instalar dependencias
composer install

# Crear archivo de entorno
cp .env.example .env

# Configurar .env (base de datos, claves API)
php artisan key:generate

# Migraciones
php artisan migrate

# Generar un link para conectar public/storage y storage/app/public (Para ver las fotos del catálogo)
php artisan storage:link

# Servidor local
php artisan serve
```

---

## 🌐 Instalación del Frontend Web (React + Vite)

```bash
cd frontend-web

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

---

## 🌳 Flujo de ramas en Git

Usamos un flujo basado en GitFlow simplificado:

### Ramas principales

| Rama      | Descripción                            |
| --------- | -------------------------------------- |
| `main`    | Versión estable, lista para producción |
| `develop` | Integración de nuevas funcionalidades  |

### Ramas de trabajo

| Rama        | Uso                          |
| ----------- | ---------------------------- |
| `feature/x` | Nueva funcionalidad          |
| `fix/x`     | Corrección de errores        |
| `release/x` | Preparación para producción  |
| `hotfix/x`  | Corrección urgente en `main` |

### Ejemplo de creación de una rama:

```bash
git checkout develop
git checkout -b feature/personalizacion-modelo
# Desarrollar y luego:
git commit -m "Agrega personalización de modelos 3D"
git push origin feature/personalizacion-modelo
```

### Otros
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/AurelMV/metslab-dev)
