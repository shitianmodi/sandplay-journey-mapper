
import React from "react";
import { Check, ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
  canAccept: boolean;
  accepted: boolean;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ canAccept, accepted }) => {
  if (!canAccept) {
    return (
      <div className="flex justify-center mt-4 text-blue-600 animate-bounce">
        <div className="flex flex-col items-center">
          <span className="text-sm mb-1">请滑动阅读全文至底部</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    );
  }
  
  if (!accepted) {
    return (
      <div className="flex justify-center mt-4 text-green-600">
        <div className="flex items-center">
          <Check className="h-5 w-5 mr-1" />
          <span className="text-sm">已阅读完毕，请勾选下方同意按钮</span>
        </div>
      </div>
    );
  }
  
  return null;
};

export default ScrollIndicator;
