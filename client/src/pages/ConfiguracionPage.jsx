import { useState } from "react";
import PageHeader from "../components/shared/PageHeader";
import { Users, Store, Receipt } from "lucide-react";
import UsuariosTab from "./configuracion/components/UsuariosTab";
import TabGroup from "./productos/components/tabs/TabGroup";
import Tab from "./productos/components/tabs/Tab";

export default function ConfiguracionPage() {
    const [activeTab, setActiveTab] = useState("usuarios");

    return (
        <div className="pt-6 px-6 md:px-10 lg:px-11 pb-0 h-full flex flex-col">
            <PageHeader title={"Configuración"}>
                <div className="hidden md:flex">
                    <TabGroup selectedKey={activeTab} onSelectionChange={setActiveTab}>
                        <Tab 
                            id="usuarios" 
                            title="Usuarios" 
                            icon={<Users size={16} />} 
                        />
                        <Tab 
                            id="mesas" 
                            title="Mesas" 
                            icon={<Store size={16} />} 
                        />
                        <Tab 
                            id="tickets" 
                            title="Tickets" 
                            icon={<Receipt size={16} />} 
                        />
                    </TabGroup>
                </div>
            </PageHeader>

            {/* Selector horizontal para móviles */}
            <div className="md:hidden mt-4 overflow-x-auto pb-2 flex-shrink-0">
                <TabGroup selectedKey={activeTab} onSelectionChange={setActiveTab}>
                    <Tab 
                        id="usuarios" 
                        title="Usuarios" 
                        icon={<Users size={16} />} 
                    />
                    <Tab 
                        id="mesas" 
                        title="Mesas" 
                        icon={<Store size={16} />} 
                    />
                    <Tab 
                        id="tickets" 
                        title="Tickets" 
                        icon={<Receipt size={16} />} 
                    />
                </TabGroup>
            </div>

            <div className="mt-4 flex-1 min-h-0">
                {/* Contenido de cada pestaña */}
                <div className="h-full rounded-xl bg-transparent">
                    {activeTab === "usuarios" && <UsuariosTab />}
                    
                    {activeTab === "mesas" && (
                        <div className="bg-transparent pt-6 h-full">
                            <h3 className="text-xl font-semibold text-[var(--color-primaryText)] mb-4">Ajustes de Mesas</h3>
                            <p className="text-[var(--color-secundaryText)]">Configuración de mesas y pedidos próximamente...</p>
                        </div>
                    )}

                    {activeTab === "tickets" && (
                        <div className="bg-transparent pt-6 h-full">
                            <h3 className="text-xl font-semibold text-[var(--color-primaryText)] mb-4">Configuración de Tickets</h3>
                            <p className="text-[var(--color-secundaryText)]">Configuración de formato de tickets próximamente...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}