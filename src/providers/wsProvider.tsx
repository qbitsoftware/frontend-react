import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type WSContextType = {
    ws: WebSocket | null;
    connected: boolean;
};

const WSContext = createContext<WSContextType>({ ws: null, connected: false });

export const useWS = () => useContext(WSContext);

type WSProviderProps = {
    url: string;
    children: React.ReactNode;
    onMessage?: (data: any) => void;
};

export const WSProvider: React.FC<WSProviderProps> = ({ url, children, onMessage }) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const shouldReconnectRef = useRef(true);
    const reconnectInterval = 3000
    const maxReconnectAttempts = 10;

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        wsRef.current = new WebSocket(url + "?token=" + import.meta.env.VITE_TOURNAMENT10_PUBLIC_KEY);

        wsRef.current.onopen = () => {
            setConnected(true);
            reconnectAttemptsRef.current = 0;
        };

        wsRef.current.onclose = () => {
            setConnected(false);

            if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
                reconnectAttemptsRef.current++;
                // console.log(`WebSocket disconnected. Reconnecting in ${reconnectInterval}ms... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, reconnectInterval);
            } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                console.log("Max reconnection attempts reached");
            }
        };

        wsRef.current.onerror = (error) => {
            console.log("WebSocket error:", error);
            setConnected(false);
        };

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (onMessage) {
                    onMessage(data);
                }
            } catch (e) {
                console.log("Failed to parse WebSocket message", e);
            }
        };
    }, [url, onMessage, reconnectInterval, maxReconnectAttempts]);

    useEffect(() => {
        shouldReconnectRef.current = true;
        reconnectAttemptsRef.current = 0;
        connect();

        return () => {
            shouldReconnectRef.current = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connect]);

    return (
        <WSContext.Provider value={{ ws: wsRef.current, connected }}>
            {children}
        </WSContext.Provider>
    );
};
