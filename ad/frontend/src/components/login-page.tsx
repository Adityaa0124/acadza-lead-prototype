"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const DEMO_CLERK_EMAIL = "clerk@acadza.demo";
const DEMO_CLERK_PASSWORD = "Clerk@123";

export default function LoginPage() {
  const router = useRouter();
  const [isBrandHovered, setIsBrandHovered] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (email.trim().toLowerCase() !== DEMO_CLERK_EMAIL || password !== DEMO_CLERK_PASSWORD) {
      setError("Use the demo clerk credentials shown below.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "identity", user: "clerk" }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Unable to start the clerk demo.");
      }
      router.push("/admissions/leads");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start the clerk demo.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand" aria-label="Acadza">
          <img alt="Acadza" src="/acadza-logo.svg" />
        </div>

        <div className="login-card">
          <span className="login-beam" aria-hidden="true" />
          <p className="login-eyebrow">WELCOME BACK</p>
          <h1>Sign in to Acadza</h1>
          <p className="login-subtitle">Continue to your admissions workspace.</p>

          <form onSubmit={submit} className="login-form">
            <label>
              Email address
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Password
              <span className="login-password-field">
                <input
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  className="login-password-toggle"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  type="button"
                >
                  {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <div className="login-form-options">
              <label className="login-remember">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#support">Forgot password?</a>
            </div>
            <button className="login-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Opening workspace…" : <>Sign in <span aria-hidden="true">→</span></>}
            </button>
            {error && <p className="login-error" role="alert">{error}</p>}
          </form>
        </div>
        <p className="login-support" id="support">
          <strong>Demo clerk:</strong> {DEMO_CLERK_EMAIL} · {DEMO_CLERK_PASSWORD}
        </p>
      </section>

      <section className="login-brand-panel" aria-label="Acadza brand animation">
        <div className="login-grid" aria-hidden="true" />
        <div
          className={isBrandHovered ? "login-brand-lockup is-hovered" : "login-brand-lockup"}
          onBlur={() => setIsBrandHovered(false)}
          onFocus={() => setIsBrandHovered(true)}
          onMouseEnter={() => setIsBrandHovered(true)}
          onMouseLeave={() => setIsBrandHovered(false)}
          tabIndex={0}
        >
        <div className="login-moving-mark" aria-hidden="true">
          <svg aria-hidden="true" viewBox="0 0 42 42">
            <image href="/acadza-logo.svg" width="230" height="42" />
          </svg>
        </div>
        <MorphingBrandText showTagline={isBrandHovered} />
        </div>
      </section>
    </main>
  );
}

function MorphingBrandText({ showTagline }: { showTagline: boolean }) {
  const brandRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const brand = brandRef.current;
    const tagline = taglineRef.current;
    if (!brand || !tagline) return;
    let frame = 0;
    const startedAt = performance.now();
    const duration = 620;

    const animate = (now: number) => {
      const fraction = Math.min((now - startedAt) / duration, 1);
      const incoming = Math.pow(fraction, 0.4);
      const outgoing = Math.pow(1 - fraction, 0.4);
      const incomingBlur = Math.min(8 / Math.max(fraction, 0.01) - 8, 32);
      const outgoingBlur = Math.min(8 / Math.max(1 - fraction, 0.01) - 8, 32);
      const visible = showTagline ? tagline : brand;
      const hidden = showTagline ? brand : tagline;
      visible.style.opacity = `${incoming}`;
      visible.style.filter = `blur(${incomingBlur}px)`;
      hidden.style.opacity = `${outgoing}`;
      hidden.style.filter = `blur(${outgoingBlur}px)`;
      if (fraction < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [showTagline]);

  return (
    <div className="login-brand-copy" aria-live="polite">
      <span ref={brandRef}>ACADZA</span>
      <span ref={taglineRef}>Learn. Practise. Succeed.</span>
      <svg aria-hidden="true" className="login-morph-filter" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="acadza-morph-threshold">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}


