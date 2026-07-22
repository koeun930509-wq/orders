import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext.jsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/Header.jsx";
import MenuFormDialog from "@/components/MenuFormDialog.jsx";
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
  const date = new Date(value);
  return `${date.toLocaleDateString("ko-KR")}\n${date.toLocaleTimeString("ko-KR")}`;
}

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem("adminActiveTab") || "orders",
  );

  function handleTabChange(value) {
    setActiveTab(value);
    sessionStorage.setItem("adminActiveTab", value);
  }

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PAGE_SIZE = 4;

  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [menuPage, setMenuPage] = useState(1);
  const MENU_PAGE_SIZE = 10;

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [newSaving, setNewSaving] = useState(false);

  const [editingMenuId, setEditingMenuId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!newImageFile) {
      setNewImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(newImageFile);
    setNewImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newImageFile]);

  useEffect(() => {
    if (!editImageFile) {
      setEditImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(editImageFile);
    setEditImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editImageFile]);

  function validateImageFile(file) {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return "JPG, PNG 파일만 업로드할 수 있어요";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "파일 크기는 최대 5MB까지 가능해요";
    }
    return null;
  }

  function handleNewImageSelect(file) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setMenuError(validationError);
      return;
    }
    setMenuError("");
    setNewImageFile(file);
  }

  function handleEditImageSelect(file) {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setMenuError(validationError);
      return;
    }
    setMenuError("");
    setEditImageFile(file);
  }

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

      const [ordersResult, profilesResult] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, nickname"),
      ]);

      if (ordersResult.error) {
        setError(ordersResult.error.message);
      } else {
        const nicknameByUserId = Object.fromEntries(
          (profilesResult.data ?? []).map((p) => [p.user_id, p.nickname]),
        );
        setOrders(
          ordersResult.data.map((order) => ({
            ...order,
            nickname: nicknameByUserId[order.user_id] ?? "-",
          })),
        );
      }
      setOrdersLoading(false);
    }

    fetchOrders();
  }, [role]);

  useEffect(() => {
    if (role !== "owner") return;

    async function fetchMenu() {
      setMenuLoading(true);
      setMenuError("");

      const { data, error } = await supabase
        .from("menu")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMenuError(error.message);
      } else {
        setMenuItems(data);
      }
      setMenuLoading(false);
    }

    fetchMenu();
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

  async function uploadMenuImage(file) {
    const extension = file.name.split(".").pop().toLowerCase();
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("menu-images").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("menu-images").getPublicUrl(path).data.publicUrl;
  }

  async function handleCreateMenu(e) {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim()) {
      setMenuError("상품명과 가격을 입력해주세요");
      return;
    }
    setNewSaving(true);
    setMenuError("");

    try {
      const imageUrl = newImageFile ? await uploadMenuImage(newImageFile) : null;

      const { data, error } = await supabase
        .from("menu")
        .insert({
          name: newName,
          price: Number(newPrice),
          description: newDescription,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setMenuItems((prev) => [data, ...prev]);
      setNewName("");
      setNewPrice("");
      setNewDescription("");
      setNewImageFile(null);
      setAddDialogOpen(false);
    } catch (error) {
      setMenuError(error.message);
    } finally {
      setNewSaving(false);
    }
  }

  function startMenuEdit(item) {
    setEditingMenuId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditDescription(item.description ?? "");
    setEditImageFile(null);
    setMenuError("");
  }

  function cancelMenuEdit() {
    setEditingMenuId(null);
    setEditName("");
    setEditPrice("");
    setEditDescription("");
    setEditImageFile(null);
  }

  async function saveMenuEdit(itemId) {
    if (!editName.trim() || !editPrice.trim()) {
      setMenuError("상품명과 가격을 입력해주세요");
      return;
    }
    setEditSaving(true);
    setMenuError("");

    try {
      const imageUrl = editImageFile ? await uploadMenuImage(editImageFile) : undefined;

      const { error } = await supabase
        .from("menu")
        .update({
          name: editName,
          price: Number(editPrice),
          description: editDescription,
          ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
        })
        .eq("id", itemId);

      if (error) throw error;

      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                name: editName,
                price: Number(editPrice),
                description: editDescription,
                ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
              }
            : item,
        ),
      );
      setEditingMenuId(null);
    } catch (error) {
      setMenuError(error.message);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleToggleSoldOut(item) {
    const { error } = await supabase
      .from("menu")
      .update({ is_sold_out: !item.is_sold_out })
      .eq("id", item.id);

    if (error) {
      setMenuError(error.message);
      return;
    }
    setMenuItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, is_sold_out: !m.is_sold_out } : m)),
    );
  }

  async function handleDeleteMenu(itemId) {
    const { error } = await supabase.from("menu").delete().eq("id", itemId);

    if (error) {
      setMenuError(error.message);
      return;
    }
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
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

  const menuTotalPages = Math.max(1, Math.ceil(menuItems.length / MENU_PAGE_SIZE));
  const currentMenuPage = Math.min(menuPage, menuTotalPages);
  const pagedMenuItems = menuItems.slice(
    (currentMenuPage - 1) * MENU_PAGE_SIZE,
    currentMenuPage * MENU_PAGE_SIZE,
  );
  const editingMenuItem = menuItems.find((item) => item.id === editingMenuId);

  const ordersTotalPages = Math.max(1, Math.ceil(orders.length / ORDERS_PAGE_SIZE));
  const currentOrdersPage = Math.min(ordersPage, ordersTotalPages);
  const pagedOrders = orders.slice(
    (currentOrdersPage - 1) * ORDERS_PAGE_SIZE,
    currentOrdersPage * ORDERS_PAGE_SIZE,
  );

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-4xl p-4 pt-25">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 group-data-horizontal/tabs:h-auto">
            <TabsTrigger value="orders" className="h-auto py-2.5 sm:py-3">주문 관리</TabsTrigger>
            <TabsTrigger value="menu" className="h-auto py-2.5 sm:py-3">메뉴 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            {ordersLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {!ordersLoading && !error && orders.length === 0 && (
              <p className="text-sm text-muted-foreground">아직 주문이 없어요</p>
            )}

            {!ordersLoading && orders.length > 0 && (
              <>
                <Table className="border-y border-border">
                  <TableHeader className="bg-[#f8f8f8]">
                    <TableRow className="border-b-0 hover:bg-transparent">
                      <TableHead className="text-center">닉네임</TableHead>
                      <TableHead className="text-center">주문 내역</TableHead>
                      <TableHead className="text-center">픽업 희망 시간</TableHead>
                      <TableHead className="text-center">합계</TableHead>
                      <TableHead className="text-center">상태</TableHead>
                      <TableHead className="text-center">주문 시각</TableHead>
                      <TableHead className="text-center">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-center">{order.nickname}</TableCell>
                        <TableCell className="whitespace-pre">
                          {order.order_text.split(", ").join("\n")}
                        </TableCell>
                        <TableCell className="text-center">{order.pickup_time}</TableCell>
                        <TableCell className="text-center">{order.total_amount.toLocaleString()}원</TableCell>
                        <TableCell className="text-center">
                          <Badge className={STATUS_BADGE_CLASS[order.status]}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-pre text-center">{formatDateTime(order.created_at)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full rounded-[4px]"
                              disabled={order.status === "완료"}
                              onClick={() => handleComplete(order.id)}
                            >
                              완료
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full rounded-[4px]"
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

                {ordersTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-[4px]"
                      disabled={currentOrdersPage === 1}
                      onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                    >
                      이전
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentOrdersPage} / {ordersTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-[4px]"
                      disabled={currentOrdersPage === ordersTotalPages}
                      onClick={() => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))}
                    >
                      다음
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="menu" className="mt-4 flex flex-col gap-6">
            <div className="flex justify-end">
              <Button
                className="h-auto gap-1.5 rounded-[4px] px-3.75 py-1.5"
                onClick={() => {
                  setMenuError("");
                  setAddDialogOpen(true);
                }}
              >
                <Plus className="size-4" />
                메뉴 추가
              </Button>
            </div>

            <MenuFormDialog
              open={addDialogOpen}
              onOpenChange={(nextOpen) => {
                setAddDialogOpen(nextOpen);
                if (!nextOpen) {
                  setNewName("");
                  setNewPrice("");
                  setNewDescription("");
                  setNewImageFile(null);
                  setMenuError("");
                }
              }}
              title="새 메뉴 등록"
              subtitle="레시피 정보를 입력해 주세요."
              idPrefix="new"
              name={newName}
              onNameChange={setNewName}
              price={newPrice}
              onPriceChange={setNewPrice}
              description={newDescription}
              onDescriptionChange={setNewDescription}
              imagePreview={newImagePreview}
              imageFileName={newImageFile?.name}
              onImageSelect={handleNewImageSelect}
              onRemoveImage={() => setNewImageFile(null)}
              error={menuError}
              saving={newSaving}
              onSubmit={handleCreateMenu}
              submitLabel="등록"
            />

            {menuLoading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

            {!menuLoading && menuItems.length === 0 && (
              <p className="text-sm text-muted-foreground">등록된 메뉴가 없어요</p>
            )}

            {!menuLoading && menuItems.length > 0 && (
              <>
                <Table className="border-y border-border">
                  <TableHeader className="bg-[#f8f8f8]">
                    <TableRow className="border-b-0 hover:bg-transparent">
                      <TableHead className="text-center">사진</TableHead>
                      <TableHead className="text-center">상품명</TableHead>
                      <TableHead className="text-center">가격</TableHead>
                      <TableHead className="text-center">설명</TableHead>
                      <TableHead className="text-center">품절여부</TableHead>
                      <TableHead className="text-center">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedMenuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="mx-auto h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{item.name}</TableCell>
                        <TableCell className="text-center">{item.price.toLocaleString()}원</TableCell>
                        <TableCell className="max-w-xs text-center text-muted-foreground">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              item.is_sold_out
                                ? "bg-destructive/10 text-destructive"
                                : STATUS_BADGE_CLASS["완료"]
                            }
                          >
                            {item.is_sold_out ? "품절" : "판매중"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1.5">
                            <Button variant="outline" size="sm" className="rounded-[4px]" onClick={() => handleToggleSoldOut(item)}>
                              {item.is_sold_out ? "판매 재개" : "품절 처리"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => startMenuEdit(item)}>
                              수정
                            </Button>
                            <Button variant="destructive" size="sm" className="rounded-[4px]" onClick={() => handleDeleteMenu(item.id)}>
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {menuTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-[4px]"
                      disabled={currentMenuPage === 1}
                      onClick={() => setMenuPage((p) => Math.max(1, p - 1))}
                    >
                      이전
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentMenuPage} / {menuTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-[4px]"
                      disabled={currentMenuPage === menuTotalPages}
                      onClick={() => setMenuPage((p) => Math.min(menuTotalPages, p + 1))}
                    >
                      다음
                    </Button>
                  </div>
                )}
              </>
            )}

            <MenuFormDialog
              open={editingMenuId !== null}
              onOpenChange={(nextOpen) => {
                if (!nextOpen) cancelMenuEdit();
              }}
              title="메뉴 수정"
              subtitle="레시피 정보를 수정해 주세요."
              idPrefix="edit"
              name={editName}
              onNameChange={setEditName}
              price={editPrice}
              onPriceChange={setEditPrice}
              description={editDescription}
              onDescriptionChange={setEditDescription}
              imagePreview={editImagePreview || editingMenuItem?.image_url}
              imageFileName={editImageFile?.name ?? "현재 사진"}
              onImageSelect={handleEditImageSelect}
              onRemoveImage={() => setEditImageFile(null)}
              error={menuError}
              saving={editSaving}
              onSubmit={(e) => {
                e.preventDefault();
                saveMenuEdit(editingMenuId);
              }}
              submitLabel="저장"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminPage;
