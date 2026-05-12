# Sistema Gestor de Ventas y Predicciones para la taqueria Delgado
¡Bienvenido al repositorio oficial del sistema de gestión para taquerías! Este proyecto está diseñado para optimizar el flujo de trabajo entre caja, meseros y parrilla mediante una arquitectura local robusta y eficiente.

## Estructura del Proyecto
Hemos organizado el código en contenedores para facilitar el despliegue en la Raspberry Pi.


taqueria-pos/
├── client/                # Frontend en React (Vite) + Tailwind CSS  
│   ├── src/  
│   │   ├── components/    # Botones, tarjetas de platillos, modales  
│   │   ├── hooks/         # Lógica reutilizable  
│   │   ├── pages/         # Vistas: Caja, Mesas, Cocina, Estadísticas  
│   │   └── services/      # Llamadas a la API y WebSockets  
│   ├── public/            # Assets, iconos de PWA  
│   └── package.json  
├── server/                # Backend en Python (FastAPI/Flask)  
│   ├── app/  
│   │   ├── models/        # Esquemas de Base de Datos  
│   │   ├── routes/        # Endpoints (Ventas, Comandas, Inventario)  
│   │   └── core/          # Lógica de predicción y sockets  
│   ├── venv/              # Entorno virtual  
│   └── requirements.txt  
├── database/              # Scripts de inicialización (PostgreSQL)  
│   └── init.sql  
├── infra/                 # Configuración de hardware y despliegue  
│   ├── docker-compose.yml # Orquestación de contenedores  
│   └── nginx.conf         # Servidor web para la red local  
└── README.md  

## Stack Tecnológico
Frontend: React 18 + Vite (Configurado como PWA para dispositivos móviles).

Backend: Python 3.12+ (Manejo de lógica de negocio y comunicación en tiempo real).

Base de Datos: PostgreSQL (Ejecutándose en contenedor Docker).

Servidor: Raspberry Pi 5 con Debian 13.

Comunicación: WebSockets para actualización instantánea de comandas.

## Requerimientos Clave
Flujo Dual: Gestión separada para pedidos en caja (pago inmediato) y pedidos en mesa (pago diferido).

Modo Offline: Funcionamiento garantizado en Red Local (LAN) sin dependencia de internet.

Analítica: Motor de estadísticas para predicción de demanda de insumos.

Portabilidad: Infraestructura compacta diseñada para ser resguardada diariamente.

## Instalación y Desarrollo
Clonar el repositorio:
`git clone https://github.com/Remlok197/SGV-Project.git`  
Levantar entorno con Docker:
`docker-compose up --build`  
Acceso local:

Caja/Admin: http://localhost:5173

API Docs: http://localhost:8000/docs

👥 Equipo de Desarrollo
Emilio Delgado Alcantar - Project Manager & Backend Developer.

Fabian Torres Juarez - UI/UX Designer & Frontend Developer.
