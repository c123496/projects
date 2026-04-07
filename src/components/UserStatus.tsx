'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserInfo {
  userId: number;
  username: string;
}

export function UserStatus() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();
      if (result.success) {
        setUser(result.data);
      }
    } catch {
      // 忽略错误
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.refresh();
    } catch {
      // 忽略错误
    }
  };

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          欢迎，<span className="font-medium text-pink-600">{user.username}</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-pink-500 transition-colors"
        >
          退出
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
      >
        登录
      </Link>
      <span className="text-gray-300">|</span>
      <Link
        href="/register"
        className="text-sm text-gray-600 hover:text-pink-500 transition-colors"
      >
        注册
      </Link>
    </div>
  );
}
