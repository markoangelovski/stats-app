"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow
} from "@/components/ui/popover";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLinkClick = () => {
    setPopoverOpen(false);
  };

  return (
    <header className="p-4 border-b">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold flex">
          <Image
            src="/images/logo.png"
            alt="Stats.app logo image"
            width={30}
            height={30}
            priority
            style={{ width: "auto", height: "auto" }}
          />
          <span className="ml-2">Stats.app</span>
        </Link>
        <div className="space-x-4 flex items-center">
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
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <PopoverArrow />
              <ul>
                <li>
                  <Link href="/stats" onClick={handleLinkClick}>
                    Stats
                  </Link>
                </li>
                <li>
                  <Link href="/settings" onClick={handleLinkClick}>
                    Settings
                  </Link>
                </li>
                <li>
                  <Link href="/api/auth/signout" onClick={handleLinkClick}>
                    Sign Out
                  </Link>
                </li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </nav>
    </header>
  );
}
