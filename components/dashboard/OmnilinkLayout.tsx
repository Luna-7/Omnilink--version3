'use client';
import React, { useState } from 'react';
import {
  LayoutDashboard, Box, BrainCircuit, Settings,
  Search, Plus, Folder, ChevronRight, Activity,
  Database, Zap, Eye, Globe, User, ShieldCheck
} from 'lucide-react';

export default function OmnilinkLiquidLayout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState('Overview');

  return (
    <div className="liquid-container flex h-screen w-full p-5 gap-5 font-sans antialiased selection:bg-indigo-100">

      {/* 装饰性背景液态团 (Blobs) */}
      <div className="liquid-bg-blob w-[500px] h-[500px] bg-white/40 -top-48 -left-48" />
      <div className="liquid-bg-blob w-[400px] h-[400px] bg-indigo-100/30 bottom-0 right-0" />

      {/* 1. 极简图标主导航 (Sidebar 1: Dark Slim) */}
      <nav className="z-10 w-[84px] h-full bg-[#151515] rounded-[35px] flex flex-col items-center py-10 gap-10 shadow-2xl">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center icon-glow cursor-pointer">
          <div className="w-6 h-6 bg-black rounded-lg" />
        </div>

        <div className="flex flex-col gap-8 flex-1">
          <MainIcon icon={<Activity size={24} />} active={activeSection === 'Overview'} onClick={() => setActiveSection('Overview')} />
          <MainIcon icon={<Database size={24} />} active={activeSection === 'Assets'} onClick={() => setActiveSection('Assets')} />
          <MainIcon icon={<BrainCircuit size={24} />} active={activeSection === 'AI'} onClick={() => setActiveSection('AI')} />
          <MainIcon icon={<Globe size={24} />} active={activeSection === 'Sales'} onClick={() => setActiveSection('Sales')} />
        </div>

        <MainIcon icon={<Settings size={24} />} active={activeSection === 'Settings'} onClick={() => setActiveSection('Settings')} />
      </nav>

      {/* 2. 玻璃态多级树形导航 (Sidebar 2: Wide Glass) */}
      <aside className="glass-panel z-10 w-[320px] h-full rounded-[35px] flex flex-col p-8 overflow-hidden">
        {/* 用户信息区 */}
        <div className="flex items-center gap-4 mb-10 group cursor-pointer">
          <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-slate-200 to-white p-[2px] shadow-sm">
            <div className="w-full h-full rounded-[16px] bg-white flex items-center justify-center overflow-hidden">
               <User className="text-slate-400" size={24} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">Omnilink Merchant</span>
            <span className="text-[11px] text-slate-500 font-medium">Pro Plan · v2.5</span>
          </div>
        </div>

        {/* 动态子菜单 */}
        <div className="flex-1 space-y-9 overflow-y-auto pr-2 custom-scroll">
          {activeSection === 'Overview' && (
            <NavSection title="Overview">
              <SubNavItem label="Dashboard" icon={<LayoutDashboard size={18}/>} active count={0} />
              <SubNavItem label="Live Monitor" icon={<Zap size={18}/>} />
            </NavSection>
          )}

          {activeSection === 'Assets' && (
            <NavSection title="Commerce Assets">
              <SubNavItem label="All Products" icon={<Box size={18}/>} />
              <SubNavItem label="Inventory" icon={<Activity size={18}/>} count={12} />
              <SubNavItem label="Media Library" icon={<Folder size={18}/>} />
            </NavSection>
          )}

          {activeSection === 'AI' && (
            <NavSection title="AI Semantic Hub">
              <SubNavItem label="Semantic Hub" icon={<BrainCircuit size={18}/>} />
              <SubNavItem label="Extraction Progress" icon={<Activity size={18}/>} count={5} />
              <SubNavItem label="Reasoning Rules" icon={<Zap size={18}/>} />
              <SubNavItem label="Agent Insights" icon={<Eye size={18}/>} />
            </NavSection>
          )}

          {activeSection === 'Sales' && (
            <NavSection title="Sales Channels">
              <SubNavItem label="Online Store" icon={<Globe size={18}/>} />
              <SubNavItem label="Agent API" icon={<ShieldCheck size={18}/>} />
            </NavSection>
          )}

          {activeSection === 'Settings' && (
            <NavSection title="System Settings">
              <SubNavItem label="Store Information" icon={<Settings size={18}/>} />
              <SubNavItem label="Account Center" icon={<User size={18}/>} />
            </NavSection>
          )}

          {/* 搜索栏 */}
          <div className="relative mt-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Search products..."
              className="w-full bg-white/40 border border-white/50 rounded-2xl py-3 pl-11 text-xs focus:outline-none focus:ring-2 ring-indigo-200/50 transition-all"
            />
          </div>
        </div>
      </aside>

      {/* 3. 主内容区 (Main Content) */}
      <main className="z-10 flex-1 h-full overflow-y-auto custom-scroll">
        <header className="flex justify-between items-center mb-10 px-4 pt-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 capitalize">{activeSection}</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your commerce intelligence layer.</p>
          </div>
          <button className="bg-[#151515] text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl">
            <Plus size={18} /> New Product
          </button>
        </header>

        {/* 真实页面内容渲染区（业务路由页面注入此处） */}
        {children}
      </main>
    </div>
  );
}

// 辅助组件：主图标
function MainIcon({ icon, active, onClick }: { icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`w-12 h-12 flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-300
      ${active ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'text-white/30 hover:text-white/60'}`}
    >
      {icon}
    </div>
  );
}

// 辅助组件：导航分组
function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 px-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// 辅助组件：二级项
function SubNavItem({ label, icon, active, count }: { label: string; icon: React.ReactNode; active?: boolean; count?: number }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 rounded-[20px] cursor-pointer group transition-all
      ${active ? 'nav-active-liquid text-slate-900' : 'text-slate-600 hover:bg-white/30'}`}>
      <div className="flex items-center gap-3">
        <span className={`${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
      {count !== undefined && <span className="text-[10px] bg-white/80 border border-white px-2 py-0.5 rounded-full font-bold shadow-sm">{count}</span>}
      {active && <ChevronRight size={14} className="text-slate-400" />}
    </div>
  );
}
