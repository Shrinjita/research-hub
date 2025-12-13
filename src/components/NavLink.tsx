import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useUI } from "@/contexts/UIContext";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { mode, setMode } = useUI();

  return (
    <Button
      variant="outline"
      onClick={() => setMode(mode === "research" ? "shopping" : "research")}
    >
      {mode === "research" ? "Shopping Mode" : "Research Mode"}
    </Button>
  );
}

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
