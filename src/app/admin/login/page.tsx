"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = {
    ar: { title: "تسجيل الدخول", subtitle: "لوحة تحكم بورتفوليو YAZ", email: "البريد الإلكتروني", password: "كلمة المرور", submit: "دخول", error: "بيانات الدخول غير صحيحة", toggle: "English" },
    en: { title: "Sign in", subtitle: "YAZ Portfolio Admin", email: "Email", password: "Password", submit: "Sign in", error: "Invalid credentials", toggle: "العربية" },
  }[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError(true);
    } else {
      // Hard navigation avoids a Next.js App Router quirk where global
      // stylesheets can fail to apply across a client-side transition
      // between routes that sit under different layouts.
      window.location.href = "/admin";
    }
  }

  return (
    <div className="login-screen" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <form className="login-card" onSubmit={handleSubmit}>
        <img src="/uploads/seed/logo.webp" alt="YAZ" />
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        {error && <div className="login-error">{t.error}</div>}
        <div className="field" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
          <label>{t.email}</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </div>
        <div className="field" style={{ textAlign: lang === "ar" ? "right" : "left" }}>
          <label>{t.password}</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
          {loading ? "..." : t.submit}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ marginTop: 16 }}
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        >
          {t.toggle}
        </button>
      </form>
    </div>
  );
}
