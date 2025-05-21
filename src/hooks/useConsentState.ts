
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useConsentState = () => {
  const [accepted, setAccepted] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { toast } = useToast();

  // Reset states when component mounts
  useEffect(() => {
    setCanAccept(false);
    setAccepted(false);
    setHasScrolled(false);
    
    console.log("Component mounted, states reset");
  }, []);

  // Reset acceptance if user hasn't scrolled to bottom
  useEffect(() => {
    if (!canAccept && accepted) {
      setAccepted(false);
      console.log("Reset acceptance because canAccept is false");
    }
  }, [canAccept, accepted]);

  // Handle scroll to detect if user reached bottom
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

  // Handle checkbox change
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

  return {
    accepted,
    canAccept,
    hasScrolled,
    handleScroll,
    handleCheckboxChange,
    setAccepted
  };
};
