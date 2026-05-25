"use client";

export interface ContactValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerMessage: string;
}

interface BookingStepContactProps {
  values: ContactValues;
  onChange: (values: ContactValues) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

function validate(values: ContactValues): FieldErrors {
  const errors: FieldErrors = {};
  if (values.firstName.trim().length < 2) errors.firstName = "Prénom requis.";
  if (values.lastName.trim().length < 2) errors.lastName = "Nom requis.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Email invalide.";
  }
  if (values.phone.trim().length < 8) errors.phone = "Téléphone requis.";
  return errors;
}

export function BookingStepContact({
  values,
  onChange,
  onBack,
  onContinue,
}: BookingStepContactProps) {
  const errors = validate(values);
  const canContinue = Object.keys(errors).length === 0;

  function handleChange<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-7 overflow-y-auto overscroll-contain px-8 pb-8 pt-8">
        <div>
          <p className="mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            <span className="mr-3 inline-block h-px w-6 bg-[var(--ink-dim)] align-middle" />
            Coordonnées
          </p>
          <h3 className="font-[family:var(--font-fraunces)] text-[26px] font-light leading-[1.15] tracking-[-0.02em] text-[var(--ink-ivory)]">
            On vous <em className="italic font-normal">recontacte.</em>
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Prénom"
            error={errors.firstName}
            value={values.firstName}
            onChange={(v) => handleChange("firstName", v)}
            autoComplete="given-name"
          />
          <Field
            label="Nom"
            error={errors.lastName}
            value={values.lastName}
            onChange={(v) => handleChange("lastName", v)}
            autoComplete="family-name"
          />
        </div>

        <Field
          label="Email"
          error={errors.email}
          value={values.email}
          onChange={(v) => handleChange("email", v)}
          type="email"
          autoComplete="email"
          inputMode="email"
        />
        <Field
          label="Téléphone"
          error={errors.phone}
          value={values.phone}
          onChange={(v) => handleChange("phone", v)}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
        />

        <label className="block">
          <span className="mb-2 block font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            Message <span className="lowercase tracking-normal">(facultatif)</span>
          </span>
          <textarea
            value={values.customerMessage}
            onChange={(e) => handleChange("customerMessage", e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Une précision sur votre demande, un horaire de remise…"
            className="w-full resize-none border border-[var(--ink-line-soft)] bg-[var(--ink-elevated)] px-4 py-3 font-[family:var(--font-dm-sans)] text-[14px] leading-[1.55] text-[var(--ink-ivory)] outline-none transition-colors placeholder:text-[var(--ink-muted)] focus:border-[var(--ink-ivory)]"
          />
          <p className="mt-1 text-right font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            {values.customerMessage.length} / 500
          </p>
        </label>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-[var(--ink-line)] bg-[var(--ink-onyx)] px-8 py-5">
        <button
          type="button"
          onClick={onBack}
          className="border border-[var(--ink-line-soft)] bg-transparent px-6 py-3.5 font-[family:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ink-text-soft)] transition-colors duration-200 hover:border-[var(--ink-text-soft)] hover:text-[var(--ink-ivory)]"
        >
          Retour
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="border border-[var(--ink-ivory)] bg-[var(--ink-ivory)] px-6 py-3.5 font-[family:var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[0.3em] text-[var(--ink-onyx)] transition-colors duration-200 disabled:cursor-not-allowed disabled:border-[var(--ink-line-soft)] disabled:bg-transparent disabled:text-[var(--ink-muted)]"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: "email" | "tel" | "text";
  error?: string;
}

function Field({ label, value, onChange, type = "text", autoComplete, inputMode, error }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
        {label}
      </span>
      <input
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-[var(--ink-line-soft)] bg-[var(--ink-elevated)] px-4 py-3 font-[family:var(--font-dm-sans)] text-[14px] text-[var(--ink-ivory)] outline-none transition-colors focus:border-[var(--ink-ivory)]"
      />
      {error && value.length > 0 && (
        <span className="font-[family:var(--font-fraunces)] text-[12px] italic text-[var(--ink-text-soft)]">
          {error}
        </span>
      )}
    </label>
  );
}
