import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext.jsx";
import betongLogo from "@/assets/betong-logo.png";

function Header({ totalCount }) {
  const { user } = useAuth();
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }

    let cancelled = false;

    async function fetchRole() {
      const { data } = await supabase.from("profiles").select("role");
      if (!cancelled) {
        setRole(data?.[0]?.role ?? "customer");
      }
    }

    fetchRole();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between gap-2 border-b border-border bg-background px-6 sm:gap-4">
      <div className="flex shrink-0 items-center gap-2">
        <Link to="/">
          <img src={betongLogo} alt="BETONG" className="h-6 w-auto" />
        </Link>
        {typeof totalCount === "number" && <Badge>{totalCount}</Badge>}
      </div>

      {user ? (
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
          {role === "owner" && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">회원 주문 관리</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link to="/my">내 주문</Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      ) : (
        <Button size="sm" className="bg-[#969696] hover:bg-primary" asChild>
          <Link to="/auth">로그인</Link>
        </Button>
      )}
    </header>
  );
}

export default Header;
