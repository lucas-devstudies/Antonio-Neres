"use client";

import { FormEvent, useState } from "react";

type CheckoutResponse = {
  checkoutUrl?: string;
  preferenceId?: string;
  error?: string;
};

export default function FormClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

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
      payform: String(formData.get("payform") ?? ""),
      motive: String(formData.get("motive") ?? "").trim(),
      indication: String(formData.get("indication") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: CheckoutResponse = await response.json();

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(
          data.error ?? "Não foi possível iniciar o pagamento."
        );
      }

      window.location.assign(data.checkoutUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao iniciar o pagamento."
      );
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
            Preencha seus dados, escolha seu pacote e prossiga para o
            pagamento seguro.
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
              <label className="relative cursor-pointer">
                <input
                  className="peer sr-only"
                  type="radio"
                  name="bundle"
                  value="monthly"
                  defaultChecked
                  required
                />
                <div className="h-full rounded-xl border border-zinc-700 bg-zinc-900 p-5 transition peer-checked:border-emerald-400 peer-checked:bg-emerald-950/30 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400">
                  <span className="text-sm text-zinc-300">
                    Pacote mensal
                  </span>
                  <p className="mt-2 text-3xl font-bold">
                    R$ 99,00
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Acesso por um mês
                  </p>
                  <p className="mt-4 text-sm font-medium text-emerald-400">
                    Selecionar pacote
                  </p>
                </div>
              </label>

              <label className="relative cursor-pointer">
                <input
                  className="peer sr-only"
                  type="radio"
                  name="bundle"
                  value="quarterly"
                  required
                />
                <div className="h-full rounded-xl border border-zinc-700 bg-zinc-900 p-5 transition peer-checked:border-emerald-400 peer-checked:bg-emerald-950/30 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400">
                  <span className="text-sm text-zinc-300">
                    Pacote trimestral
                  </span>
                  <p className="mt-2 text-3xl font-bold">
                    R$ 269,00
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Acesso por três meses
                  </p>
                  <p className="mt-4 text-sm font-medium text-emerald-400">
                    Selecionar pacote
                  </p>
                </div>
              </label>
            </div>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-5 text-lg font-semibold">
              Forma de pagamento
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="cursor-pointer">
                <input
                  className="peer sr-only"
                  type="radio"
                  name="payform"
                  value="PIX"
                  defaultChecked
                  required
                />
                <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 transition peer-checked:border-emerald-400 peer-checked:bg-emerald-950/30 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400">
                  <p className="font-semibold">PIX</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Pagamento instantâneo
                  </p>
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  className="peer sr-only"
                  type="radio"
                  name="payform"
                  value="CREDIT_CARD"
                  required
                />
                <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 transition peer-checked:border-emerald-400 peer-checked:bg-emerald-950/30 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-400">
                  <p className="font-semibold">Cartão de crédito</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Pague com seu cartão
                  </p>
                </div>
              </label>
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
            {loading
              ? "Preparando pagamento..."
              : "Continuar para pagamento"}
          </button>

          <p className="text-center text-xs leading-relaxed text-zinc-500">
            Seus dados serão enviados para iniciar o checkout. O registro
            definitivo do atendimento ocorrerá após a confirmação do
            pagamento.
          </p>
        </form>
      </div>
    </main>
  );
}
