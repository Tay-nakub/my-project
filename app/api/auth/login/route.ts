import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas/auth";
import z from "zod";

// const loginScheme = z.object({
//   username: z.string().min(1, "Username is required"),
//   password: z.string().min(1, "Password is required"),
// });

export async function POST(request: Request) {
  // username, password
  const payload = await request.json();
  const result = loginSchema.safeParse(payload);

  if (!result.success) {
    return new Response(JSON.stringify(z.treeifyError(result.error)), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, password } = result.data;

  //console.log("Received login data:", { email, password });
  console.log("Received login attempt for:", email);  

  // const user = await prisma.user.findUnique({
  //   where: { email: email, passwordHash: password },
  // });
  const user = await prisma.user.findUnique({ where: { email: email } });

  // Check if user exists and password is correct
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return Response.json(
      { message: "Invalid username or password" },
      { status: 401 },
    );
  }

  // Set session cookie
  //สร้าง session cookie โดยใช้ข้อมูลจาก user ที่เข้าสู่ระบบสำเร็จ
  await setSessionCookie({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return Response.json({ message: "Login successful" });
}



// import { verifyPassword } from "@/lib/auth/password";
// import { setSessionCookie } from "@/lib/auth/session";
// import { prisma } from "@/lib/prisma";
// import z from "zod";

// const loginScheme = z.object({
//   username: z.string().min(1, "Username is required"),
//   password: z.string().min(1, "Password is required"),
// });

// export async function POST(request: Request) {
//   // username, password
//   const payload = await request.json();
//   const result = loginScheme.safeParse(payload);

//   if (!result.success) {
//     return new Response(JSON.stringify(z.treeifyError(result.error)), {
//       status: 400,
//       headers: { "Content-Type": "application/json" },
//     });
//   }

//   const { username, password } = result.data;

//   console.log("Received login data:", { username, password });

//   // const user = await prisma.user.findUnique({
//   //   where: { email: username, passwordHash: password },
//   // });
//   const user = await prisma.user.findUnique({
//     where: { email: username },
//   });


//   if (!user || !(await verifyPassword(password, user.passwordHash))) {
//     return Response.json(
//       { 
//         message: "Invalid username or password" },
//       { status: 401 },
//     );
//   }

//   await setSessionCookie({ 
//     userId: user.id, 
//     email: user.email
//    });

//   return Response.json({ message: "Login successful" });
// }

// // import { prisma } from "@/lib/prisma";
// // import z from "zod";

// // const loginScheme = z.object({
// //   username: z.string().min(1, "Username is required"),
// //   password: z.string().min(1, "Password is required"),
// // });

// // export async function POST(request: Request) {
// //   // username, password
// //   const payload = await request.json();
// //   const result = loginScheme.safeParse(payload);

// //   if (!result.success) {
// //     return new Response(JSON.stringify(z.treeifyError(result.error)), {
// //       status: 400,
// //       headers: { "Content-Type": "application/json" },
// //     });
// //   }

// //   const { username, password } = result.data;

// //   console.log("Received login data:", { username, password });
  
// //   const user = await prisma.user.findUnique({
// //     where: {
// //       email: username,
// //       passwordHash: password,
// //     },
// //   });

// //   if (!user) {
// //     return new Response(JSON.stringify({ message: "Invalid username or password" }), {
// //       status: 401,
// //       headers: { "Content-Type": "application/json" },
// //     });
// //   }

// //   return Response.json({ message: "Login successful" });
// // }