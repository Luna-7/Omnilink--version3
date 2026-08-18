'use client'

import React, { useState, useActionState } from 'react'
import { loginAction, signupAction, type AuthState } from '@/app/actions/auth'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function AsteriskIcon({ className = 'w-6 h-6', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <rect x="10.5" y="2" width="3" height="20" rx="1.5" />
      <rect x="2" y="10.5" width="20" height="3" rx="1.5" />
      <rect x="10.5" y="2" width="3" height="20" rx="1.5" transform="rotate(45 12 12)" />
      <rect x="10.5" y="2" width="3" height="20" rx="1.5" transform="rotate(-45 12 12)" />
    </svg>
  )
}

export function LoginForm() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [showPassword, setShowPassword] = useState(false)

  const [signinState, signinDispatch, signinPending] = useActionState<AuthState, FormData>(
    loginAction,
    null
  )
  const [signupState, signupDispatch, signupPending] = useActionState<AuthState, FormData>(
    signupAction,
    null
  )

  const error = mode === 'signin' ? signinState?.error : signupState?.error
  const message = signupState?.message ?? null
  const isPending = mode === 'signin' ? signinPending : signupPending

  return (
    <div className="w-full flex flex-col justify-center">
      {/* 顶部图标 */}
      <div className="mb-4">
        <AsteriskIcon className="w-7 h-7 text-[#E11D48]" color="#E11D48" />
      </div>

      {/* 标题与描述 */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          {mode === 'signup' ? '创建账户' : '欢迎登录'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 leading-relaxed">
          随时随地访问你的商品、店铺与数据，让一切业务井然有序。
        </p>
      </div>

      {/* 登录/注册 表单 */}
      <form action={mode === 'signin' ? signinDispatch : signupDispatch} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[#1f2937] mb-1.5">
            电子邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="merchant@example.com"
            autoComplete="email"
            className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-[#e5e7eb] focus:border-[#FB7185] focus:ring-4 focus:ring-[#FB7185]/15 outline-none text-sm text-[#111827] placeholder-[#9ca3af] bg-[#fafafa] focus:bg-white transition-all"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-[#1f2937] mb-1.5">
            登录密码
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full pl-4 pr-11 py-2.5 sm:py-3 rounded-xl border border-[#e5e7eb] focus:border-[#FB7185] focus:ring-4 focus:ring-[#FB7185]/15 outline-none text-sm text-[#111827] placeholder-[#9ca3af] bg-[#fafafa] focus:bg-white transition-all tracking-wider"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error ? (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl animate-in fade-in"
          >
            {error}
          </div>
        ) : null}

        {/* 成功消息 */}
        {message ? (
          <div
            role="status"
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3.5 py-2.5 rounded-xl animate-in fade-in leading-relaxed"
          >
            {message}
          </div>
        ) : null}

        {/* 主提交按钮 */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3 sm:py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#E11D48] to-[#FB7185] hover:from-[#BE123C] hover:to-[#E11D48] active:scale-[0.99] text-white text-sm font-semibold shadow-[0_12px_24px_-4px_rgba(225,29,72,0.35)] hover:shadow-[0_14px_28px_-3px_rgba(225,29,72,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>正在处理…</span>
            </>
          ) : (
            <span>{mode === 'signup' ? '立即注册账号' : '立即登录'}</span>
          )}
        </button>

        {/* 底部切换链接 */}
        <div className="pt-4 text-center text-xs text-[#6B7280]">
          {mode === 'signup' ? (
            <span>
              已有账户？{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#E11D48] hover:text-[#BE123C] font-semibold transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                立即登录
              </button>
            </span>
          ) : (
            <span>
              还没有账户？{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#E11D48] hover:text-[#BE123C] font-semibold transition-colors cursor-pointer underline-offset-2 hover:underline"
              >
                免费注册
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
