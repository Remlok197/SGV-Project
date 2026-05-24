import { useState } from "react";

import NavButton from "../components/icons/NavButton";
import LogoIcon from "../components/icons/LogoIcon";
import OrdenesIcon from "../components/icons/OrdenesIcon";
import VentasIcon from "../components/icons/VentasIcon";
import ProductosIcon from "../components/icons/ProductosIcon";
import ConfiguracionIcon from "../components/icons/ConfiguracionIcon";

export default function NavBar(){
    const [activeTab, setActiveTab] = useState('ordenes');
    
    const navItems = [
        {id: 'ordenes', label: 'Órdenes', icon: OrdenesIcon},
        {id: 'ventas', label: 'Ventas', icon: VentasIcon},
        {id: 'productos', label: 'Productos', icon: ProductosIcon},
        {id: 'configuracion', label: 'Configuración', icon: ConfiguracionIcon},
    ];

    return (
        <nav className="grid grid-cols-4 place-items-center py-2 lg:py-1.5 shadow-[0_-4px_10px_rgba(0,0,0,0.07)]">
            {navItems.map((item) => {
    
                const Icono = item.icon;

                return (
                    <NavButton
                        key={item.id}
                        icon={<Icono className="size-6 md:size-7 lg:size-8" />}
                        isActive={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <span className="font-semibold text-[0.6rem] md:text-sm lg:text-base ">
                            {item.label}
                        </span>
                    </NavButton>
                );
            })}
        </nav>
    );
} 