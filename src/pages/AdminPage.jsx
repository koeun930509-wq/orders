import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext.jsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header.jsx";
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
      <div>
        <Header />
        <div className="mx-auto max-w-sm py-24 pt-40 text-center">
          <p>권한이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-4xl p-4 pt-20">
        <h1 className="py-6 text-center text-lg font-medium">전체 주문 관리</h1>

        {ordersLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!ordersLoading && !error && orders.length === 0 && (
          <p className="text-sm text-muted-foreground">아직 주문이 없어요</p>
        )}

        {!ordersLoading && orders.length > 0 && (
          <Table>
            <TableHeader className="bg-[#f8f8f8]">
              <TableRow className="border-b-0 hover:bg-transparent">
                <TableHead className="text-center">주문 내역</TableHead>
                <TableHead className="text-center">픽업 희망 시간</TableHead>
                <TableHead className="text-center">합계</TableHead>
                <TableHead className="text-center">상태</TableHead>
                <TableHead className="text-center">주문 시각</TableHead>
                <TableHead className="text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="whitespace-pre">
                    {order.order_text.split(", ").join("\n")}
                  </TableCell>
                  <TableCell className="text-center">{order.pickup_time}</TableCell>
                  <TableCell className="text-center">{order.total_amount.toLocaleString()}원</TableCell>
                  <TableCell className="text-center">
                    <Badge className={STATUS_BADGE_CLASS[order.status]}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{formatDateTime(order.created_at)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1.5">
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
    </div>
  );
}

export default AdminPage;
