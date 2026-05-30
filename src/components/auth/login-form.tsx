"use client";

import { Button } from "@/components/admin/ui/button";
import { Field } from "@/components/admin/ui/field";
import { Input } from "@/components/admin/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrlParam = searchParams.get("callbackUrl");
  const callbackUrl =
    callbackUrlParam && callbackUrlParam.startsWith("/admin")
      ? callbackUrlParam
      : "/admin/dashboard";
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: LoginValues) {
    setErrorMessage("");
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (!result || result.error) {
      setErrorMessage("Identifiants invalides.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} error={!!errors.email} />
      </Field>
      <Field label="Mot de passe" required error={errors.password?.message}>
        <Input
          type="password"
          autoComplete="current-password"
          {...register("password")}
          error={!!errors.password}
        />
      </Field>
      {errorMessage && (
        <p className="rounded-md border border-[color:var(--admin-danger)]/30 bg-[color:var(--admin-danger-dim)] px-3 py-2 text-[0.8125rem] text-[color:var(--admin-danger-soft)]">
          {errorMessage}
        </p>
      )}
      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        Se connecter
      </Button>
    </form>
  );
}
