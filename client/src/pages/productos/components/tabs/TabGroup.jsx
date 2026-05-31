import React from "react";
import { Tabs } from "@heroui/react";

/**
 * TabGroup component that implements the category pills container.
 * Wraps HeroUI's Tabs under the hood but removes default indicators
 * and styles to adapt perfectly to the project mockup.
 */
export default function TabGroup({ children, selectedKey, onSelectionChange, className, ariaLabel }) {
  return (
    <Tabs
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}
      aria-label={ariaLabel || "Categorías de productos"}
      className={className}
    >
      <Tabs.ListContainer className="p-0 bg-transparent shadow-none border-none">
        <Tabs.List className="flex items-center gap-3 p-0 bg-transparent">
          {children}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
