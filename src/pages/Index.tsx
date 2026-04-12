import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import schoolcareLogo from "@/assets/schoolcare-logo.png";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      navigate(user ? "/admin" : "/login");
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="animate-pulse-gentle text-primary">
        <img src={schoolcareLogo} alt="SchoolCare" className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}
