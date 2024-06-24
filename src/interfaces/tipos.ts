//interfaces/tipos.ts
export interface UserData {
    _id: string;
    fullname: string;
    email: string;
    edificios: Array<{ _id: string; name: string; level: number }>;
    recursos: Recurso[];
    messages: mensaje[];
}
export interface Recurso {
    name: "oro" | "comida" | "piedra" | "madera" | "tropas";
    quantity: number;
}
export interface mensaje {
    emisor: string;
    receptor: string;
    contenido: string;
    fecha: Date;
    recursos: Array<{ _id: string; name: "oro" | "comida" | "piedra" | "madera" | "tropas"; quantity: number; }>;
}