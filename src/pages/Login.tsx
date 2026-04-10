import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Heart, LogIn } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toast.error("로그인 실패: " + error.message);
      return;
    }

    // Check approval status
    const { data: profile } = await supabase
      .from("profiles")
      .select("approved")
      .eq("id", data.user.id)
      .single();

    if (!profile?.approved) {
      await supabase.auth.signOut();
      setLoading(false);
      toast.error("관리자 승인 대기 중입니다. 승인 후 로그인할 수 있습니다.");
      return;
    }

    // approved but possibly expired → let them in, Admin/Kiosk will show notice
    setLoading(false);
    navigate("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">보건일지</h1>
          <p className="mt-1 text-sm text-muted-foreground">보건교사 전용 관리 시스템</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="teacher@school.ac.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <LogIn className="h-4 w-4" />
            {loading ? "로그인 중..." : "로그인"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
