
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: "登录成功",
          description: "欢迎使用沙盘治疗分析系统",
        });
        navigate("/consent");
      } else {
        toast({
          variant: "destructive",
          title: "登录失败",
          description: "用户名或密码错误",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "发生未知错误，请重试",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setUsername("demo");
    setPassword("password");
    
    setIsLoading(true);
    try {
      const success = await login("demo", "password");
      if (success) {
        toast({
          title: "演示模式",
          description: "已使用演示账号登录",
        });
        navigate("/consent");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "演示账号登录失败",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-therapy-blue-light to-therapy-blue-dark p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">沙盘治疗分析系统</h1>
          <p className="text-white/80">为治疗师提供专业的沙盘分析工具</p>
        </div>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>登录系统</CardTitle>
            <CardDescription>请使用您的账号登录或尝试演示账号</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  用户名
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  密码
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-therapy-blue-dark hover:bg-therapy-blue-dark/90"
                disabled={isLoading}
              >
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              使用演示账号
            </Button>
          </CardFooter>
        </Card>
        <div className="text-center mt-4 text-white/70 text-sm">
          <p>© 2025 沙盘治疗分析系统 版权所有</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
