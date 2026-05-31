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
        flex items-center gap-2 h-10 px-4 rounded-xl border font-semibold text-sm transition-all duration-200 cursor-pointer select-none
        
        /* Default / Unselected State */
        border-borderInput bg-white text-secundaryText hover:bg-gray-50 hover:text-primaryText
        
        /* Selected State */
        data-[selected=true]:border-primaryAction
        data-[selected=true]:bg-[#EE791C]/10
        data-[selected=true]:text-primaryAction
        data-[selected=true]:font-bold
        
        /* Disabled State */
        data-[disabled=true]:border-dashed
        data-[disabled=true]:border-borderInput/60
        data-[disabled=true]:bg-transparent
        data-[disabled=true]:text-secundaryText/40
        data-[disabled=true]:cursor-not-allowed
        data-[disabled=true]:pointer-events-none
        data-[disabled=true]:opacity-60
        
        ${className || ""}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0 size-4 flex items-center justify-center">{icon}</span>}
      <span>{title}</span>
    </Tabs.Tab>
  );
}
