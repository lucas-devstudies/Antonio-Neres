"use client";

import { FormEvent, useState } from "react";

type TicketResponse = {
  error?: string;
};

const bundles = [
  {
    id: "ONLINE",
    name: "Método AN On-line",
    price: "R$ 299,00",
  },
  {
    id: "PRESENTIAL",
    name: "Método AN Presencial",
    price: "R$ 599,00",
  },
  {
    id: "PRESENTIAL_PREMIUM",
    name: "Método AN Presencial Premium",
    price: "R$ 899,00",
  },
];

export default function FormClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      city: String(formData.get("city") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      degree: String(formData.get("degree") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      bundle: String(formData.get("bundle") ?? ""),
      motive: String(formData.get("motive") ?? "").trim(),
      indication: String(formData.get("indication") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: TicketResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível realizar o cadastro."
        );
      }

      form.reset();
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao realizar o cadastro."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";

  const labelClass = "mb-2 block text-sm font-medium text-zinc-200";

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Antonio Neres
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Comece sua jornada
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Preencha seus dados e escolha o pacote mais adequado para você.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl shadow-emerald-950/20 sm:p-8"
        >
          <section>
            <h2 className="mb-5 text-lg font-semibold">
              Dados pessoais
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="name">
                  Nome completo *
                </label>
                <input
                  className={inputClass}
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="email">
                  E-mail *
                </label>
                <input
                  className={inputClass}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="phone">
                  Telefone *
                </label>
                <input
                  className={inputClass}
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(92) 99999-9999"
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="city">
                  Cidade *
                </label>
                <input
                  className={inputClass}
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  placeholder="Sua cidade"
                  required
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="degree">
                  Escolaridade *
                </label>
                <select
                  className={inputClass}
                  id="degree"
                  name="degree"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Selecione sua escolaridade
                  </option>
                  <option value="Ensino fundamental incompleto">
                    Ensino fundamental incompleto
                  </option>
                  <option value="Ensino fundamental completo">
                    Ensino fundamental completo
                  </option>
                  <option value="Ensino médio incompleto">
                    Ensino médio incompleto
                  </option>
                  <option value="Ensino médio completo">
                    Ensino médio completo
                  </option>
                  <option value="Ensino superior incompleto">
                    Ensino superior incompleto
                  </option>
                  <option value="Ensino superior completo">
                    Ensino superior completo
                  </option>
                  <option value="Pós-graduação">
                    Pós-graduação
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="address">
                  Endereço *
                </label>
                <input
                  className={inputClass}
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  placeholder="Rua, número e bairro"
                  required
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-2 text-lg font-semibold">
              Escolha seu pacote
            </h2>

            <p className="mb-5 text-sm text-zinc-400">
              Selecione a opção mais adequada para você.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {bundles.map((bundle, index) => (
                <label
                  key={bundle.id}
                  className="relative cursor-pointer"
                >
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="bundle"
                    value={bundle.id}
                    defaultChecked={index === 0}
                    required
                  />

                  <div className="h-full rounded-xl border border-zinc-700 bg-zinc-900 p-5 transition peer-checked:border-emerald-400 peer-checked:bg-emerald-950/30 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400">
                    <span className="text-sm text-zinc-300">
                      {bundle.name}
                    </span>

                    <p className="mt-2 text-3xl font-bold">
                      {bundle.price}
                    </p>

                    <p className="mt-4 text-sm font-medium text-emerald-400">
                      Selecionar pacote
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-5 text-lg font-semibold">
              Informações adicionais
              <span className="ml-2 text-sm font-normal text-zinc-500">
                (opcional)
              </span>
            </h2>

            <div className="space-y-5">
              <div>
                <label className={labelClass} htmlFor="motive">
                  Por que deseja fazer o curso?
                </label>
                <textarea
                  className={inputClass}
                  id="motive"
                  name="motive"
                  rows={3}
                  placeholder="Conte um pouco sobre seus objetivos..."
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="indication">
                  Quem indicou nosso curso?
                </label>
                <input
                  className={inputClass}
                  id="indication"
                  name="indication"
                  placeholder="Nome de quem indicou, se houver"
                />
              </div>
            </div>
          </section>

          {success && (
            <div
              role="status"
              className="rounded-lg border border-emerald-800 bg-emerald-950/50 p-4 text-sm text-emerald-300"
            >
              Cadastro realizado com sucesso!
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-5 py-4 font-bold text-black transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Enviando cadastro..." : "Realizar cadastro"}
          </button>

          <p className="text-center text-xs leading-relaxed text-zinc-500">
            Ao enviar o formulário, seus dados serão registrados para
            que nossa equipe possa dar continuidade ao seu atendimento.
          </p>
        </form>
      </div>
    </main>
  );
}