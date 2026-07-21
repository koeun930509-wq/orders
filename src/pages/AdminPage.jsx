import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext.jsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_BADGE_CLASS = {
  접수: "bg-[#458fff]/10 text-[#254fad] dark:bg-[#458fff]/20 dark:text-[#8fb8ff]",
  완료: "bg-[#39bf45]/10 text-[#006400] dark:bg-[#39bf45]/20 dark:text-[#5ee06a]",
};

function formatDateTime(value) {
  return new Date(value).toLocaleString("ko-KR");
}

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    async function fetchRole() {
      setRoleLoading(true);
      const { data } = await supabase.from("profiles").select("role");
      setRole(data?.[0]?.role ?? "customer");
      setRoleLoading(false);
    }

    fetchRole();
  }, [user]);

  useEffect(() => {
    if (role !== "owner") return;

    async function fetchOrders() {
      setOrdersLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setOrders(data);
      }
      setOrdersLoading(false);
    }

    fetchOrders();
  }, [role]);

  useEffect(() => {
    if (roleLoading || role === "owner") return;
    const timer = setTimeout(() => navigate("/"), 1500);
    return () => clearTimeout(timer);
  }, [roleLoading, role, navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleComplete(orderId) {
    const { error } = await supabase
      .from("orders")
      .update({ status: "완료" })
      .eq("id", orderId);

    if (error) {
      setError(error.message);
      return;
    }
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: "완료" } : order)),
    );
  }

  async function handleDelete(orderId) {
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      setError(error.message);
      return;
    }
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  }

  if (!user || roleLoading) {
    return null;
  }

  if (role !== "owner") {
    return (
      <div className="mx-auto max-w-sm py-24 text-center">
        <p>권한이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-medium">전체 주문 관리</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>

      {ordersLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!ordersLoading && !error && orders.length === 0 && (
        <p className="text-sm text-muted-foreground">아직 주문이 없어요</p>
      )}

      {!ordersLoading && orders.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주문 내역</TableHead>
              <TableHead>픽업 희망 시간</TableHead>
              <TableHead>합계</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>주문 시각</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="whitespace-normal">{order.order_text}</TableCell>
                <TableCell>{order.pickup_time}</TableCell>
                <TableCell>{order.total_amount.toLocaleString()}원</TableCell>
                <TableCell>
                  <Badge className={STATUS_BADGE_CLASS[order.status]}>{order.status}</Badge>
                </TableCell>
                <TableCell>{formatDateTime(order.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={order.status === "완료"}
                      onClick={() => handleComplete(order.id)}
                    >
                      완료
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(order.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default AdminPage;
