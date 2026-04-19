import React, { useState } from "react";
import { NavLink } from "../NavLink";
import { Menu, X } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/Operator", label: "Operators" },
  { to: "/Music", label: "Music" },
  { to: "/guide-story", label: "Guide & Story" },
  { to: "/database", label: "Database" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-12 px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-pulse-dot" />
          <span className="font-heading text-2xl font-bold tracking-[4px] text-foreground">
            A9<span className="text-primary">VN</span>
          </span>
        </NavLink>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="font-heading font-semibold text-[0.8rem] tracking-[2px] uppercase text-muted-foreground hover:text-primary transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-px after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              activeClassName="!text-primary after:scale-x-100"
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Status */}
        <div className="hidden md:flex items-center gap-2 font-mono-tech text-[0.7rem] text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
          SYSTEM ONLINE
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-xl">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="block px-6 py-3 font-heading text-sm tracking-[2px] uppercase text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              activeClassName="!text-primary bg-primary/10"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
