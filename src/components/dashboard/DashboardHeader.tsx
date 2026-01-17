'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  showCreateButton?: boolean;
}

export function DashboardHeader({ title, showCreateButton = true }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {showCreateButton && (
        <Link href="/posts/create">
          <Button>
            <Plus className="h-5 w-5 mr-2" />
            Create Post
          </Button>
        </Link>
      )}
    </div>
  );
}
