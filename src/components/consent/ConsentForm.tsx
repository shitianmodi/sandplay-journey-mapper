
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

interface ConsentFormProps {
  accepted: boolean;
  onAcceptChange: (checked: boolean) => void;
  onContinue: () => void;
}

const ConsentForm: React.FC<ConsentFormProps> = ({ 
  accepted, 
  onAcceptChange, 
  onContinue 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="terms" 
          checked={accepted} 
          onCheckedChange={(checked) => onAcceptChange(!!checked)} 
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed text-gray-900 cursor-pointer"
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
          onClick={onContinue}
          disabled={!accepted}
          className={!accepted ? "opacity-50" : ""}
        >
          继续
        </Button>
      </div>
    </div>
  );
};

export default ConsentForm;
