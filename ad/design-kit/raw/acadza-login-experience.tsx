"use client"

import * as React from "react"
import { motion, useAnimate, type MotionStyle } from "motion/react"

type LoginExperienceProps = { onSubmit?: (email: string, password: string) => void }

/** Design-kit prototype: the supplied beam + flip concepts, adapted for Acadza. */
export function AcadzaLoginExperience({ onSubmit }: LoginExperienceProps) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [markHovered, setMarkHovered] = React.useState(false)
  return (
    <main className="ac-login" aria-label="Acadza sign in">
      <section className="ac-login__form-side">
        <div className="ac-login__brand"><span aria-hidden="true">✦</span> ACADZA</div>
        <div className="ac-login__card">
          <AcadzaBorderBeam />
          <p className="ac-login__eyebrow">WELCOME BACK</p>
          <h1>Sign in to Acadza</h1>
          <p className="ac-login__intro">Continue your learning journey.</p>
          <form className="ac-login__form" onSubmit={(event) => { event.preventDefault(); onSubmit?.(email, password) }}>
            <label>Email address<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></label>
            <label>Password<input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required type="password" value={password} /></label>
            <div className="ac-login__form-options"><label className="ac-login__remember"><input type="checkbox" /> Remember me</label><a href="#forgot-password">Forgot password?</a></div>
            <button type="submit">Sign in <span aria-hidden="true">→</span></button>
          </form>
        </div>
        <p className="ac-login__support">Need help? Contact Acadza support</p>
      </section>
      <section className="ac-login__mark-side" aria-label="Acadza brand experience">
        <div className="ac-login__grid" aria-hidden="true" />
        <p className="ac-login__mark-kicker">YOUR LEARNING COMPANION</p>
        <button aria-label="Animate Acadza wordmark" className="ac-login__mark-button" onBlur={() => setMarkHovered(false)} onFocus={() => setMarkHovered(true)} onMouseEnter={() => setMarkHovered(true)} onMouseLeave={() => setMarkHovered(false)} type="button">
          <AcadzaDotMark active={markHovered} />
          <AcadzaFlipWordmark active={markHovered} />
        </button>
        <p className="ac-login__mark-copy">Learn. Practise. Succeed.</p>
      </section>
    </main>
  )
}

function AcadzaBorderBeam() {
  return <div className="ac-border-beam" aria-hidden="true"><motion.div className="ac-border-beam__light" style={{ offsetPath: "rect(0 auto auto 0 round 24px)" } as MotionStyle} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 8, ease: "linear", repeat: Infinity }} /></div>
}

/** A dot-built gear mark: intentionally replaces the geographic createMap generator. */
function AcadzaDotMark({ active }: { active: boolean }) {
  const dots = React.useMemo(() => {
    const grid: Array<{ x: number; y: number; emphasized: boolean }> = []
    for (let y = 18; y <= 182; y += 9) for (let x = 18; x <= 182; x += 9) {
      const dx = x - 100, dy = y - 100, distance = Math.hypot(dx, dy), angle = Math.atan2(dy, dx)
      const outer = 75 + Math.max(0, Math.cos(angle * 12)) * 9
      if ((distance > 54 && distance < outer) || (distance > 38 && distance < 47)) grid.push({ x, y, emphasized: distance > 67 || Math.abs(Math.sin(angle * 6)) > .88 })
    }
    return grid
  }, [])
  return <motion.svg animate={{ rotate: active ? 8 : 0, scale: active ? 1.035 : 1 }} aria-hidden="true" className="ac-dot-mark" transition={{ type: "spring", stiffness: 190, damping: 16 }} viewBox="0 0 200 200">
    <circle cx="100" cy="100" fill="none" r="92" stroke="rgba(244,178,58,.24)" strokeDasharray="2 8" />
    {dots.map((dot, index) => <motion.circle key={`${dot.x}-${dot.y}`} animate={{ opacity: active && dot.emphasized ? 1 : .72, r: active && dot.emphasized ? 2.7 : 2.05 }} cx={dot.x} cy={dot.y} fill={dot.emphasized ? "#F4B23A" : "#DDE8FF"} transition={{ delay: active ? index * .002 : 0, duration: .22 }} r="2.05" />)}
    <circle cx="100" cy="100" fill="#10244B" r="34" stroke="#F4B23A" strokeWidth="1.5" />
    <circle cx="100" cy="100" fill="#FFFDF5" r="28" />
  </motion.svg>
}

/** Adapted from the supplied Text3DFlip: the mark can control its hover state. */
function AcadzaFlipWordmark({ active }: { active: boolean }) {
  const [scope, animate] = useAnimate(); const hasPlayed = React.useRef(false)
  React.useEffect(() => { if (!active || hasPlayed.current) return; hasPlayed.current = true; void animate(".ac-flip-letter", { rotateX: 90 }, { delay: (index) => index * .045, duration: .28, ease: "easeOut" }).then(() => animate(".ac-flip-letter", { rotateX: 0 }, { duration: 0 })) }, [active, animate])
  React.useEffect(() => { if (!active) hasPlayed.current = false }, [active])
  return <span className="ac-flip-wordmark" ref={scope} aria-hidden="true">{Array.from("ACADZA").map((letter, index) => <span className="ac-flip-letter" key={`${letter}-${index}`}><span className="ac-flip-letter__front">{letter}</span><span className="ac-flip-letter__back">{letter}</span></span>)}</span>
}
