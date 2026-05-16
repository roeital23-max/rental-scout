import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "next-auth/adapters";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function rowToUser(row: Record<string, unknown>): AdapterUser {
  return {
    id: row.id as string,
    name: (row.name as string) ?? null,
    email: row.email as string,
    emailVerified: row.emailVerified ? new Date(row.emailVerified as string) : null,
    image: (row.image as string) ?? null,
  };
}

export const supabaseAdapter: Adapter = {
  async createUser(user: Omit<AdapterUser, "id">) {
    const { data, error } = await getSupabase()
      .from("users")
      .insert({ name: user.name, email: user.email, image: user.image, emailVerified: user.emailVerified?.toISOString() ?? null })
      .select()
      .single();
    if (error) throw error;
    return rowToUser(data);
  },

  async getUser(id) {
    const { data } = await getSupabase().from("users").select().eq("id", id).maybeSingle();
    return data ? rowToUser(data) : null;
  },

  async getUserByEmail(email) {
    const { data } = await getSupabase().from("users").select().eq("email", email).maybeSingle();
    return data ? rowToUser(data) : null;
  },

  async getUserByAccount({ provider, providerAccountId }) {
    const supabase = getSupabase();
    const { data: account } = await supabase
      .from("accounts")
      .select("userId")
      .eq("provider", provider)
      .eq("providerAccountId", providerAccountId)
      .maybeSingle();
    if (!account) return null;
    const { data: user } = await supabase.from("users").select().eq("id", account.userId).maybeSingle();
    return user ? rowToUser(user) : null;
  },

  async updateUser(user) {
    const { data, error } = await getSupabase()
      .from("users")
      .update({ name: user.name, image: user.image, emailVerified: user.emailVerified?.toISOString() ?? null })
      .eq("id", user.id!)
      .select()
      .single();
    if (error) throw error;
    return rowToUser(data);
  },

  async linkAccount(account: AdapterAccount) {
    await getSupabase().from("accounts").upsert({
      userId: account.userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refresh_token: account.refresh_token,
      access_token: account.access_token,
      expires_at: account.expires_at,
      token_type: account.token_type,
      scope: account.scope,
      id_token: account.id_token,
      session_state: account.session_state,
    }, { onConflict: "provider,providerAccountId" });
    return account;
  },

  async createVerificationToken(token) {
    await getSupabase().from("verification_tokens").insert({
      identifier: token.identifier,
      token: token.token,
      expires: token.expires.toISOString(),
    });
    return token;
  },

  async useVerificationToken({ identifier, token }) {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("verification_tokens")
      .select()
      .eq("identifier", identifier)
      .eq("token", token)
      .maybeSingle();
    if (!data) return null;
    await supabase.from("verification_tokens").delete().eq("identifier", identifier).eq("token", token);
    return { identifier: data.identifier, token: data.token, expires: new Date(data.expires) };
  },

  // JWT strategy — these are never called
  async createSession(session) { return session as AdapterSession; },
  async getSessionAndUser() { return null; },
  async updateSession(session) { return session as AdapterSession; },
  async deleteSession() { },
  async deleteUser() { },
  async unlinkAccount() { },
} satisfies Adapter;
