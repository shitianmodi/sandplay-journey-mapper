
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useConsentState = () => {
  const [accepted, setAccepted] = useState(false);
  const { toast } = useToast();

  // Reset states when component mounts
  useEffect(() => {
    setAccepted(false);
    console.log("Component mounted, states reset");
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    console.log("Checkbox changed:", checked);
    setAccepted(checked);
  };

  return {
    accepted,
    handleCheckboxChange,
    setAccepted
  };
};
