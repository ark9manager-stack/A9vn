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
        <NavLink
          to="/"
          className="font-heading text-2xl font-bold text-primary tracking-wider"
        >
          A9VN
        </NavLink>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="text-white text-[15px] px-4 py-2 rounded-2xl hidden md:block hover:bg-[#242424] transition-colors duration-200 font-semibold"
              activeClassName="text-primary bg-secondary"
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-700 bg-black/60 backdrop-blur-xl">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setMobileOpen(false)}
              className="block px-6 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeClassName="text-primary bg-secondary"
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
