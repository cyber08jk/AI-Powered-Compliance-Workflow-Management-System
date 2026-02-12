import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import './styles/new-theme.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <App />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3500,
                            style: {
                                background: 'white',
                                color: '#2c3e50',
                                border: '1px solid #ecf0f1',
                                borderRadius: '5px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            },
                        }}
                    />
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
)
