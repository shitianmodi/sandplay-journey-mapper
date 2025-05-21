
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import Layout from "../components/Layout";
import { ChevronDown, Check } from "lucide-react";

const ConsentPage = () => {
  const [accepted, setAccepted] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { setConsent } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Reset states when component mounts
  useEffect(() => {
    setCanAccept(false);
    setAccepted(false);
    setHasScrolled(false);
    
    // Add debugging logs
    console.log("Component mounted, states reset");
  }, []);

  // Function to check if user has scrolled to the bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setHasScrolled(true);
    
    // Check if user has scrolled to the bottom (with a small threshold)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 30;
    
    if (isAtBottom && !canAccept) {
      setCanAccept(true);
      console.log("User scrolled to bottom, canAccept set to true");
    }
  };

  // Reset acceptance if user hasn't scrolled to bottom
  useEffect(() => {
    if (!canAccept && accepted) {
      setAccepted(false);
      console.log("Reset acceptance because canAccept is false");
    }
  }, [canAccept, accepted]);

  const handleContinue = () => {
    if (!canAccept) {
      toast({
        variant: "destructive",
        title: "请先阅读全文",
        description: "请滑动至协议书底部后再进行同意操作",
      });
      return;
    }
    
    if (!accepted) {
      toast({
        variant: "destructive",
        title: "需要同意条款",
        description: "请勾选\"我已阅读并同意以上条款\"",
      });
      return;
    }
    
    // If everything is ok, proceed
    console.log("Continuing with consent given");
    setConsent(true);
    toast({
      title: "已确认同意",
      description: "您已同意咨询协议书",
    });
    navigate("/sand-tray");
  };

  // Handle checkbox change with explicit logging
  const handleCheckboxChange = (checked: boolean) => {
    console.log("Checkbox changed:", checked, "canAccept:", canAccept);
    if (canAccept) {
      setAccepted(checked);
    } else {
      // If user tries to check without scrolling
      if (checked) {
        toast({
          title: "请先阅读全文",
          description: "请滑动至协议书底部后再进行同意操作",
        });
        setAccepted(false);
      }
    }
  };

  return (
    <Layout title="咨询协议书" currentStep={1} showNavigation={true}>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md animate-fade-in">
        <ScrollArea 
          className="h-[400px] rounded-md border p-4 relative" 
          onScroll={handleScroll}
        >
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">咨询协议书</h3>
            
            <p>亲爱的同学\来访者：</p>
            
            <p>为了保护您的权益、提高咨询质量，请您仔细阅读下列事项，并签名确认您已知悉、认可和接纳本确认书所列的各项描述。未成年人或者其他由家属陪同的来访者，请家属代为签署；两人以上一同前来的成年来访者，请同时签署，谢谢您。</p>
            
            <h4 className="font-bold mt-4">关于心理沙盘</h4>
            <p>心理沙盘（又称沙盘游戏或沙盘疗法）是一种广泛应用于心理咨询、教育、临床治疗等领域的工具，通过沙具和沙盘的创造性摆放，帮助个体表达内心世界、促进自我觉察和疗愈。</p>
            
            <h4 className="font-bold mt-4">关于心理咨询师的职责和来访者的权利说明：</h4>
            <p>咨询过程中，咨询师的权利和义务：</p>
            <p className="font-semibold">A. 责任：</p>
            <ul className="list-decimal pl-6">
              <li>严格遵守国家有关法律法规；</li>
              <li>与求助者建立平等友好的咨询关系；</li>
              <li>严格遵守保密等咨询行业伦理原则；</li>
              <li>向求助者介绍自己的受训背景；</li>
              <li>承诺为签署本咨询确认书求助者提供心理咨询和顾问服务。</li>
            </ul>
            
            <p className="font-semibold">B. 权利：</p>
            <ul className="list-decimal pl-6">
              <li>有权了解与求助者心理问题有关的个人资料；</li>
              <li>有权选择合适的求助者；</li>
              <li>基于对求助者负责的态度或咨询师对自身咨询工作能力有限性的评估，有权提出转介或中止咨询。</li>
            </ul>
            
            <p className="font-semibold">C. 义务：</p>
            <ul className="list-decimal pl-6">
              <li>心理咨询师不得因求助者的性别、年龄、职业、民族、国籍、宗教信仰、价值观等任何方面的因素歧视求助者；</li>
              <li>心理咨询师在咨询关系建立之前，必须让求助者了解心理咨询工作的性质、特点、这一工作可能的局限以及求助者自身的权利和义务；</li>
              <li>心理咨询师在对求助者进行工作时，应与求助者对工作的重点进行讨论并达成一致意见，必要时（如采用某些咨询方法）应与求助者达成书面协议；</li>
              <li>心理咨询师与求助者之间不得产生和建立咨询以外的任何关系。尽量避免双重关系（尽量不与熟人、亲友、同事建立咨询关系），更不得利用求助者对咨询师的信任谋取私利，尤其不得对异性有非礼的言行；</li>
              <li>心理咨询师必须保证胜任能力，定期参加专业学习和接受督导。</li>
            </ul>
            
            <p className="mt-4">咨询过程中，来访者与咨询师有其相应的责任、权利和义务。</p>
            <p>求助者及其监护人的权利和义务：</p>
            
            <p className="font-semibold">A. 权利：</p>
            <ul className="list-decimal pl-6">
              <li>求助者可以根据个人意愿选择咨询师；</li>
              <li>对咨询进程不满意可要求更换咨询师或转介；</li>
              <li>有权利选择或更换合适的咨询师；</li>
              <li>对咨询方案、咨询收费、咨询时间有知情权和选择权；</li>
              <li>来访者有权利选择的心理咨询服务。</li>
            </ul>
            
            <p className="font-semibold">B. 义务：</p>
            <ul className="list-decimal pl-6">
              <li>遵守咨询机构的有关规定；</li>
              <li>遵守和执行商定好的咨询方案、咨询收费、咨询时间等方面的规则；</li>
              <li>求助者应尊重咨询师。</li>
            </ul>
            
            <h4 className="font-bold mt-4">关于保密</h4>
            <p>保密资料：即心理咨询工作中的有关信息，包括个案记录、测验资料、信件、录音、录像和其他资料，均属专业信息，应在严格保密的情况下进行保存。</p>
            <p>我了解：咨询中所涉及的我的个人隐私及相关资料，都将受到严密保护，不会在任何场合公开。</p>
            
            <h4 className="font-bold mt-4">保密例外</h4>
            <p>1）经过我的书面同意</p>
            <p>2）法律规定的例外情况</p>
            <p>在下列情况中，您的咨询师可以不经过您的同意或授权，使用或披露您的个人信息。</p>
            <ul className="list-disc pl-6">
              <li>虐待儿童、老人和残疾人员：如果您的咨询师有合理理由相信，有儿童、残疾人员、老人正被虐待、忽视或压迫，或者是处于一个受虐待、忽视或压迫后的状况中，她/他必须依照法律规定，立即向有关部门报告相关信息。</li>
              <li>司法或行政程序: 我们将在法律范围内最大限度保护您的信息。不过，如果是法庭命令我们披露信息，我们不得不提供。如果您被卷入或在考虑一场诉讼，您应该咨询您的律师以确定法院是否命令我们披露信息。另外，根据我国法律规定，咨询师的保密性不得与现行国家法律法规冲突。</li>
              <li>严重威胁到健康或安全：如果您的咨询师认为您将对自己或他人构成明显和实质性的严重伤害的危机/风险，她/他可以把您的相关机密资料透露给公共机关、潜在的受害者、其他专业人员或您的家人，以防范/阻止此类伤害的发生。</li>
              <li>如果您向您的咨询师传达您即将对一个或多个明确的受害人实施严重的身体伤害或死亡的行为，同时您的咨询师也确信您的意图和能力足以实施此类威胁，那么她/他必须依法作出行动，以防范/阻止此类伤害的发生。</li>
            </ul>
            
            <p>3）对个人隐私作严格技术处理后，不涉及具体人物的心理教学、研讨及撰写。</p>
            <p>在大多数情况下，您的咨询师需要与助理和其它咨询师就来访者的情况互相征询和督导。</p>
            <p>如果您不希望其他咨询师来协商关于您的案例，请让您的咨询师知道。</p>
            <p>我们所有的专业工作人员都必须遵守同样的保密规则。所有的咨询助理也都经过隐私保密规则的培训，并且承诺未经专业工作人员的批准不会透露任何消息给咨询以外的人。</p>
            <p>有时，我们会在研讨会、课堂或者科学著作中引用经过修饰的案例材料。这时，所有能识别出个人的信息和受保护的信息都将被删除。</p>
            
            <h4 className="font-bold mt-4">危机状况</h4>
            <p>来访者承诺整个咨询期间（包括咨询的间隔）不会实施自杀行为。若来访者违背承诺，不幸选择自杀，责任及行为后果将由来访者承担。</p>
            
            <p className="mt-6 font-bold">我已知晓并同意在进行心理沙盘治疗的过程中开放摄像头和录音。</p>
            
            {/* Add spacer to ensure content is scrollable to the very bottom */}
            <div className="h-20"></div>
          </div>
        </ScrollArea>
        
        {!canAccept && (
          <div className="flex justify-center mt-4 text-blue-600 animate-bounce">
            <div className="flex flex-col items-center">
              <span className="text-sm mb-1">请滑动阅读全文至底部</span>
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
        )}
        
        {canAccept && !accepted && (
          <div className="flex justify-center mt-4 text-green-600">
            <div className="flex items-center">
              <Check className="h-5 w-5 mr-1" />
              <span className="text-sm">已阅读完毕，请勾选下方同意按钮</span>
            </div>
          </div>
        )}
        
        <div className="mt-6 space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={accepted} 
              onCheckedChange={(checked) => handleCheckboxChange(!!checked)} 
              className={canAccept ? "" : "cursor-not-allowed"}
            />
            <label
              htmlFor="terms"
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${canAccept ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
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
              disabled={!accepted || !canAccept}
              className={(!accepted || !canAccept) ? "opacity-50" : ""}
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
