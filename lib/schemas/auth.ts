
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().trim().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  name: z.string().trim().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  confirmPassword: z.string().trim().min(8, "ยืนยันรหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().trim().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
