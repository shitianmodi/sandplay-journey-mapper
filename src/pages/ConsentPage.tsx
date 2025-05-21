
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Layout from "../components/Layout";
import { useConsentState } from "../hooks/useConsentState";
import ScrollableConsent from "../components/consent/ScrollableConsent";
import ScrollIndicator from "../components/consent/ScrollIndicator";
import ConsentForm from "../components/consent/ConsentForm";

const ConsentPage = () => {
  const { setConsent } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    accepted,
    canAccept,
    handleScroll,
    handleCheckboxChange
  } = useConsentState();

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

  return (
    <Layout title="咨询协议书" currentStep={1} showNavigation={true}>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md animate-fade-in">
        <ScrollableConsent onScroll={handleScroll} />
        
        <ScrollIndicator canAccept={canAccept} accepted={accepted} />
        
        <ConsentForm 
          accepted={accepted}
          canAccept={canAccept}
          onAcceptChange={handleCheckboxChange}
          onContinue={handleContinue}
        />
      </div>
    </Layout>
  );
};

export default ConsentPage;
