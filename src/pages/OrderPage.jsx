import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import menu from "@/data/menu.js";
import MenuCard from "@/components/MenuCard.jsx";
import heroImage from "@/assets/hero-bread.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext.jsx";

function OrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState([]); // [{ id, quantity }]
  const [pickupTime, setPickupTime] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  function handleAdd(id) {
    setCart((prev) => {
      const existing = prev.find((line) => line.id === id);
      if (existing) {
        return prev.map((line) =>
          line.id === id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...prev, { id, quantity: 1 }];
    });
  }

  function handleQuantityChange(id, delta) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.id === id ? { ...line, quantity: line.quantity + delta } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  const totalCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const totalPrice = cart.reduce((sum, line) => {
    const item = menu.find((m) => m.id === line.id);
    return sum + (item ? item.price * line.quantity : 0);
  }, 0);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleOrder() {
    if (!pickupTime.trim()) {
      setOrderError("픽업 희망 시간을 입력해주세요");
      setOrderSuccess(false);
      return;
    }
    setOrderError("");
    setOrderSuccess(false);

    const orderText = cart
      .map((line) => {
        const item = menu.find((m) => m.id === line.id);
        return `${item.name} x${line.quantity}`;
      })
      .join(", ");

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      pickup_time: pickupTime,
      order_text: orderText,
      total_amount: totalPrice,
    });

    if (error) {
      setOrderError(error.message);
      return;
    }

    setOrderSuccess(true);
    setCart([]);
    setPickupTime("");
  }

  function renderCartBody(idSuffix) {
    return (
      <>
        <h2 className="text-base font-medium">주문서</h2>

        {cart.length === 0 ? (
          <p className="text-sm text-muted-foreground">담은 품목이 없어요</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cart.map((line) => {
              const item = menu.find((m) => m.id === line.id);
              return (
                <li key={line.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-full"
                      onClick={() => handleQuantityChange(line.id, -1)}
                    >
                      -
                    </Button>
                    <span className="w-4 text-center text-sm">{line.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="rounded-full"
                      onClick={() => handleQuantityChange(line.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">합계</span>
          <span className="text-base font-medium text-primary">
            {totalPrice.toLocaleString()}원
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`pickupTime-${idSuffix}`}>픽업 희망 시간</Label>
          <Input
            id={`pickupTime-${idSuffix}`}
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            placeholder="예: 오늘 18:00"
          />
        </div>

        {orderError && <p className="text-sm text-destructive">{orderError}</p>}
        {orderSuccess && <p className="text-sm text-[#006400]">주문이 접수되었습니다</p>}

        {user ? (
          <Button
            className="h-auto w-full py-4 text-base font-medium"
            disabled={cart.length === 0}
            onClick={handleOrder}
          >
            주문하기
          </Button>
        ) : (
          <Button
            className="h-auto w-full py-4 text-base font-medium"
            onClick={() => navigate("/auth")}
          >
            로그인하고 주문하기
          </Button>
        )}
      </>
    );
  }

  return (
    <div>
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between gap-2 border-b border-border bg-background px-6 sm:gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <span className="whitespace-nowrap font-heading text-base font-medium sm:text-lg">소금빵 카페 베통</span>
          <Badge>{totalCount}</Badge>
        </div>

        {user ? (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/my">내 주문</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        ) : (
          <Button size="sm" asChild>
            <Link to="/auth">로그인</Link>
          </Button>
        )}
      </header>

      <div className="pt-16">
        <div className="relative h-40 w-full overflow-hidden sm:h-52 md:h-64">
          <img
            src={heroImage}
            alt="소금빵 카페 베통 매장 진열대"
            className="h-full w-full object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <h1 className="text-2xl font-medium drop-shadow-sm">소금빵 카페 베통</h1>
            <p className="mt-1 text-sm text-white/90 drop-shadow-sm">오늘만 굽는 소금빵, 오늘만 만나요</p>
          </div>
        </div>
      </div>

      <div className="pb-32 md:flex md:items-start md:gap-4 md:px-6 md:pb-6">
        <section className="p-6 md:flex-1 md:p-0 md:py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {menu.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={() => handleAdd(item.id)} />
            ))}
          </div>
        </section>

        <aside className="hidden md:sticky md:top-20 md:mt-6 md:flex md:w-80 md:shrink-0 md:max-h-[calc(100vh-6rem)] md:flex-col md:gap-4 md:overflow-y-auto md:rounded-lg md:border md:border-border md:bg-card md:p-5">
          {renderCartBody("desktop")}
        </aside>
      </div>

      <section className="fixed inset-x-0 bottom-0 z-40 flex w-full max-h-[70vh] flex-col gap-4 overflow-y-auto rounded-t-lg border-t border-border bg-card p-5 md:hidden">
        {renderCartBody("mobile")}
      </section>
    </div>
  );
}

export default OrderPage;
