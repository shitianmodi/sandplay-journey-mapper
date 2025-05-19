
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import Layout from "../components/Layout";

const ConsentPage = () => {
  const [accepted, setAccepted] = useState(false);
  const { setConsent } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContinue = () => {
    if (!accepted) {
      toast({
        variant: "destructive",
        title: "需要同意",
        description: "请先阅读并同意知情同意书",
      });
      return;
    }
    
    setConsent(true);
    toast({
      title: "已确认同意",
      description: "您已同意知情同意书",
    });
    navigate("/sand-tray");
  };

  return (
    <Layout title="知情同意书" currentStep={1} showNavigation={true}>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md animate-fade-in">
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">沙盘治疗分析系统 - 知情同意书</h3>
            
            <p>尊敬的用户：</p>
            
            <p>感谢您选择使用我们的沙盘治疗分析系统。在开始使用前，请您仔细阅读并理解以下内容：</p>
            
            <h4 className="font-bold mt-4">1. 系统用途</h4>
            <p>本系统旨在为专业心理治疗师提供沙盘治疗辅助分析工具，用于记录、分析和生成治疗报告。</p>
            
            <h4 className="font-bold mt-4">2. 数据收集与使用</h4>
            <p>系统会收集您在沙盘摆放过程中的数据，包括但不限于选择的沙具类型、位置、摆放模式等信息。这些数据仅用于分析和生成报告，不会用于其他商业目的。</p>
            
            <h4 className="font-bold mt-4">3. 数据安全</h4>
            <p>我们重视您的隐私和数据安全。所有收集的数据都采用加密存储，并且只有授权人员可以访问。</p>
            
            <h4 className="font-bold mt-4">4. 系统局限性</h4>
            <p>请注意，本系统仅作为辅助工具，不能替代专业治疗师的判断。系统生成的分析和报告仅供参考，最终解释权应当由专业治疗师保留。</p>
            
            <h4 className="font-bold mt-4">5. 免责声明</h4>
            <p>本系统开发者不对因使用本系统而产生的任何直接或间接损失负责。使用者应当对自己的操作和决策负责。</p>
            
            <h4 className="font-bold mt-4">6. 知识产权</h4>
            <p>本系统及其所有组件的知识产权归开发者所有。未经授权，不得复制、修改或分发本系统的任何部分。</p>
            
            <h4 className="font-bold mt-4">7. 终止条款</h4>
            <p>如违反本同意书条款，开发者有权终止您使用本系统的权限。</p>
            
            <p className="mt-6">请您在同意以上条款后，继续使用本系统。</p>
          </div>
        </ScrollArea>
        
        <div className="mt-6 space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={accepted} onCheckedChange={(checked) => setAccepted(!!checked)} />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              我已阅读并同意以上条款
            </label>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
            >
              取消
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!accepted}
              className={!accepted ? "opacity-50" : ""}
            >
              继续
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConsentPage;
