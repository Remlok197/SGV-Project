import { useState, useEffect } from "react";
import { authService } from "../services/authService";

export function useAuth() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMockData = async () => {
            try {
                const userSession = await authService.getCurrentSession();
                setSession(userSession);
            } catch (err) {
                setError(err.message || 'Error al cargar el mock');
            } finally {
                setLoading(false);
            }
        };

        fetchMockData();
    }, []); 

    return {
        session,
        loading,
        error,
        isAuthenticated: !!session,
    };
}