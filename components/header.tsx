"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // if (!mounted) {
  //   return null;
  // }

  return (
    <header className="p-4 border-b">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex">
          <Image
            src="/images/logo.png" // Path is relative to the "public" folder
            alt="Stats.app logo image"
            width={30}
            height={30}
            priority
            style={{ width: "auto", height: "auto" }} // Maintains aspect ratio if CSS changes width or height
          />
          <span className="ml-2">Stats.app</span>
        </Link>
        <div className="space-x-4 flex items-center">
          <Link href="/stats">Stats</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/api/auth/signout">Sign Out</Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>
    </header>
  );
}
