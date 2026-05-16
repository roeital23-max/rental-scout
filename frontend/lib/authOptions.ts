import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { supabaseAdapter } from "./supabaseAdapter";

async function sendViaResend(email: string, url: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.AUTH_EMAIL_FROM || "onboarding@resend.dev",
      to: [email],
      subject: "כניסה ל-Shakuf / Sign in to Shakuf",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#1A2730;margin-bottom:8px">כניסה ל-Shakuf</h2>
          <p style="color:#637280;margin-bottom:24px">לחץ על הכפתור להתחברות. הקישור תקף ל-24 שעות.</p>
          <a href="${url}" style="display:inline-block;background:#1E7B7B;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600">כניסה</a>
          <hr style="margin:32px 0;border:none;border-top:1px solid #DDE4E8" />
          <p style="color:#637280;font-size:13px">Sign in to Shakuf — click below. Link expires in 24 hours.</p>
          <a href="${url}" style="color:#1E7B7B;font-size:13px">${url}</a>
        </div>
      `,
    }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  adapter: supabaseAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    EmailProvider({
      from: process.env.AUTH_EMAIL_FROM || "onboarding@resend.dev",
      sendVerificationRequest: ({ identifier, url }) => sendViaResend(identifier, url),
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.sub;
      return session;
    },
  },
};
