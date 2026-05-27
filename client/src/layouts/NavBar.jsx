import NavButton from "../components/navBar/NavButton";
import OrdenesIcon from "../components/navBar/OrdenesIcon";
import VentasIcon from "../components/navBar/VentasIcon";
import ProductosIcon from "../components/navBar/ProductosIcon";
import ConfiguracionIcon from "../components/navBar/ConfiguracionIcon";

export default function NavBar(){    
    const navItems = [
        {id: 'ordenes', path: '/ordenes', label: 'Órdenes', icon: OrdenesIcon},
        {id: 'ventas', path: '/ventas', label: 'Ventas', icon: VentasIcon},
        {id: 'productos', path: '/productos', label: 'Productos', icon: ProductosIcon},
        {id: 'configuracion', path: '/configuracion', label: 'Configuración', icon: ConfiguracionIcon},
    ];

    return (
        <nav className="mt-0.5 grid grid-cols-4 place-items-center py-2 lg:py-1.5 shadow-[0_-4px_10px_rgba(0,0,0,0.07)]">
            {navItems.map((item) => {
    
                const Icono = item.icon;

                const isItemActive = location.pathname.startsWith(item.path);

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
        </nav>
    );
} 