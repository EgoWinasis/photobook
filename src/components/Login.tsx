"use client";

import { Flower2, Heart, LockKeyhole, Sparkles } from "lucide-react";

export default function Login({ hasError }: { hasError: boolean }) {
  return <main className="login-page">
    <div className="petal petal-one">✿</div><div className="petal petal-two">❀</div><div className="petal petal-three">✽</div>
    <section className="login-card">
      <div className="flower-mark"><Flower2 size={28}/></div>
      <p className="eyebrow">A PRIVATE LITTLE CORNER</p>
      <h1>Forever <em>With You</em></h1>
      <p className="login-subtitle">A little book of our memories</p>
      <div className="tiny-hearts"><Heart size={13} fill="currentColor"/> <span>Dita & Ego</span> <Heart size={13} fill="currentColor"/></div>
      {hasError && <p className="error">Username atau password belum tepat. Coba lagi ya ♡</p>}
      <form action="/login" method="POST" className="login-form">
        <label htmlFor="username">Username</label>
        <div className="field"><span>♡</span><input id="username" name="username" placeholder="dita atau ego" autoComplete="username" required /></div>
        <label htmlFor="password">Password</label>
        <div className="field"><LockKeyhole size={16}/><input id="password" name="password" type="password" placeholder="Our little secret" autoComplete="current-password" required /></div>
        <button className="primary-button" type="submit">Open our memories <Heart size={16}/></button>
      </form>
      <p className="login-foot"><Sparkles size={13}/> Made with love, just for us</p>
    </section>
    <p className="bottom-note">some moments deserve to last forever ♡</p>
  </main>;
}