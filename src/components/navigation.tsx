import Link from "next/link";

import { Button } from "~/button";

const navigationLinks = [{ href: "/", label: "Home" }];

export default function Navigation() {
  return (
    <nav className="flex items-center space-x-6">
      {navigationLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
      <Button variant="outline"></Button>
    </nav>
  );
}
