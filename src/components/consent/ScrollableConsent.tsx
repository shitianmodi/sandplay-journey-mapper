
import React, { UIEvent } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConsentAgreement from "./ConsentAgreement";

interface ScrollableConsentProps {
  onScroll: (e: UIEvent<HTMLDivElement>) => void;
}

const ScrollableConsent: React.FC<ScrollableConsentProps> = ({ onScroll }) => {
  return (
    <ScrollArea 
      className="h-[400px] rounded-md border p-4 relative" 
      onScroll={onScroll}
    >
      <ConsentAgreement />
    </ScrollArea>
  );
};

export default ScrollableConsent;
