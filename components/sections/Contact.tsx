"use client";

import { useRef, useState } from "react";
import { gsap, useScopedGsap } from "@/hooks/useGsap";
import { useReveal } from "@/hooks/useReveal";
import { CONTACT } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

/*
 * CONTACT — どんな状態でも相談していい、と背中を押す。
 * モーションは減速して静止させ、ここだけは装飾を削ぎ落とす。
 */
export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const scope = useScopedGsap<HTMLElement>(({ scope }) => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        if (ctx.conditions?.reduced) {
          gsap.set(scope.current?.querySelectorAll("[data-contact-form]") ?? [], {
            autoAlpha: 1,
            y: 0,
          });
          return;
        }

        /*
         * フォームだけは1つの塊として出す。
         * 入力欄を1つずつ順に出すと、書き始めようとしている人の前で
         * 画面が動き続けることになる。
         * 文章側は useReveal が上から順に拾う。
         */
        gsap.from("[data-contact-form]", {
          autoAlpha: 0,
          y: 24,
          duration: 1.0,
          ease: "brandOut",
          scrollTrigger: {
            trigger: "[data-contact-form]",
            start: "top 88%",
            once: true,
          },
        });
      },
    );
  }, []);

  /* 文章はすべて共通の仕掛けで、上から順に出す */
  useReveal(scope);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setErrors({});
    setNotice("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (res.ok && json.ok) {
        setStatus("sent");
        setNotice("送信しました。折り返しご連絡いたします。");
        formRef.current?.reset();
        return;
      }

      setStatus("error");
      if (json.errors) setErrors(json.errors);
      setNotice(
        json.error ?? "送信できませんでした。入力内容をご確認ください。",
      );
    } catch {
      setStatus("error");
      setNotice(
        "通信に失敗しました。時間をおいて再度お試しください。",
      );
    }
  }

  return (
    <section
      ref={scope}
      data-chapter="contact"
      id="contact"
      aria-labelledby="contact-heading"
      className="section-y relative"
    >
      <div className="container-x">
        <div className="flex items-center gap-5">
          <span data-reveal className="label text-ink">{CONTACT.label}</span>
          <span
            data-reveal
            aria-hidden
            className="h-px flex-1 origin-left bg-rule-strong"
          />
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          <div>
            <h2
              id="contact-heading"
              className="text-display-l font-normal leading-[1.22] text-ink"
            >
              {CONTACT.headline.map((line) => (
                <span key={line} data-reveal className="block">
                {line}
              </span>
              ))}
            </h2>

            <ul className="mt-14 flex flex-col gap-1">
              {CONTACT.fragments.map((f) => (
                <li
                  key={f}
                  data-reveal
                  className="text-display-s font-normal text-ink-soft"
                >
                  {f}
                </li>
              ))}
            </ul>

            <p
              data-reveal
              className="mt-8 text-display-s font-normal text-ink"
            >
              {CONTACT.closing}
            </p>

            <p data-reveal
            className="mt-10 max-w-md text-sm leading-loose text-ink-soft">
              {CONTACT.body}
            </p>
          </div>

          <form
            ref={formRef}
            data-contact-form
            onSubmit={onSubmit}
            noValidate
            className="flex flex-col gap-8"
          >
            <fieldset className="flex flex-col gap-4">
              <legend className="label text-ink-faint">
                {CONTACT.form.typeLabel}
              </legend>
              <div className="flex flex-wrap gap-3">
                {CONTACT.form.types.map((t, i) => (
                  <label
                    key={t}
                    className="flex min-h-11 cursor-pointer items-center gap-3 border border-rule-strong px-5 text-sm text-ink-soft transition-colors duration-300 hover:text-ink has-[:checked]:bg-ink has-[:checked]:text-void"
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      defaultChecked={i === 0}
                      className="sr-only"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field
              id="name"
              label={CONTACT.form.name}
              required
              error={errors.name}
            />
            <Field
              id="contact"
              label={CONTACT.form.contact}
              type="email"
              required
              autoComplete="email"
              error={errors.contact}
            />
            <Field
              id="tel"
              label={CONTACT.form.tel}
              type="tel"
              autoComplete="tel"
              error={errors.tel}
            />

            <div className="flex flex-col gap-3">
              <label
                htmlFor="message"
                className="flex items-center gap-3 text-xs tracking-[0.16em] text-ink-soft"
              >
                {CONTACT.form.message}
                <span className="label text-ink-faint">
                  {CONTACT.form.required}
                </span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                aria-describedby={errors.message ? "message-error" : undefined}
                aria-invalid={errors.message ? true : undefined}
                placeholder={CONTACT.form.messagePlaceholder}
                className="w-full resize-y border border-rule-strong bg-raised px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
              />
              {errors.message ? (
                <p id="message-error" className="text-xs text-ink">
                  {errors.message}
                </p>
              ) : null}
            </div>

            {/* ボット除け。視覚・支援技術の双方から隠す */}
            <div aria-hidden className="hidden">
              <label htmlFor="company">会社名</label>
              <input id="company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="flex min-h-[3.25rem] items-center justify-center gap-4 bg-ink px-8 text-sm tracking-[0.12em] text-void transition-colors duration-300 hover:bg-ink-soft disabled:opacity-50"
            >
              {status === "sending" ? "送信中…" : CONTACT.form.submit}
            </button>

            {/* 送信結果は支援技術にも通知する */}
            <p
              aria-live="polite"
              className={`text-sm leading-relaxed ${
                status === "error" ? "text-ink" : "text-ink-soft"
              }`}
            >
              {notice}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  type = "text",
  required = false,
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={id}
        className="flex items-center gap-3 text-xs tracking-[0.16em] text-ink-soft"
      >
        {label}
        <span className="label text-ink-faint">
          {required ? CONTACT.form.required : CONTACT.form.optional}
        </span>
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        className="min-h-11 w-full border border-rule-strong bg-raised px-4 py-3 text-sm text-ink focus:border-ink focus:outline-none"
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
