'use client';

// Sidebar Navigation Component

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Heart, Users, Bell, Settings, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  {
    name: 'Care Circle',
    href: '/care-circle',
    icon: Users,
  },
  {
    name: 'Alerts',
    href: '/alerts',
    icon: Bell,
    badge: 0, // This will be dynamically updated
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { caregiver, logout } = useAuth();

  const getInitials = () => {
    if (!caregiver) return 'U';
    return `${caregiver.first_name?.[0] || ''}${caregiver.last_name?.[0] || ''}`.toUpperCase();
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-surface border-r border-gray-200',
        className
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/care-circle" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-textPrimary">
              Elder Companion
            </h1>
            <p className="text-xs text-textSecondary">AI Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group">
          <Avatar>
            <AvatarImage
              src={caregiver?.profile_photo_url}
              alt={caregiver?.first_name || 'User'}
            />
            <AvatarFallback className="bg-primary text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-textPrimary truncate">
              {caregiver?.first_name} {caregiver?.last_name}
            </p>
            <p className="text-xs text-textSecondary truncate">{caregiver?.email}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="w-full mt-2 px-4 py-2 text-sm text-textSecondary hover:text-error hover:bg-error/10 rounded-lg transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
