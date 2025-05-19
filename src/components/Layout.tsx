
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  title: string;
  showNavigation?: boolean;
  currentStep?: number;
}

const Layout = ({ children, title, showNavigation = true, currentStep = 1 }: LayoutProps) => {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  
  const steps = [
    { name: "同意书", path: "/consent", id: 1 },
    { name: "沙具摆放", path: "/sand-tray", id: 2 },
    { name: "结果识别", path: "/results", id: 3 },
    { name: "生成报告", path: "/report", id: 4 }
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-therapy-neutral-light">
      <header className="bg-therapy-blue-dark text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">沙盘治疗分析系统</h1>
          {username && (
            <div className="flex items-center gap-4">
              <span>欢迎, {username}</span>
              <Button variant="outline" onClick={handleLogout} className="text-white border-white hover:bg-therapy-blue-light hover:text-therapy-blue-dark">
                登出
              </Button>
            </div>
          )}
        </div>
      </header>
      
      {showNavigation && (
        <div className="bg-white shadow-sm mb-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center py-2">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`flex-1 text-center py-2 ${
                    currentStep === step.id 
                      ? "border-b-2 border-therapy-blue-dark text-therapy-blue-dark font-medium" 
                      : currentStep > step.id 
                        ? "text-gray-500" 
                        : "text-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      currentStep >= step.id ? "bg-therapy-blue-dark text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {step.id}
                    </div>
                    {step.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <main className="flex-grow container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">{title}</h2>
        {children}
      </main>
      
      <footer className="bg-therapy-blue-dark text-white p-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>© 2025 沙盘治疗分析系统 - 演示版本</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
