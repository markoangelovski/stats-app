"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuGroup>
                {/* <DropdownMenuItem>
                  <User />
                  <span>Profile</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem>
                  <CreditCard />
                  <span>Billing</span>
                  <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                </DropdownMenuItem> */}
                <DropdownMenuItem className="cursor-pointer">
                  <Settings />
                  <span>Settings</span>
                  {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
                </DropdownMenuItem>
                {/* <DropdownMenuItem>
                  <Keyboard />
                  <span>Keyboard shortcuts</span>
                  <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                </DropdownMenuItem> */}
              </DropdownMenuGroup>
              {/* <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Users />
                  <span>Team</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <UserPlus />
                    <span>Invite users</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>
                        <Mail />
                        <span>Email</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare />
                        <span>Message</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <PlusCircle />
                        <span>More...</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem>
                  <Plus />
                  <span>New Team</span>
                  <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup> */}
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Github />
                <span>GitHub</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LifeBuoy />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Cloud />
                <span>API</span>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <LogOut />
                <span>Log out</span>
                {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
