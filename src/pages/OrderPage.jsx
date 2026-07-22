import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import menuImages from "@/data/menuImages.js";
import MenuCard from "@/components/MenuCard.jsx";
import Header from "@/components/Header.jsx";
import heroImage from "@/assets/hero-bread.jpg";
import betongLogo from "@/assets/betong-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext.jsx";

function OrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cart, setCart] = useState([]); // [{ id, quantity }]
  const [pickupTime, setPickupTime] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [mobileCartExpanded, setMobileCartExpanded] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      setMenuLoading(true);
      const { data, error } = await supabase
        .from("menu")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) {
        setMenu(data.map((item) => ({ ...item, image: item.image_url || menuImages[item.name] })));
      }
      setMenuLoading(false);
    }

    fetchMenu();
  }, []);

  function handleAdd(id) {
    setCart((prev) => {
      const existing = prev.find((line) => line.id === id);
      if (existing) {
        return prev.map((line) => (line.id === id ? { ...line, quantity: line.quantity + 1 } : line));
      }
      return [...prev, { id, quantity: 1 }];
    });
  }

  function handleQuantityChange(id, delta) {
    setCart((prev) => prev.map((line) => (line.id === id ? { ...line, quantity: line.quantity + delta } : line)).filter((line) => line.quantity > 0));
  }

  const totalCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const totalPrice = cart.reduce((sum, line) => {
    const item = menu.find((m) => m.id === line.id);
    return sum + (item ? item.price * line.quantity : 0);
  }, 0);

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
    setMobileCartExpanded(false);
  }

  function renderOrderButton() {
    return user ? (
      <Button className="h-auto w-full rounded-none py-4 text-base font-medium xl:rounded-lg" disabled={cart.length === 0} onClick={handleOrder}>
        주문하기
      </Button>
    ) : (
      <Button className="h-auto w-full rounded-none py-4 text-base font-medium xl:rounded-lg" onClick={() => navigate("/auth")}>
        로그인하고 주문하기
      </Button>
    );
  }

  function renderCartBody(idSuffix, { showHeading = true } = {}) {
    return (
      <>
        {showHeading && <h2 className="text-base font-medium">주문서</h2>}

        {cart.length === 0 ? (
          <p className="text-sm text-muted-foreground">담은 품목이 없어요</p>
        ) : (
          <ul className="flex max-h-40 min-h-0 shrink-0 flex-col gap-3 overflow-y-auto pr-1 xl:max-h-none xl:overflow-visible">
            {cart.map((line) => {
              const item = menu.find((m) => m.id === line.id);
              return (
                <li key={line.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon-sm" className="rounded-full" onClick={() => handleQuantityChange(line.id, -1)}>
                      -
                    </Button>
                    <span className="w-4 text-center text-sm">{line.quantity}</span>
                    <Button variant="outline" size="icon-sm" className="rounded-full" onClick={() => handleQuantityChange(line.id, 1)}>
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
          <span className="text-[1.2rem] font-medium text-primary">{totalPrice.toLocaleString()}원</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`pickupTime-${idSuffix}`}>픽업 희망 시간</Label>
          <Input
            id={`pickupTime-${idSuffix}`}
            className="h-12"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            placeholder="예: 오늘 18:00"
          />
        </div>

        {orderError && <p className="text-sm text-destructive">{orderError}</p>}

        {renderOrderButton()}
      </>
    );
  }

  return (
    <div>
      <Header totalCount={totalCount} />

      <div className="pt-16">
        <div className="relative h-40 w-full overflow-hidden sm:h-52 xl:h-64">
          <img src={heroImage} alt="소금빵 카페 베통 매장 진열대" className="h-full w-full object-cover object-[center_20%]" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
            <h1>
              <img
                src={betongLogo}
                alt="BETONG"
                className="h-8 w-auto brightness-0 invert drop-shadow-sm sm:h-10"
              />
            </h1>
            <p className="mt-1 text-sm text-white/90 drop-shadow-sm">SALT BREAD & COFFEE</p>
          </div>
        </div>
      </div>

      <div className="pb-32 xl:flex xl:items-start xl:gap-4 xl:px-6 xl:pb-6">
        <section className="px-4 pt-4 xl:flex-1 xl:p-0 xl:py-6">
          {menuLoading ? (
            <p className="text-sm text-muted-foreground">메뉴를 불러오는 중...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-6 xl:grid-cols-3 xl:gap-6">
              {menu.map((item) => (
                <MenuCard key={item.id} item={item} onAdd={() => handleAdd(item.id)} />
              ))}
            </div>
          )}
        </section>

        <aside className="hidden xl:sticky xl:top-20 xl:mt-6 xl:flex xl:w-80 xl:shrink-0 xl:max-h-[calc(100vh-6rem)] xl:flex-col xl:gap-4 xl:overflow-y-auto xl:rounded-lg xl:border xl:border-border xl:bg-card xl:p-5">
          {renderCartBody("desktop")}
        </aside>
      </div>

      <section className="fixed inset-x-0 bottom-0 z-40 w-full rounded-t-lg border-t border-border bg-card xl:hidden">
        {cart.length === 0 ? (
          renderOrderButton()
        ) : mobileCartExpanded ? (
          <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-5">
            <button
              type="button"
              className="flex items-center justify-between text-left"
              onClick={() => setMobileCartExpanded(false)}
            >
              <h2 className="text-base font-medium">주문서</h2>
              <span className="text-sm text-muted-foreground">접기 ▾</span>
            </button>
            {renderCartBody("mobile", { showHeading: false })}
          </div>
        ) : (
          <button
            type="button"
            className="flex w-full items-center justify-between p-5"
            onClick={() => setMobileCartExpanded(true)}
          >
            <span className="text-sm text-muted-foreground">담은 품목 {totalCount}개 ▴</span>
            <span className="text-[1.2rem] font-medium text-primary">{totalPrice.toLocaleString()}원</span>
          </button>
        )}
      </section>

      <Dialog open={orderSuccess} onOpenChange={setOrderSuccess}>
        <DialogContent>
          <DialogTitle>주문이 완료되었습니다</DialogTitle>
          <DialogDescription>픽업 시간에 맞춰 준비해 드릴게요.</DialogDescription>
          <Button className="mt-4 h-auto w-full py-3" asChild>
            <Link to="/my">내 주문 목록으로 이동</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderPage;
