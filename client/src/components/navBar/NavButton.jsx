import { NavLink } from "react-router-dom";

export default function NavButton({ to, icon, children }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `
                flex flex-col h-fit px-3 py-0 gap-0 items-center cursor-pointer
                transition-all duration-200 ease-in-out
                active:scale-90 active:opacity-75
                ${isActive ? "text-primaryAction" : "text-primaryText"}
            `}
        >
            {icon}
            {children}
        </NavLink>
    );
}