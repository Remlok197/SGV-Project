import UserAvatar from "../components/header/UserAvatar";
import LogoIcon from "../components/header/LogoIcon";
import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";

export default function Header(){
    const { session, isAuthenticated, loading, logout } = useAuth();
    
    if (loading) return <div className="p-4 text-right text-xs text-slate-400">Cargando...</div>;
    if (!isAuthenticated) return null;
    
    return (
        <header className="mb-0.5 flex justify-between items-center p-3 lg:p-5 shadow-md bg-white">
            <div className="flex items-center gap-2 md:gap-4">
                <LogoIcon className="size-8 md:size-12 text-logo"/>
                <h1 className="font-logo text-xl md:text-[2rem] text-logo">Taquería Delgado</h1>
            </div>

            <div className="flex gap-2 md:gap-4 items-center">
                <div className="hidden sm:flex flex-col gap-2 text-xs md:text-base">
                    <time className="text-right font-text font-medium text-date">
                        {session.headerDate}
                    </time>
                    <time className="text-right font-text font-bold text-time">
                        {session.headerTime}
                    </time>
                </div>
                <div className="flex items-center gap-2">
                    <UserAvatar userName={session.userName}/>
                    <button
                        onClick={logout}
                        className="p-2 text-slate-400 hover:text-[#FB4646] rounded-full hover:bg-red-50/50 transition-colors focus:outline-none cursor-pointer"
                        title="Cerrar sesión"
                    >
                        <LogOut className="size-5 md:size-6" />
                    </button>
                </div>
            </div>
        </header>
    );
}
