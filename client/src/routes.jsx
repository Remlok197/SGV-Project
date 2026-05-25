import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import OrdenesPage from './pages/OrdenesPage';
import VentasPage from './pages/VentasPage';
import ProductosPage from './pages/productos/ProductosPage';
import ConfiguracionPage from './pages/ConfiguracionPage';

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true, 
                element: <Navigate to="/productos" replace />
            },
            {
                path: "ordenes",
                element: <OrdenesPage />
            },
            {
                path: "ventas",
                element: <VentasPage />
            },
            {
                path: "productos",
                element: <ProductosPage />
            },
            {
                path: "configuracion",
                element: <ConfiguracionPage />
            }
        ]
    }
]);