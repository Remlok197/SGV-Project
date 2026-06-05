import NavButton from "../components/navBar/NavButton";
import OrdenesIcon from "../components/navBar/OrdenesIcon";
import VentasIcon from "../components/navBar/VentasIcon";
import ProductosIcon from "../components/navBar/ProductosIcon";
import ConfiguracionIcon from "../components/navBar/ConfiguracionIcon";
import TomarOrdenIcon from "../components/navBar/TomarOrdenIcon";
import { Link } from "react-router-dom";

export default function NavBar(){    
    const navItems = [
        {id: 'ordenes', path: '/ordenes', label: 'Órdenes', icon: OrdenesIcon},
        {id: 'ventas', path: '/ventas', label: 'Ventas', icon: VentasIcon},
        {id: 'productos', path: '/productos', label: 'Productos', icon: ProductosIcon},
        {id: 'configuracion', path: '/configuracion', label: 'Configuración', icon: ConfiguracionIcon},
    ];

    return (
        <nav className="mt-0.5 grid grid-cols-[1fr_1fr_auto_1fr_1fr] place-items-center py-2 lg:py-1.5 shadow-[0_-4px_10px_rgba(0,0,0,0.07)] relative">
            {navItems.slice(0, 2).map((item) => {
    
                const Icono = item.icon;

                return (
                    <NavButton
                        key={item.id}
                        to={item.path}
                        icon={<Icono className="size-6 md:size-7 lg:size-8" />}
                    >
                        <span className="font-semibold text-[0.6rem] md:text-sm lg:text-base">
                            {item.label}
                        </span>
                    </NavButton>
                );
            })}

            {/* Empty space to create a smaller gap between Ventas and Productos */}
            <div className="w-12 md:w-16 lg:w-20"></div>

            {navItems.slice(2, 4).map((item) => {
    
                const Icono = item.icon;

                return (
                    <NavButton
                        key={item.id}
                        to={item.path}
                        icon={<Icono className="size-6 md:size-7 lg:size-8" />}
                    >
                        <span className="font-semibold text-[0.6rem] md:text-sm lg:text-base">
                            {item.label}
                        </span>
                    </NavButton>
                );
            })}

            {/* Central Button */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 md:-top-7 lg:-top-9 z-10">
                <Link to="/tomar-orden" className="bg-primaryAction/90 rounded-full p-2 md:p-2.5 lg:p-3.5 border-[4px] border-white text-white hover:scale-105 transition-transform active:scale-95 flex items-center justify-center">
                    <TomarOrdenIcon className="size-8 md:size-9 lg:size-11" />
                </Link>
            </div>
        </nav>
    );
} 