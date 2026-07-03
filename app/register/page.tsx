"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import React from "react";
import { useForm } from "react-hook-form";
import { RegisterInput, registerSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/dist/client/components/navigation";

const RegisterPage = () => {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const { mutateAsync } = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.message ?? "Registration failed");
        }
        return body;
      });
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    console.log("Register data:", data);
    try {
      await mutateAsync(data);
      toast.success("Registration successful");
      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(
        "Registration failed: " +
          (err instanceof Error ? err.message : "Registration failed"),
      );
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Register a new account to start ordering your favorite coffee!
          </CardDescription>
        </CardHeader>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel> Email</FieldLabel>
                <Input {...register("email")} />
                <FieldError errors={errors.email ? [errors.email] : []} />
              </Field>
              <Field>
                <FieldLabel> Name</FieldLabel>
                <Input {...register("name")} />
                <FieldError errors={errors.name ? [errors.name] : []} />
              </Field>
              <Field>
                <FieldLabel> Password</FieldLabel>
                <Input type="password" {...register("password")} />
                <FieldError errors={errors.password ? [errors.password] : []} />
              </Field>
              <Field>
                <FieldLabel> Confirm Password</FieldLabel>
                <Input type="password" {...register("confirmPassword")} />
                <FieldError
                  errors={
                    errors.confirmPassword ? [errors.confirmPassword] : []
                  }
                />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full">
              Register
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
