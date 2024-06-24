//dashboard/profile/page.tsx
"use client"
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Parcela from "@/components/parcela";
import CantidadRecursos from "@/components/cantidad-recursos";
import { useSession } from "next-auth/react";
import axios from "axios";
import LogoutButton from "@/components/logout-button";
import MessageModal from "@/components/MessageModal";
import { Recurso, UserData } from "@/interfaces/tipos";
import TabOneContent from "@/components/enviar"; // Import the component to send messages
import TabTwoContent from "@/components/buzon";  // Import the component to view received messages

function ProfilePage() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserData | null>(null);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isReceivedMessagesOpen, setIsReceivedMessagesOpen] = useState(false); // New state for received messages modal
    const [isLoading, setIsLoading] = useState(true);
    const userEmail = session?.user?.email;
    console.log(user?.fullname);
    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/recursos`);
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userEmail]);

    async function generarRecursos() {
        try {
            await axios.post("/api/generarRecursos");
            await fetchData();
            console.log("Recursos generados");
        }
        catch (error) {
            // console.log("eeee");
            console.error(error);
        }
    }
    const nuevaConstruccion = async (pos: number, edificio: string): Promise<boolean> => {
        try {
            const response = await axios.post("/api/construirEdificio", {
                email: userEmail,
                edificio,
                pos,
            });
            if (response.status === 200) {
                await fetchData();
                return true;
            }
            else {
                // setUser(response.data);
                return false;
            }
        }
        catch (error) {
            return false;
        }
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (userEmail) {
                generarRecursos();
            }
        }, 60000);

        return () => clearInterval(intervalId);
    }, [userEmail]);
    if (isLoading) {
        return <div>Cargando...</div>; // Muestra un estado de carga mientras los datos están siendo obtenidos
    }

    return (
        <div className="flex flex-col h-screen">
            <Image
                src="/background-finaly.png"
                alt="Fondo azul"
                layout="fill"
                objectFit="cover"
                quality={100}
                className="z-0"
            />
            {/* Barra Superior */}
            <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
                <div className="flex space-x-4">
                    <button
                        className="bg-transparent cursor-pointer transition-transform duration-500 ease-in-out transform hover:scale-110"
                        onClick={() => {
                            setIsMessageModalOpen(!isMessageModalOpen);
                            setIsReceivedMessagesOpen(false);
                        }}
                    >
                        <Image
                            src="/boton-buzon.png"
                            alt="Icono buzon"
                            height={40}
                            width={40}
                            quality={100}
                        />
                    </button>
                    <button
                        className="bg-transparent cursor-pointer transition-transform duration-500 ease-in-out transform hover:scale-110"
                        onClick={() => {
                            setIsReceivedMessagesOpen(!isReceivedMessagesOpen);
                            setIsMessageModalOpen(false);
                        }}
                    >
                        <Image
                            src="/mensaje-abierto-v2.png"
                            alt="Icono buzon"
                            height={40}
                            width={40}
                            quality={100}
                        />
                    </button>
                </div>
                <LogoutButton />
            </div>

            {/* Área Central */}
            <div className="flex-grow flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10">
                        {(isMessageModalOpen || isReceivedMessagesOpen) && (
                            <div className="w-full">
                        {isMessageModalOpen && (
                            <div className="bg-customYellow border-2 border-customDarkGray p-6 rounded-md shadow-md text-lg">
                                <TabOneContent />
                            </div>
                        )}
                        {isReceivedMessagesOpen && (
                            <div className="bg-customYellow border-2 border-customDarkGray p-6 rounded-md shadow-md text-2xl text-customDarkGray">
                                <TabTwoContent activeTab="tab2" />
                            </div>
                        )}
                    </div>
                        )
                            }
                    


                    <div className="w-full flex flex-col items-center gap-y-1">
                        {/* Asignar cada elemento de la lista a las parcelas */}
                        <div className="flex -mb-8">
                            {user?.edificios?.slice(0, 3).map((edificio, index) => (
                                <Parcela
                                    key={index}
                                    estado={edificio.name}
                                    pos={index}
                                    nuevaConstruccion={nuevaConstruccion}
                                />
                            ))}
                        </div>
                        <div className="flex">
                            {user?.edificios?.slice(3, 7).map((edificio, index) => (
                                <Parcela
                                    key={index}
                                    estado={edificio.name}
                                    pos={index + 3}
                                    nuevaConstruccion={nuevaConstruccion}
                                />
                            ))}
                        </div>
                        <div className="flex -my-8">
                            {user?.edificios?.slice(7, 12).map((edificio, index) => (
                                <Parcela
                                    key={index}
                                    estado={edificio.name}
                                    pos={index + 7}
                                    nuevaConstruccion={nuevaConstruccion}
                                />
                            ))}
                        </div>
                        <div className="flex">
                            {user?.edificios?.slice(12, 16).map((edificio, index) => (
                                <Parcela
                                    key={index}
                                    estado={edificio.name}
                                    pos={index + 12}
                                    nuevaConstruccion={nuevaConstruccion}
                                />
                            ))}
                        </div>
                        <div className="flex -mt-8">
                            {user?.edificios?.slice(16, 19).map((edificio, index) => (
                                <Parcela
                                    key={index}
                                    estado={edificio.name}
                                    pos={index + 16}
                                    nuevaConstruccion={nuevaConstruccion}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra Inferior */}
            <div className="p-4 bg-gray-800 text-white">
                {user?.recursos && <CantidadRecursos resources={user.recursos} />}
            </div>
        </div>
    );

}
export default ProfilePage;
