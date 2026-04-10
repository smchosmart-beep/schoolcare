import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Clock, UserCheck } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  school_name: string;
  approved: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("사용자 목록을 불러올 수 없습니다.");
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ approved: true })
      .eq("id", id);

    if (error) {
      toast.error("승인 처리 중 오류가 발생했습니다.");
    } else {
      toast.success("승인 완료!");
      fetchProfiles();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ approved: false })
      .eq("id", id);

    if (error) {
      toast.error("처리 중 오류가 발생했습니다.");
    } else {
      toast.success("승인이 취소되었습니다.");
      fetchProfiles();
    }
  };

  const pendingProfiles = profiles.filter((p) => !p.approved);
  const approvedProfiles = profiles.filter((p) => p.approved);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">불러오는 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Pending Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-amber-500" />
            승인 대기 ({pendingProfiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">대기 중인 가입 요청이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {pendingProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{profile.email}</p>
                    <div className="flex items-center gap-2">
                      {profile.school_name && (
                        <Badge variant="secondary" className="text-xs">
                          {profile.school_name}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => handleApprove(profile.id)}
                  >
                    <Check className="h-4 w-4" />
                    승인
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-primary" />
            승인된 사용자 ({approvedProfiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">승인된 사용자가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {approvedProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{profile.email}</p>
                    <div className="flex items-center gap-2">
                      {profile.school_name && (
                        <Badge variant="secondary" className="text-xs">
                          {profile.school_name}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive"
                    onClick={() => handleReject(profile.id)}
                  >
                    <X className="h-4 w-4" />
                    승인 취소
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
