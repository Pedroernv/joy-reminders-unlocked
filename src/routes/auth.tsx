import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import iconAsset from "@/assets/icon.png.asset.json";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Entrar · SmartSchoolPro" },
      { name: "description", content: "Entre ou crie a sua conta no SmartSchoolPro para sincronizar disciplinas, notas e tarefas." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace("/app.html");
    });
  }, []);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        setMsg({ type: "ok", text: "Conta criada! Verifique o seu email para confirmar (ou já pode entrar)." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.replace("/app.html");
      }
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Erro ao autenticar" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setMsg(null);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      window.location.replace("/app.html");
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Erro ao entrar com Google" });
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#c8d8c8",
      fontFamily: "'Outfit', system-ui, sans-serif",
      padding: 16,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 8px 32px rgba(0,0,0,.12)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={iconAsset.url}
            alt="SmartSchoolPro"
            style={{ width: 72, height: 72, margin: "0 auto 12px", display: "block", objectFit: "contain" }}
          />
          <h1 style={{ margin: 0, fontSize: 22, color: "#1a2535" }}>SmartSchoolPro</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7f8f" }}>
            {mode === "signin" ? "Entre na sua conta" : "Crie a sua conta"}
          </p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={btnGoogle}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.6 29.3 4.6 24 4.6c-7.7 0-14.4 4.4-17.7 10.1z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.4 39.6 16.1 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.5 5.6l6.2 5.2c-.4.4 6.8-5 6.8-14.8 0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Continuar com Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0", color: "#9aa5b1", fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: "#e6ebef" }} />
          ou
          <div style={{ flex: 1, height: 1, background: "#e6ebef" }} />
        </div>

        <form onSubmit={handleEmailSubmit}>
          <label style={lbl}>Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="voce@escola.com" />
          <label style={lbl}>Palavra-passe</label>
          <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} style={inp} placeholder="Mínimo 6 caracteres" />

          {msg && (
            <div style={{
              marginTop: 10, padding: "8px 10px", borderRadius: 8, fontSize: 13,
              background: msg.type === "err" ? "#fdeaea" : "#e7f4e4",
              color: msg.type === "err" ? "#a13a3a" : "#2b6d2b",
            }}>{msg.text}</div>
          )}

          <button type="submit" disabled={loading} style={btnPrimary}>
            {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#4a6050" }}>
          {mode === "signin" ? (
            <>Ainda não tem conta?{" "}
              <button onClick={() => { setMode("signup"); setMsg(null); }} style={linkBtn}>Criar conta</button>
            </>
          ) : (
            <>Já tem conta?{" "}
              <button onClick={() => { setMode("signin"); setMsg(null); }} style={linkBtn}>Entrar</button>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <a href="/app.html" style={{ fontSize: 12, color: "#6b7f8f", textDecoration: "none" }}>
            Continuar sem conta →
          </a>
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d3dbe1",
  fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 8,
};
const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#4a6050", marginBottom: 4 };
const btnPrimary: React.CSSProperties = {
  width: "100%", marginTop: 10, padding: "12px", borderRadius: 10,
  border: "none", background: "#2d3a4a", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
};
const btnGoogle: React.CSSProperties = {
  width: "100%", padding: "11px 12px", borderRadius: 10,
  border: "1px solid #d3dbe1", background: "#fff", color: "#1a2535",
  fontSize: 14, fontWeight: 600, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
};
const linkBtn: React.CSSProperties = {
  background: "none", border: "none", color: "#2d3a4a", fontWeight: 700, cursor: "pointer", padding: 0,
};