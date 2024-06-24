import React, { useState, useEffect } from 'react';
import { UserData } from '@/interfaces/tipos';

const DropdownButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<UserData | null>(null);
    const [players, setPlayers] = useState<UserData[]>([]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: UserData) => {
        setSelectedOption(option);
        setIsOpen(false); // Opcional: Cierra el menú después de seleccionar una opción
    };

    // Función para obtener los jugadores desde la API
    const fetchPlayers = async () => {
        try {
            const response = await fetch('/api/jugadores');
            const data = await response.json();
            // console.log(data);
            setPlayers(data);
        } catch (error) {
            console.error("Error fetching players:", error);
        }
    };

    // Llama a fetchPlayers cuando el componente se monte
    useEffect(() => {
        fetchPlayers();
    }, []);

    return (
        <div>
            <button onClick={toggleDropdown}>
                {selectedOption ? `Seleccionado: ${selectedOption.fullname} - ${selectedOption._id}` : 'Selecciona una opción'}
            </button>
            {isOpen && (
                <ul style={{ 
                    border: '1px solid #ccc', 
                    padding: '10px', 
                    listStyle: 'none', 
                    width: '150px', 
                    maxHeight: '200px', 
                    overflowY: 'scroll', 
                    margin: 0
                }}>
                    {players.map(player => (
                        <li 
                            key={player._id} 
                            onClick={() => handleOptionClick(player)}
                            style={{ padding: '5px', cursor: 'pointer' }}
                        >
                            {player.fullname}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DropdownButton;
