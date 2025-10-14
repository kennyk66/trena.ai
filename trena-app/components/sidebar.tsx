'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavLink } from '@/components/navigation/nav-link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { signOut } from '@/lib/auth/auth-helpers';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/login');
      router.refresh();
    }
  };

  const navItems = [
    { href: '/home', icon: '🏠', label: 'Home' },
    { href: '/focus', icon: '🎯', label: 'Focus' },
    { href: '/gamification', icon: '🏆', label: 'Progress' },
    { href: '/research', icon: '🔍', label: 'Research' },
    { href: '/outreach', icon: '📧', label: 'Outreach' },
    { href: '/profile', icon: '👤', label: 'Profile' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4 justify-center">
        {collapsed && !mobile ? (
          <Logo variant="symbol" size="sm" />
        ) : (
          <Logo variant="full" size="sm" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed && !mobile}
          />
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t p-3">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full ${
            collapsed && !mobile ? 'justify-center px-2' : 'justify-start'
          }`}
        >
          <span className="text-lg">🚪</span>
          {(!collapsed || mobile) && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r bg-background transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 rounded-full border bg-background p-1.5 shadow-md hover:bg-accent"
        >
          <span className="text-xs">{collapsed ? '→' : '←'}</span>
        </button>
      </aside>

      {/* Mobile Hamburger & Sheet */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-50"
            >
              <span className="text-xl">☰</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
