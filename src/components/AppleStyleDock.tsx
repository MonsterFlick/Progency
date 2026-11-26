'use client';

import React from 'react';
import {
  Home,
  Sparkles,
  Mail,
} from 'lucide-react';

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/core/dock';

const DOCK_ITEMS = [
  {
    title: 'Home',
    icon: <Home className='h-full w-full' />,
    href: '#hero',
  },
  {
    title: 'Our Work',
    icon: <Sparkles className='h-full w-full' />,
    href: '#our-work',
  },
  {
    title: 'Contact',
    icon: <Mail className='h-full w-full' />,
    href: '#contact',
  },
];

export function AppleStyleDock({ className }: { className?: string }) {
  const handleNav = (href: string) => {
    if (href === '#' || href === '#hero' || href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      aria-label="Site Navigation Dock"
      className={className ?? 'fixed bottom-5 left-1/2 max-w-full -translate-x-1/2 z-[45] overflow-visible'}
    >
      <Dock className='items-center'>
        {DOCK_ITEMS.map((item) => (
          <DockItem
            key={item.title}
            className='rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white border border-white/10 shadow-sm transition-colors duration-200 flex items-center justify-center'
            onClick={() => handleNav(item.href)}
          >
            <DockLabel>{item.title}</DockLabel>
            <DockIcon>{item.icon}</DockIcon>
          </DockItem>
        ))}
      </Dock>
    </nav>
  );
}

export default AppleStyleDock;
