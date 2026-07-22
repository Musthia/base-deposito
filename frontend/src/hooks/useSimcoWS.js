import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../auth/authStore";

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
const WS_URL = API_URL.replace(/^http/, "ws") + "/api/simco/ws";

export default function useSimcoWS(onEvent) {
    const wsRef = useRef(null);
    const reconnectRef = useRef(null);
    const token = useAuthStore((s) => s.accessToken);
    const user = useAuthStore((s) => s.user);

    const conectar = useCallback(() => {
        if (!token) return;

        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            if (reconnectRef.current) {
                clearInterval(reconnectRef.current);
                reconnectRef.current = null;
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (!data.tipo || !onEvent) return;
                const nivel = user?.nivel ?? 0;
                const esSuper = user?.superusuario ?? false;
                const esAdmin = esSuper || nivel >= 10;
                if (data.tipo === "nueva_solicitud" && (nivel >= 5 || esAdmin)) {
                    onEvent(data);
                } else if (data.tipo === "solicitud_respondida" && (nivel >= 3 || esAdmin)) {
                    onEvent(data);
                }
            } catch {
                // ignore non-JSON messages
            }
        };

        ws.onclose = () => {
            if (!reconnectRef.current) {
                reconnectRef.current = setInterval(() => {
                    conectar();
                }, 5000);
            }
        };

        ws.onerror = () => {
            ws.close();
        };

        wsRef.current = ws;
    }, [token, onEvent, user]);

    useEffect(() => {
        conectar();
        const ping = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send("ping");
            }
        }, 30000);

        return () => {
            if (reconnectRef.current) clearInterval(reconnectRef.current);
            clearInterval(ping);
            if (wsRef.current) wsRef.current.close();
        };
    }, [conectar]);
}
