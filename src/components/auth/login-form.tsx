"use client";

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
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

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
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="lux-panel space-y-4 p-6"
    >
      <div>
        <label className="mb-1 block text-sm text-zinc-300">Email</label>
        <input type="email" {...form.register("email")} className="lux-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-300">Mot de passe</label>
        <input type="password" {...form.register("password")} className="lux-input" />
      </div>
      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
      <button type="submit" className="lux-btn-primary w-full">
        Se connecter
      </button>
    </form>
  );
}
