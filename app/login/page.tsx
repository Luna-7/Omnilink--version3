import { redirect } from 'next/navigation'
import { createClientServer } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'

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

/**
 * /login — 登录与注册页面
 *
 * 视觉风格完全对齐设计规范：
 * - 左侧：蓝紫霓虹氛围光斑画板 + 白色星芒徽标 + 核心愿景文案（全中文）
 * - 右侧：精致极简表单，包含邮箱、密码、密码可见性切换、一键注册/登录、三方社交按钮与模式切换
 */
export default async function LoginPage() {
  const supabase = await createClientServer()
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    user = null
  }

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen w-full bg-[#ECECF7] flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans">
      {/* 背景柔和光晕 */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#786ef5]/10 blur-[100px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* 主卡片容器 */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 md:p-7 shadow-[0_24px_70px_rgba(70,55,200,0.12),0_1px_2px_rgba(0,0,0,0.04)] border border-white/80">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch">
          
          {/* 左侧：蓝紫渐变视觉画板 */}
          <div className="md:col-span-5 relative rounded-[22px] sm:rounded-[26px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden min-h-[360px] md:min-h-[490px] shadow-sm select-none">
            {/* 渐变与光晕层 */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background:
                  'linear-gradient(150deg, #38BDF8 0%, #A855F7 45%, #E11D48 78%, #FB7185 100%)',
              }}
            />
            {/* 局部高光叠加层 */}
            <div
              className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.85) 0%, rgba(56, 189, 248, 0.5) 30%, transparent 60%), radial-gradient(circle at 85% 45%, rgba(251, 113, 133, 0.7) 0%, transparent 50%)',
              }}
            />

            {/* 左上角星芒图标 */}
            <div className="relative z-10">
              <AsteriskIcon className="w-8 h-8 text-white drop-shadow-md" color="#ffffff" />
            </div>

            {/* 底部中文愿景文案 */}
            <div className="relative z-10 text-white">
              <span className="text-xs text-white/85 font-medium tracking-wide block mb-2">
                轻松协同
              </span>
              <h2 className="text-xl sm:text-2xl md:text-[25px] font-bold text-white leading-snug tracking-tight drop-shadow-sm">
                获取你的专属工作枢纽，尽享清晰与高效
              </h2>
            </div>
          </div>

          {/* 右侧：登录/注册交互表单 */}
          <div className="md:col-span-7 flex flex-col justify-center px-1 sm:px-4 md:px-5 py-2">
            <LoginForm />
          </div>

        </div>
      </div>
    </div>
  )
}
