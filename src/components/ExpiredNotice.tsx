import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle, Phone } from "lucide-react";

export default function ExpiredNotice() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">사용 기간 만료</h1>
        <p className="text-muted-foreground mb-4">
          사용 기간이 만료되었습니다.<br />
          관리자에게 사용 기간 연장을 요청하세요.
        </p>
        <a
          href="tel:010-5168-3210"
          className="inline-flex items-center gap-2 text-primary font-medium mb-8"
        >
          <Phone className="h-4 w-4" />
          010-5168-3210
        </a>
        <div className="mb-8" />
        <Button variant="outline" className="gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}
