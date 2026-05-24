import { Button } from "@heroui/react";
export default function NavButton({isActive, onClick, icon,children}){
    return (
        <Button className={`flex flex-col h-fit px-3 py-0 gap-0 border-none
                            data-[hover=true]:bg-transparent hover:bg-transparent
                            data-[pressed=true]:bg-transparent 
                            ${isActive ? "text-orange-500" : "text-primary"}`}
                variant="ghost"
                onClick={onClick}>
            {icon}
            {children}
        </Button>
    );
}