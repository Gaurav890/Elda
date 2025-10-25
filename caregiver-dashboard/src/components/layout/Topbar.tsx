'use client';

// Topbar Component

import { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { caregiver, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const getInitials = () => {
    if (!caregiver) return 'U';
    return `${caregiver.first_name?.[0] || ''}${caregiver.last_name?.[0] || ''}`.toUpperCase();
  };

  const unreadNotifications = 0; // This will be dynamically updated

  return (
    <header className="h-16 border-b border-gray-200 bg-surface flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary pointer-events-none" />
        <Input
          type="search"
          placeholder="Search patients, conversations, alerts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Notification bell */}
      <Link href="/alerts">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadNotifications}
            </Badge>
          )}
        </Button>
      </Link>

      {/* User avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage
                src={caregiver?.profile_photo_url}
                alt={caregiver?.first_name || 'User'}
              />
              <AvatarFallback className="bg-primary text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {caregiver?.first_name} {caregiver?.last_name}
              </p>
              <p className="text-xs leading-none text-textSecondary">
                {caregiver?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              Preferences
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="text-error focus:text-error cursor-pointer"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
