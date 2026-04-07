'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const AUTH_TOKEN_KEY = 'auth_token';

interface NavbarProps {
  onLogout?: () => void;
  hasSaveMessage?: boolean;
  onConfirmLogout?: () => void;
}

export function Navbar({ onLogout, hasSaveMessage, onConfirmLogout }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setIsLoggedIn(false);
        setChecked(true);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setIsLoggedIn(true);
          setUsername(result.data.username);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      } catch {
        setIsLoggedIn(false);
      }
      setChecked(true);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsLoggedIn(false);
    setUsername('');
    // 如果有待保存的消息，先触发外部回调显示 toast
    if (hasSaveMessage && onConfirmLogout) {
      onConfirmLogout();
    } else {
      window.location.href = '/login';
    }
  };

  // 未检查完登录状态时显示空白，避免闪烁
  if (!checked) {
    return (
      <nav className="h-14 bg-white/80 backdrop-blur-md border-b border-pink-100" />
    );
  }

  return (
    <nav className="h-14 bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 flex items-center justify-between">
      {/* 左侧：Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">💕</span>
        <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
          哄哄模拟器
        </span>
      </Link>

      {/* 右侧：用户状态 */}
      <div>
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-pink-500 rounded-full hover:bg-pink-50 transition-colors"
            >
              <span>🏆</span>
              <span>排行榜</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-pink-500 rounded-full hover:bg-pink-50 transition-colors"
            >
              <span>👤</span>
              <span>我的主页</span>
            </Link>
            <span className="text-sm text-gray-600">
              欢迎，<span className="font-medium text-pink-600">{username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm text-gray-500 hover:text-pink-500 border border-gray-200 rounded-full hover:border-pink-300 transition-colors"
            >
              退出
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-pink-500 rounded-full hover:bg-pink-50 transition-colors"
            >
              <span>🏆</span>
              <span>排行榜</span>
            </Link>
            <Link
              href="/login"
              className="px-4 py-1.5 text-sm text-pink-500 border border-pink-200 rounded-full hover:bg-pink-50 transition-colors"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full hover:shadow-md transition-shadow"
            >
              注册
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
