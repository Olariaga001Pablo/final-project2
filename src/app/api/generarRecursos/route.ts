//api/generarRecursos/route.ts
import { connectDB } from "@/libs/mongodb";
import { getServerSession } from "next-auth";
import User from "@/models/user";
import mongoose from "mongoose";
import { options } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { Recurso, UserData } from "@/interfaces/tipos";

export async function POST() {
    try {
        await connectDB();
        const session = await getServerSession(options);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        const userSession = session?.user as UserData;
        // const email = user.email;
        const id = userSession._id;
        // console.log(id);
        const user = await User.findOne({ _id: id });
        // console.log(user.recursos);
        
        // Inicializar los recursos generados
        const recursosGenerados = {
            oro: 0,
            comida: 0,
            piedra: 0,
            madera: 0,
            tropas: 0,
        };

        for (const edificio of user.edificios) {
            switch (edificio.name) {
                case "Granja":
                    recursosGenerados.comida += edificio.level * 10;
                    break;
                case "Mina":
                    recursosGenerados.oro += edificio.level * 10;
                    break;
                case "Aserradero":
                    recursosGenerados.madera += edificio.level * 10;
                    break;
                case "Cantera":
                    recursosGenerados.piedra += edificio.level * 10;
                    break;
                case "Cuartel":
                    recursosGenerados.tropas += edificio.level * 1;
                    break;
                case "Urbano":
                    recursosGenerados.oro += edificio.level * 5;
                    recursosGenerados.comida += edificio.level * 5;
                    recursosGenerados.madera += edificio.level * 5;
                    recursosGenerados.piedra += edificio.level * 5;
                    break;
                default:
                    break;
            }
        }
        // console.log(recursosGenerados);
        user.recursos.forEach((recurso: Recurso) => {
            switch (recurso.name) {
                case "oro":
                    recurso.quantity += recursosGenerados.oro;
                    break;
                case "comida":
                    recurso.quantity += recursosGenerados.comida;
                    break;
                case "piedra":
                    recurso.quantity += recursosGenerados.piedra;
                    break;
                case "madera":
                    recurso.quantity += recursosGenerados.madera;
                    break;
                case "tropas":
                    recurso.quantity += recursosGenerados.tropas;
                    break;
                default:
                    break;
            }
        });
        // console.log(user.recursos);
        const updatedUser = await User.findOneAndUpdate(
            { _id: id},
            // { email },
            { recursos: user.recursos },
            { new: true } // Devuelve el documento después de la actualización
        );
        // console.log(updatedUser.recursos);
        // const pruebaUserBS = await User.findOne({ _id: id });
        // console.log("Traido de la base:");
        // console.log(pruebaUserBS?.recursos);
        return NextResponse.json(updatedUser.recursos, { status: 200 });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json(
                {
                    message: error.message,
                },
                {
                    status: 400,
                }
            );
        }
        return NextResponse.error();
    }
}