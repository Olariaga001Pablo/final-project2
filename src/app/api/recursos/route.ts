//api/recursos/route.ts
import { connectDB } from "@/libs/mongodb";
import User from "@/models/user";
import Message from "@/models/mensajes";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/route";
import { Recurso, UserData } from "@/interfaces/tipos";

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const {email} = await request.json();    
    const userFound = await User.findOne({ email });

    const user = new User({
      email,
    });
    console.log("hasta aca llego")

    return NextResponse.json(
      {
        // fullname,
        email,
        // createdAt: savedUser.createdAt,
        // updatedAt: savedUser.updatedAt,
      },
      { status: 201 }
    );
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

export async function GET() {
  try {
    await connectDB();
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
    // console.log(user.recursos);
    // const userActualizado = await User.findById(user._id).lean() as UserData;
    // console.log(userActualizado.recursos);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const { _id, recursos, edificios, fullname } = user;

    const userResponse = { _id, fullname, recursos, edificios};

    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}
export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, recursos, edificios } = body;
    // console.log(body);

    if (!email || !recursos || !edificios) {
      return NextResponse.json(
        { message: "Email, recursos, and edificios are required" },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email },
      { recursos, edificios },
      { new: true } // Esta opción devuelve el documento actualizado
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Extraer solo los campos necesarios
    const { _id, recursos: updatedRecursos, edificios: updatedEdificios } = user;

    // Crear un nuevo objeto con solo los campos deseados
    const userResponse = { _id, recursos: updatedRecursos, edificios: updatedEdificios };

    return NextResponse.json(userResponse, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}