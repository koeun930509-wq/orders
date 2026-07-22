import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import loginBgImage from "@/assets/login-bg.webp";
import betongLogo from "@/assets/betong-logo.png";

function AuthPage() {
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupNickname, setSignupNickname] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);
    if (error) {
      setLoginError(error.message);
      return;
    }
    navigate("/");
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!signupNickname.trim()) {
      setSignupError("닉네임을 입력해주세요");
      return;
    }
    setSignupError("");
    setSignupLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { nickname: signupNickname },
      },
    });
    setSignupLoading(false);
    if (error) {
      setSignupError(error.message);
      return;
    }
    navigate("/");
  }

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center bg-cover bg-center px-4 py-12"
      style={{ backgroundImage: `url(${loginBgImage})` }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <Card className="relative w-full max-w-sm rounded-md border-none bg-transparent shadow-none">
        <CardHeader>
          <Link to="/" className="mx-auto mb-3 block w-fit">
            <img
              src={betongLogo}
              alt="BETONG"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <CardTitle className="text-center text-base font-light text-white">오늘의 주문</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="w-full !h-auto bg-white/10">
              <TabsTrigger
                value="login"
                className="h-auto py-2.5 text-base text-white/70 hover:text-white data-active:bg-white/15 data-active:text-white"
              >
                로그인
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="h-auto py-2.5 text-base text-white/70 hover:text-white data-active:bg-white/15 data-active:text-white"
              >
                회원가입
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login-email" className="text-white/90">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="login-password" className="text-white/90">비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      className="h-12 border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/40"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-white/60 hover:text-white"
                      aria-label={showLoginPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                    >
                      {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                <Button
                  type="submit"
                  variant="ghost"
                  className="h-12 w-full text-base font-medium text-white hover:bg-transparent hover:text-white"
                  disabled={loginLoading}
                >
                  {loginLoading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form className="flex flex-col gap-4" onSubmit={handleSignup}>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup-nickname" className="text-white/90">닉네임</Label>
                  <Input
                    id="signup-nickname"
                    className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    required
                    value={signupNickname}
                    onChange={(e) => setSignupNickname(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup-email" className="text-white/90">이메일</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup-password" className="text-white/90">비밀번호</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      className="h-12 border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/40"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-white/60 hover:text-white"
                      aria-label={showSignupPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                    >
                      {showSignupPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                {signupError && <p className="text-sm text-destructive">{signupError}</p>}
                <Button
                  type="submit"
                  className="h-12 w-full text-base font-medium"
                  disabled={signupLoading}
                >
                  {signupLoading ? "가입 중..." : "회원가입"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthPage;
