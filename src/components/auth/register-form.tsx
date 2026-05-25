"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.email("Email invalide"),
  phone: z.string().min(8, "Téléphone invalide").optional().or(z.literal("")),
  password: z.string().min(8, "Mot de passe trop court"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const csrfToken = useCsrfToken();
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setErrorMessage("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({
        ...values,
        phone: values.phone || undefined,
      }),
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setErrorMessage(data.error ?? "Inscription impossible.");
      return;
    }

    const loginResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (loginResult?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="lux-panel space-y-4 p-6"
    >
      <div>
        <label className="mb-1 block text-sm text-zinc-300">Nom complet</label>
        <input type="text" {...form.register("name")} className="lux-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-300">Email</label>
        <input type="email" {...form.register("email")} className="lux-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-300">Téléphone</label>
        <input type="tel" {...form.register("phone")} className="lux-input" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-300">Mot de passe</label>
        <input type="password" {...form.register("password")} className="lux-input" />
      </div>
      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
      <button
        type="submit"
        disabled={!csrfToken}
        className="lux-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        Créer mon compte
      </button>
      <p className="text-sm text-zinc-400">
        Déjà inscrit ?{" "}
        <Link href="/login" className="text-zinc-200 underline decoration-zinc-600 underline-offset-4">
          Connexion
        </Link>
      </p>
    </form>
  );
}
