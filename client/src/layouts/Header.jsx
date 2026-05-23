import UserAvatar from "../components/icons/UserAvatar";
import LogoIcon from "../components/icons/LogoIcon";
import {useAuth} from "../hooks/useAuth";
export default function Header(){
    const { session, isAuthenticated, loading} = useAuth();
    

    if (loading) return <div className="p-4 text-right text-xs text-slate-400">Cargando...</div>;
    if (!isAuthenticated) return null;
    
    return (
        <header className="flex justify-between items-center p-4 md:p-6 shadow-md">
            <div className="flex items-center gap-2 md:gap-4">
                <LogoIcon className="size-8 md:size-12 text-logo"/>
                <h1 className="font-logo text-xl md:text-[2rem] text-logo">Taquería Delgado</h1>
            </div>

            <div className="flex gap-2 md:gap-4">
                <div className="hidden sm:flex flex-col gap-2 text-xs md:text-base">
                    <time className="text-right font-tex font-medium text-date">
                        {session.headerDate}
                    </time>
                    <time className="text-right font-text font-bold text-time">
                        {session.headerTime}
                    </time>
                </div>
                <UserAvatar userName={session.userName}/>
            </div>
        </header>
    );
}
