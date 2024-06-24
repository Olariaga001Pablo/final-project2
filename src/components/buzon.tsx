import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Recurso {
    _id: string;
    name: "oro" | "comida" | "piedra" | "madera" | "tropas";
    quantity: number;
}

interface mensaje {
    emisor: string;
    receptor: string;
    contenido: string;
    fecha: Date;
    recursos: Recurso[];
}

const TabTwoContent = ({ activeTab = 'tab1'}) => {
    const [messages, setMessages] = useState<mensaje[]>([]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`/api/mensaje`);
            setMessages(response.data.mensajes);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        if (activeTab === 'tab2') {
            fetchMessages();
        }
    }, [activeTab]);

    return (
        <div className=''>
            {messages.length === 0 ? (
                <p>No hay mensajes disponibles.</p>
            ) : (
                <ul className='max-h-48 overflow-y-auto border border-gray-300 rounded-md shadow-md'>
                    {messages.map((message, index) => (
                        <li 
                            key={index} 
                            className="bg-white px-3 py-2 cursor-pointer hover:bg-gray-200 text-gray-900 border-b border-gray-200"
                        >
                            <p><strong>Remitente:</strong> {message.emisor}</p>
                            <p><strong>Contenido:</strong> {message.contenido}</p>
                            <p><strong>Fecha:</strong> {new Date(message.fecha).toLocaleString()}</p>
                            <p><strong>Recursos:</strong> {message.recursos.map((resource, idx) => (
                                <span key={idx}>{resource.name} ({resource.quantity}) </span>
                            ))}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TabTwoContent;
