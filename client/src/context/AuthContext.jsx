/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(() => authService.getCurrentSession());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        setError(null);
        setLoading(true);
        try {
            const userSession = await authService.login({ username, password });
            setSession(userSession);
            return userSession;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
            setError(msg);
            throw new Error(msg, { cause: err });
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                loading,
                error,
                isAuthenticated: !!session,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
