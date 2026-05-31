import React from "react";
import { Tabs } from "@heroui/react";

/**
 * Tab component for individual category pills.
 * Wraps HeroUI's Tabs.Tab and styles it according to the mockup design:
 * - Selected: Solid primaryAction border, light orange background, primaryAction text.
 * - Default: Solid borderInput border, white background, secundaryText text.
 * - Disabled: Dashed border, transparent background, muted/faded text.
 */
export default function Tab({ id, title, icon, isDisabled, className, ...props }) {
  return (
    <Tabs.Tab
      id={id}
      isDisabled={isDisabled}
      className={`
        flex items-center gap-2 h-10 px-4 rounded-[10px] border font-medium text-sm transition-all duration-200 cursor-pointer select-none
        
        /* Default / Unselected State */
        border-[#E2E8F0] bg-transparent text-secundaryText hover:bg-gray-50 hover:text-primaryText
        
        /* Selected State */
        data-[selected=true]:border-primaryAction
        data-[selected=true]:bg-transparent
        data-[selected=true]:text-primaryAction
        
        /* Disabled State */
        data-[disabled=true]:border-dashed
        data-[disabled=true]:border-[#CBD5E1]
        data-[disabled=true]:bg-[#F8FAFC]
        data-[disabled=true]:text-secundaryText
        data-[disabled=true]:cursor-not-allowed
        data-[disabled=true]:pointer-events-none
        
        ${className || ""}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0 size-[18px] flex items-center justify-center">{icon}</span>}
      <span>{title}</span>
    </Tabs.Tab>
  );
}
