import { useState, useEffect } from 'react';

export function useServerTime(serverTimeOffset: number) {
    const [currentTime, setCurrentTime] = useState(() => new Date(Date.now() + serverTimeOffset));

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date(Date.now() + serverTimeOffset));
        }, 1000);

        return () => clearInterval(timer);
    }, [serverTimeOffset]);

    const headerDate = currentTime.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const headerTime = currentTime.toLocaleTimeString('es-MX', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).toUpperCase();

    return { headerDate, headerTime };
}
