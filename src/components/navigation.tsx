import Link from "next/link"

import { Button } from "~/button"

const navigationLinks = [{ href: "/", label: "Home" }]

export default function Navigation() {
  return (
    <nav className="flex items-center space-x-6">
      {navigationLinks.map(link => (
        <Link
          className="text-sm font-medium transition-colors hover:text-primary"
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
      <Button variant="outline"></Button>
    </nav>
  )
}
