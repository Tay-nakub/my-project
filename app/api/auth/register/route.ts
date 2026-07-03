import { registerSchema } from "@/lib/schemas/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";


export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const result = registerSchema.safeParse(payload);
    if (!result.success) {
    return Response.json(
        { message: result.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
    );
    }

    const {email, name, password} = result.data;
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return Response.json(
            { message: "อีเมลนี้ถูกใช้งานแล้ว" },
            { status: 409 },
        );
    }

    const passwordHash = await hashPassword(password);

    try{
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
            },
        });

        return Response.json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            },
        });

    }catch(err ) {
        console.error("Error hashing password:", err);
        return Response.json(
            { message: "เกิดข้อผิดพลาดในการลงทะเบียน" },
            { status: 500 },
        );
    }
}



// import { registerSchema } from "@/lib/schemas/auth";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs"; // หรือ argon2 ตาม lib/auth/password ที่มีอยู่


// export async function POST(request: Request) {
//   const payload = await request.json().catch(() => null);
//   const result = registerSchema.safeParse(payload);

//   if (!result.success) {
//     return Response.json(
//       { message: result.error.issues[0]?.message ?? "Invalid data" },
//       { status: 400 },
//     );
//   }

//   // HOMEWORK: Implement registration logic here
//   // - Validate if email is already registered
//   // - Hash the password
//   // - Store the user in the database

//   const existingUser = await prisma.user.findUnique({
//   where: { email: result.data.email },
// });

// if (existingUser) {
//   return Response.json(
//     { message: "Email is already registered" },
//     { status: 409 },
//   );
// }

  
//   const passwordHash = await bcrypt.hash(result.data.password, 10);

//   const newUser = await prisma.user.create({
//     data: {
//       email: result.data.email,
//       name: result.data.name,
//       passwordHash: passwordHash,   
//     //   passwordHash: result.data.password, // Note: In a real application, you should hash the password before storing it
//     },
//   });

//   return Response.json({
//   message: "User registered successfully",
//   user: {
//     id: newUser.id,
//     email: newUser.email,
//     name: newUser.name,
//   },
// });

// //   return Response.json({ message: "User registered successfully", user: newUser });
// }

