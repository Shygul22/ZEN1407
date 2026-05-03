import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "admin" | "accounts" | "service_eng" | "sales" | "customer";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  viewAs: AppRole | null;
  setViewAs: (r: AppRole | null) => void;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [viewAs, setViewAs] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadRoles(s.user.id), 0);
      } else {
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadRoles(data.session.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadRoles(uid: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setRoles((data?.map((r) => r.role) as AppRole[]) ?? []);
  }

  const order: AppRole[] = ["super_admin", "admin", "accounts", "service_eng", "sales", "customer"];
  const primaryRole = roles.sort((a, b) => order.indexOf(a) - order.indexOf(b))[0] ?? null;

  return (
    <Ctx.Provider
      value={{
        user, session, roles, primaryRole,
        viewAs, setViewAs,
        loading,
        signOut: async () => { await supabase.auth.signOut(); setViewAs(null); },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}

export function useEffectiveRole(): AppRole | null {
  const { primaryRole, viewAs } = useAuth();
  // Super admin can preview any role; others stick to their primary role
  if (primaryRole === "super_admin" && viewAs) return viewAs;
  return primaryRole;
}
