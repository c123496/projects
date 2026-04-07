'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';

const AUTH_TOKEN_KEY = 'auth_token';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 前端验证
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || '登录失败');
        setLoading(false);
        return;
      }

      // 登录成功，保存 token 到 localStorage
      if (result.data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, result.data.token);
      }

      // 跳转到首页
      window.location.href = '/';
    } catch {
      setError('网络错误，请重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
      <Navbar />
      <div className="flex items-center justify-center p-4 pt-12">
        <div className="w-full max-w-md">
          {/* 登录表单 */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-pink-50">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">💕</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">欢迎回来</h1>
              <p className="text-gray-500 text-sm">登录账号，继续你的哄人之旅</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3 rounded-xl border border-pink-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-500 text-sm">还没有账号？</span>
              <Link href="/register" className="text-pink-500 text-sm ml-1 hover:underline">
                立即注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
