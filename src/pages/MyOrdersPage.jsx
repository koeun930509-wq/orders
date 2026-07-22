import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext.jsx";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/Header.jsx";
import menu from "@/data/menu.js";

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
  const [editingId, setEditingId] = useState(null);
  const [editPickupTime, setEditPickupTime] = useState("");
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

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

  function startEdit(order) {
    setEditingId(order.id);
    setEditPickupTime(order.pickup_time);
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditPickupTime("");
    setEditError("");
  }

  async function saveEdit(orderId) {
    if (!editPickupTime.trim()) {
      setEditError("픽업 희망 시간을 입력해주세요");
      return;
    }
    setEditSaving(true);
    setEditError("");

    const { error } = await supabase
      .from("orders")
      .update({ pickup_time: editPickupTime })
      .eq("id", orderId);

    setEditSaving(false);

    if (error) {
      setEditError(error.message);
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, pickup_time: editPickupTime } : order,
      ),
    );
    setEditingId(null);
  }

  if (!user) {
    return null;
  }

  const receivedOrders = orders.filter((order) => order.status === "접수");
  const completedOrders = orders.filter((order) => order.status === "완료");

  function renderOrderList(list) {
    if (!loading && !error && list.length === 0) {
      return (
        <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">주문이 없어요</p>
        </div>
      );
    }

    return (
      <ul className="flex flex-col gap-4">
        {list.map((order, index) => (
            <li
              key={order.id}
              className="rounded-md bg-card p-6 font-mono"
            >
              <div className="mb-4 flex flex-col items-center gap-4">
                <span className="text-lg font-bold tracking-wide">
                  ORDER LIST {list.length - index}
                </span>
                <Badge className={STATUS_BADGE_CLASS[order.status]}>{order.status}</Badge>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                {formatDateTime(order.created_at)}
              </div>

              <div className="my-3 border-t border-dashed border-border" />

              <div className="flex flex-col gap-1.5">
                {order.order_text.split(", ").map((line, index) => {
                  const match = line.match(/^(.*)\s x(\d+)$/) || line.match(/^(.*)\sx(\d+)$/);
                  const name = match ? match[1] : line;
                  const qty = match ? Number(match[2]) : 1;
                  const price = menu.find((m) => m.name === name)?.price ?? null;
                  return (
                    <div key={index} className="flex items-baseline gap-2 text-sm leading-[1.875]">
                      <span className="whitespace-nowrap">{name}</span>
                      <span className="flex-1 border-b border-dotted border-muted-foreground/40" />
                      <span className="w-6 shrink-0 text-right text-muted-foreground">{qty}</span>
                      <span className="w-20 shrink-0 text-right">
                        {price !== null ? (price * qty).toLocaleString() : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="my-3 border-t border-dashed border-border" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm">합계</span>
                <span className="text-[1.5rem] font-bold">
                  {order.total_amount.toLocaleString()}원
                </span>
              </div>

              <div className="my-3 border-t border-dashed border-border" />

              {editingId === order.id ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">픽업 희망 시간</span>
                  <Input
                    className="h-12 font-sans"
                    value={editPickupTime}
                    onChange={(e) => setEditPickupTime(e.target.value)}
                    placeholder="예: 오늘 18:00"
                  />
                  {editError && <p className="text-sm text-destructive">{editError}</p>}
                  <div className="flex gap-2">
                    <Button
                      className="h-auto flex-1 py-3 font-sans"
                      disabled={editSaving}
                      onClick={() => saveEdit(order.id)}
                    >
                      저장
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto flex-1 py-3 font-sans"
                      onClick={cancelEdit}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    픽업 희망 시간: {order.pickup_time}
                  </span>
                  {order.status === "접수" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-sans"
                      onClick={() => startEdit(order)}
                    >
                      수정
                    </Button>
                  )}
                </div>
              )}
            </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <Header />

      <div className="mx-auto max-w-2xl p-4 pt-20">
        {loading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && (
          <Tabs defaultValue="접수">
            <TabsList className="grid w-full grid-cols-2 group-data-horizontal/tabs:h-auto">
              <TabsTrigger value="접수" className="h-auto py-3">접수 ({receivedOrders.length})</TabsTrigger>
              <TabsTrigger value="완료" className="h-auto py-3">완료 ({completedOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="접수" className="mt-4">
              {renderOrderList(receivedOrders)}
            </TabsContent>
            <TabsContent value="완료" className="mt-4">
              {renderOrderList(completedOrders)}
            </TabsContent>
          </Tabs>
        )}

        {orders.length === 0 && !loading && !error && (
          <div className="fixed inset-x-0 bottom-0 z-40 bg-card">
            <Button asChild className="h-auto w-full rounded-none py-3 text-[1.5rem] font-medium">
              <Link to="/">주문하러 가기</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;
