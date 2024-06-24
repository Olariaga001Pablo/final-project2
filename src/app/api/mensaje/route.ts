//api/mensaje/route.ts
import { connectDB } from "@/libs/mongodb";
import Message from "@/models/mensajes";
import User from "@/models/user";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Recurso, UserData } from "@/interfaces/tipos";

export async function GET() {
    try {
        await connectDB();
        const session = await getServerSession(options);
        if (!session) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const userSession = session?.user as UserData;
        // const email = user.email;
        const id = userSession._id;
        const user = await User.findOne({ _id: id });
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }
        // Obtener los mensajes
        const messages = await Message.find({ _id: { $in: user.messages } })
            .populate('sender', 'fullname') // Solo fullname de sender
            .populate('receiver', 'fullname'); // Solo fullname de receiver
        // console.log(messages);
        // Procesar los mensajes
        const mensajesProcesados = messages.map(message => {
            return {
                emisor: message.sender.fullname,
                receptor: message.receiver.fullname,
                contenido: message.content,
                fecha: message.timestamp,
                recursos: message.recursos
            };
        });

        return NextResponse.json({ mensajes: mensajesProcesados }, { status: 200 });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await connectDB();
    try {
        const session = await getServerSession(options);

        if (!session) {
            return NextResponse.json(
                { message: "No hay sesion activa" },
                { status: 404 }
            );
        }

        const userSession = session?.user as UserData;
        // const email = user.email;
        const senderId = userSession._id;
        const { receiverId, content, resources }: { receiverId: string, content: string, resources: Recurso[] } = await request.json();
        console.log(resources);
        // Crear un nuevo mensaje utilizando el esquema de mensaje
        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            timestamp: new Date(),
            recursos: resources,
        });

        const savedMessage = await message.save();

        // Añadir el mensaje al usuario receptor
        await User.findByIdAndUpdate(receiverId, {
            $push: { messages: savedMessage._id }
        });
        const sender = await User.findById(senderId) as UserData;
        const receiver = await User.findById(receiverId) as UserData;

        if (!sender || !receiver) {
            return NextResponse.json({ message: "Sender or receiver not found" }, { status: 404 });
        }

        const recursosEnviados = {
            oro: 0,
            comida: 0,
            piedra: 0,
            madera: 0,
            tropas: 0,
        };

        for (const recurso of resources) {
            switch(recurso.name) {
                case "oro":
                    recursosEnviados.oro += recurso.quantity;
                    break;
                case "comida":
                    recursosEnviados.comida += recurso.quantity;
                    break;
                case "piedra":
                    recursosEnviados.piedra += recurso.quantity;
                    break;
                case "madera":
                    recursosEnviados.madera += recurso.quantity;
                    break;
                case "tropas":
                    recursosEnviados.tropas += recurso.quantity;
                    break;
                default:
                    break;
            }
        }
        // console.log(recursosEnviados);
        receiver.recursos.forEach((recurso: Recurso) => {
            switch (recurso.name) {
                case "oro":
                    recurso.quantity += recursosEnviados.oro;
                    break;
                case "comida":
                    recurso.quantity += recursosEnviados.comida;
                    break;
                case "piedra":
                    recurso.quantity += recursosEnviados.piedra;
                    break;
                case "madera":
                    recurso.quantity += recursosEnviados.madera;
                    break;
                case "tropas":
                    recurso.quantity += recursosEnviados.tropas;
                    break;
                default:
                    break;
            }
        });
        sender.recursos.forEach((recurso: Recurso) => {
            switch (recurso.name) {
                case "oro":
                    recurso.quantity -= recursosEnviados.oro;
                    break;
                case "comida":
                    recurso.quantity -= recursosEnviados.comida;
                    break;
                case "piedra":
                    recurso.quantity -= recursosEnviados.piedra;
                    break;
                case "madera":
                    recurso.quantity -= recursosEnviados.madera;
                    break;
                case "tropas":
                    recurso.quantity -= recursosEnviados.tropas;
                    break;
                default:
                    break;
            }
        });
        await User.findByIdAndUpdate(sender._id, {
            recursos: sender.recursos
        });
        await User.findByIdAndUpdate(receiver._id, {
            recursos: receiver.recursos
        });
        // console.log(receiver.recursos);
        return NextResponse.json({ message: "Message created", data: savedMessage }, { status: 201 });
    } catch (error) {
        console.error("Error saving message:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}