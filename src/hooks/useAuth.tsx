import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  approved: boolean | null;
  isAdmin: boolean;
  expired: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  approved: null,
  isAdmin: false,
  expired: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const checkApprovalAndRole = async (userId: string) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("approved, expires_at").eq("id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    
    setApproved(profileRes.data?.approved ?? false);
    setExpiresAt(profileRes.data?.expires_at ?? null);
    setIsAdmin(roleRes.data?.some((r) => r.role === "admin") ?? false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          await checkApprovalAndRole(session.user.id);
        }

        if (event === "SIGNED_OUT") {
          setApproved(null);
          setIsAdmin(false);
          setExpiresAt(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkApprovalAndRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Timezone-safe date comparison
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const expired = !isAdmin && (!expiresAt || expiresAt < today);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, approved, isAdmin, expired, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
