import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        const newSocket = io(window.location.origin, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('[Socket] Connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            setConnected(false);
        });

        // Real-time event handlers
        newSocket.on('issue:created', (issue) => {
            toast.success(`New issue created: ${issue.title}`, { icon: '📋' });
        });

        newSocket.on('issue:transitioned', (data) => {
            toast(`Issue transitioned: ${data.previousStatus} → ${data.newStatus}`, { icon: '🔄' });
        });

        newSocket.on('sla:breach', (data) => {
            toast.error(`⚠️ SLA Breach: ${data.title}`, { duration: 6000 });
        });

        newSocket.on('issue:updated', () => {
            toast('An issue was updated', { icon: '✏️' });
        });

        newSocket.on('issue:deleted', () => {
            toast('An issue was deleted', { icon: '🗑️' });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
