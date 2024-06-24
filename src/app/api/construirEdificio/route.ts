// api/construirEdificio/route.ts
import { connectDB } from "@/libs/mongodb";
import User from "@/models/user";
import mongoose from "mongoose";
import { Recurso, UserData } from "@/interfaces/tipos";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
    try {
        await connectDB();
        const { edificio, pos } = await request.json();
        const session = await getServerSession(options);

    if(!session){
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
        // Verificar que 'pos' sea un número válido
        if (typeof pos !== 'number' || pos < 0 || pos > user.edificios.length) {
            return NextResponse.json({ message: "Invalid position" }, { status: 400 });
        }

        // Definir los recursos necesarios
        const recursosNecesarios = { oro: 25, comida: 25, piedra: 25, madera: 25 };
        
        // Comprobar si hay suficientes recursos, excluyendo tropas
        const tieneSuficientesRecursos = user.recursos.every((recurso: Recurso) => {
            if (recurso.name === "tropas") return true; // Excluir tropas de la comprobación
            const requiredAmount = recursosNecesarios[recurso.name as keyof typeof recursosNecesarios];
            return recurso.quantity >= requiredAmount;
        });

        if (!tieneSuficientesRecursos) {
            return NextResponse.json({ message: "No hay suficientes recursos." }, { status: 400 });
        }

        // Crear el nuevo edificio
        const nuevoEdificio = {
            name: edificio,
            level: 1,
            _id: new mongoose.Types.ObjectId().toString(), // Crear un nuevo ID para el edificio
        };

        // Insertar el nuevo edificio en la posición especificada
        user.edificios.splice(pos, 1, nuevoEdificio);

        // Actualizar recursos
        user.recursos.forEach((recurso: Recurso) => {
            if (recursosNecesarios[recurso.name as keyof typeof recursosNecesarios] !== undefined) {
                recurso.quantity -= 25;
            }
        });

        // Guardar los cambios en la base de datos
        const updatedUser = await User.findOneAndUpdate(
            { _id: id },
            { edificios: user.edificios, recursos: user.recursos },
            { new: true } // Devuelve el documento después de la actualización
        );

        return NextResponse.json(updatedUser.edificios, { status: 200 });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }
        return NextResponse.error();
    }
}
