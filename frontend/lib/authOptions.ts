import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      console.log("[auth] signIn callback fired for", user.email);
      if (!user.email) return false;
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("users").upsert(
        { email: user.email, name: user.name ?? null, image: user.image ?? null },
        { onConflict: "email" }
      );
      if (error) console.error("[auth] Supabase upsert error:", error);
      return true;
    },
    session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.sub;
      return session;
    },
  },
};
