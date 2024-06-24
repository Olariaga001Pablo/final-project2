//components/enviar.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserData, Recurso } from '@/interfaces/tipos';  // Asegúrate de importar los tipos desde la ubicación correcta

const TabOneContent = () => {
    const [receptor, setReceptor] = useState<UserData | null>(null);
    const [contenido, setContenido] = useState('');
    const [recursos, setRecursos] = useState<Recurso[]>([]);
    const [resourceType, setResourceType] = useState<Recurso['name']>('oro');
    const [resourceQuantity, setResourceQuantity] = useState<number | ''>('');
    const [players, setPlayers] = useState<UserData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    console.log(recursos);
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: UserData) => {
        setReceptor(option);
        setIsOpen(false); // Opcional: Cierra el menú después de seleccionar una opción
    };

    // Función para obtener los jugadores desde la API
    const fetchPlayers = async () => {
        try {
            const response = await fetch('/api/jugadores');
            const data = await response.json();
            setPlayers(data);
        } catch (error) {
            console.error("Error fetching players:", error);
        }
    };

    // Llama a fetchPlayers cuando el componente se monte
    useEffect(() => {
        fetchPlayers();
    }, []);

    const handleAddResource = () => {
        if (resourceType && resourceQuantity) {
            setRecursos([...recursos, { name: resourceType, quantity: resourceQuantity }]);
            setResourceType('oro');
            setResourceQuantity('');
        }
    };

    const handleSendMessage = async () => {
        if (receptor) {
            try {
                await axios.post('/api/mensaje', {
                    receiverId: receptor._id,
                    content: contenido,
                    resources: recursos,
                });
                alert('Mensaje enviado correctamente');
                setReceptor(null);
                setContenido('');
                setRecursos([]);
            } catch (error) {
                console.error("Error sending message:", error);
                alert('Hubo un error al enviar el mensaje');
            }
        } else {
            console.log("Seleccionar un jugador");
        }
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block text-customDarkGray mb-2">Para:</label>
                <div className="relative">
                    <button 
                        onClick={toggleDropdown} 
                        className="w-full px-3 py-2 border rounded-md text-customDarkGray bg-white"
                    >
                        {receptor ? receptor.fullname : 'Selecciona un receptor'}
                    </button>
                    {isOpen && (
                        <ul 
                            className="absolute border border-gray-300 bg-white w-full max-h-48 overflow-y-auto mt-1 rounded-md shadow-lg z-10"
                        >
                            {players.map((user) => (
                                <li 
                                    key={user._id} 
                                    onClick={() => handleOptionClick(user)} 
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-200 text-customDarkGray"
                                >
                                    {user.fullname}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Contenido:</label>
                <textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-customDarkGray"
                ></textarea>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Recursos:</label>
                <div className="flex mb-2">
                    <select
                        value={resourceType}
                        onChange={(e) => setResourceType(e.target.value as Recurso['name'])}
                        className="w-1/2 px-3 py-2 border rounded-md text-customDarkGray mr-2"
                    >
                        <option value="oro">Oro</option>
                        <option value="comida">Comida</option>
                        <option value="piedra">Piedra</option>
                        <option value="madera">Madera</option>
                        <option value="tropas">Tropas</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Cantidad"
                        value={resourceQuantity}
                        onChange={(e) => setResourceQuantity(Number(e.target.value))}
                        className="w-1/2 px-3 py-2 border rounded-md text-customDarkGray"
                    />
                    <button
                        onClick={handleAddResource}
                        className="bg-customSawmillColor hover:bg-green-600 text-white px-4 py-2 rounded-md ml-2 transition-transform duration-500 ease-in-out transform hover:scale-95"
                    >
                        Agregar
                    </button>
                </div>
                {/* <ul>
                    {recursos.map((recurso, index) => (
                        <li key={index} className="text-gray-700">{`${recurso.name}: ${recurso.quantity}`}</li>
                    ))}
                </ul> */}
            </div>
            <button
                onClick={handleSendMessage}
                className="bg-blue-500 hover:bg-customBarracksColor text-white px-4 py-2 rounded-md w-full transition-transform duration-500 ease-in-out transform hover:scale-95"
            >
                Enviar
            </button>
        </div>
    );
};

export default TabOneContent;
