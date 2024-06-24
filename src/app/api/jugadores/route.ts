//api/jugadores/route.ts
import { connectDB } from "@/libs/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import { Recurso, UserData } from "@/interfaces/tipos";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/route";

export async function GET() {
    try {
        await connectDB();
        // Obtener todos los usuarios
        const users = await User.find({}, 'id fullname');
        // console.log(users);
        // Mapear usuarios para devolver solo `id` y `fullname`
        const usersList = users.map((user: UserData) => ({
            _id: user._id,
            fullname: user.fullname
        }));

        return NextResponse.json(usersList, { status: 200 });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
