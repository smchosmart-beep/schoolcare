import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, LogOut, Monitor, LayoutDashboard, Settings, FileText, Upload } from "lucide-react";
import { loadStudents } from "@/lib/students";
import AdminDashboard from "@/components/admin/AdminDashboard";
import SelfTreatmentSettings from "@/components/admin/SelfTreatmentSettings";
import StudentUpload from "@/components/admin/StudentUpload";
import HealthJournal from "@/components/admin/HealthJournal";

export default function Admin() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleKioskMode = () => {
    navigate("/kiosk");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse-gentle text-primary">
          <Heart className="h-12 w-12" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const schoolName = user.user_metadata?.school_name || "보건실";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{schoolName} 보건일지</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleKioskMode}>
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">키오스크 모드</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">대시보드</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">치료항목</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">학생명단</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">보건일지</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard teacherId={user.id} />
          </TabsContent>
          <TabsContent value="settings">
            <SelfTreatmentSettings teacherId={user.id} />
          </TabsContent>
          <TabsContent value="upload">
            <StudentUpload />
          </TabsContent>
          <TabsContent value="journal">
            <HealthJournal teacherId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
