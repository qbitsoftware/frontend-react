import React, { createContext, useContext, useEffect, useRef, useState } from "react";

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

    useEffect(() => {
        if (!wsRef.current) {
            wsRef.current = new WebSocket(url + "?token=" + import.meta.env.VITE_TOURNAMENT10_PUBLIC_KEY);
            wsRef.current.onopen = () => {
                setConnected(true);
            };
            wsRef.current.onclose = () => {
                setConnected(false);
            };
            wsRef.current.onerror = () => {
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

        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [url]);

    return (
        <WSContext.Provider value={{ ws: wsRef.current, connected }}>
            {children}
        </WSContext.Provider>
    );
};
