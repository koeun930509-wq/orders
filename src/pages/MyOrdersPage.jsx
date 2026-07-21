import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext.jsx";
import { Badge } from "@/components/ui/badge";

const STATUS_BADGE_CLASS = {
  접수: "bg-[#458fff]/10 text-[#254fad] dark:bg-[#458fff]/20 dark:text-[#8fb8ff]",
  완료: "bg-[#39bf45]/10 text-[#006400] dark:bg-[#39bf45]/20 dark:text-[#5ee06a]",
};

function formatDateTime(value) {
  return new Date(value).toLocaleString("ko-KR");
}

function MyOrdersPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      setLoading(true);
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
      setLoading(false);
    }

    fetchOrders();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-lg font-medium">내 주문</h1>

      {loading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-sm text-muted-foreground">아직 주문이 없어요</p>
      )}

      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">{order.order_text}</span>
              <Badge className={STATUS_BADGE_CLASS[order.status]}>{order.status}</Badge>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
              <span>{order.total_amount.toLocaleString()}원</span>
              <span>{formatDateTime(order.created_at)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyOrdersPage;
