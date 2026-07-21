import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

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
    setSignupError("");
    setSignupLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
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
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-12"
      style={{ backgroundImage: `url(${loginBgImage})` }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <Card className="relative w-full max-w-sm rounded-md border-none bg-transparent shadow-none">
        <CardHeader>
          <img
            src={betongLogo}
            alt="BETONG"
            className="mx-auto mb-3 h-16 w-auto brightness-0 invert"
          />
          <CardTitle className="text-center text-2xl text-white">오늘의 주문</CardTitle>
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
                  <Input
                    id="login-password"
                    type="password"
                    className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                <Button
                  type="submit"
                  className="h-auto w-full py-4 text-base font-medium"
                  disabled={loginLoading}
                >
                  {loginLoading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form className="flex flex-col gap-4" onSubmit={handleSignup}>
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
                  <Input
                    id="signup-password"
                    type="password"
                    className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                </div>
                {signupError && <p className="text-sm text-destructive">{signupError}</p>}
                <Button
                  type="submit"
                  className="h-auto w-full py-4 text-base font-medium"
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
