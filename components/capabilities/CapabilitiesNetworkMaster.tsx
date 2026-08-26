'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useLanguage } from '@/context/LanguageContext'
import { CapabilitiesNavigation } from './CapabilitiesNavigation'
import { DiscoveryHomePage } from './DiscoveryHomePage'
import { PluginsPage } from './PluginsPage'
import { AgentsPage } from './AgentsPage'
import { PeoplePage } from './PeoplePage'
import { OrganizationsPage } from './OrganizationsPage'
import { DetailDrawers } from './DetailDrawers'
import type { CapabilityTab } from './types'

export function CapabilitiesNetworkMaster() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { isZh } = useLanguage()

  // Tab State: 'discovery' | 'plugins' | 'agents' | 'people' | 'organizations'
  const tabFromUrl = searchParams.get('tab') as CapabilityTab | null
  const [activeTab, setActiveTab] = useState<CapabilityTab>(
    tabFromUrl && ['discovery', 'plugins', 'agents', 'people', 'organizations'].includes(tabFromUrl)
      ? tabFromUrl
      : 'discovery'
  )

  // Installed State
  const [addedPluginIds, setAddedPluginIds] = useState<Set<string>>(() => {
    return new Set(['plugin-seo', 'plugin-analytics', 'plugin-image-opt'])
  })
  const [addedAgentIds, setAddedAgentIds] = useState<Set<string>>(() => {
    return new Set(['agent-marketing', 'agent-support'])
  })

  // Selected Detail Modal IDs
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [contactPersonId, setContactPersonId] = useState<string | null>(null)
  const [partnerOrgId, setPartnerOrgId] = useState<string | null>(null)

  // Sync tab with URL
  useEffect(() => {
    if (tabFromUrl && ['discovery', 'plugins', 'agents', 'people', 'organizations'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const handleTabChange = (tab: CapabilityTab) => {
    setActiveTab(tab)
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('tab', tab)
    router.replace(`${pathname}?${newParams.toString()}`)
  }

  const handleToggleAddPlugin = (pluginId: string) => {
    setAddedPluginIds((prev) => {
      const next = new Set(prev)
      if (next.has(pluginId)) {
        next.delete(pluginId)
      } else {
        next.add(pluginId)
      }
      return next
    })
  }

  const handleToggleAddAgent = (agentId: string) => {
    setAddedAgentIds((prev) => {
      const next = new Set(prev)
      if (next.has(agentId)) {
        next.delete(agentId)
      } else {
        next.add(agentId)
      }
      return next
    })
  }

  const handleCloseModals = () => {
    setSelectedPersonId(null)
    setSelectedOrgId(null)
    setContactPersonId(null)
    setPartnerOrgId(null)
  }

  return (
    <div className="w-full min-h-screen bg-[#FBFBFC] flex flex-col">
      {/* 1. TOP CAPABILITIES & NETWORK TABS NAVIGATION */}
      <CapabilitiesNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isZh={isZh}
      />

      {/* 2. SUB-PAGE BODY */}
      <main className="flex-1 w-full pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'discovery' && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <DiscoveryHomePage
                onNavigateTab={handleTabChange}
                onSelectPerson={(id) => setSelectedPersonId(id)}
                onSelectOrg={(id) => setSelectedOrgId(id)}
                onToggleAddPlugin={handleToggleAddPlugin}
                onToggleAddAgent={handleToggleAddAgent}
                addedPluginIds={addedPluginIds}
                addedAgentIds={addedAgentIds}
                isZh={isZh}
              />
            </motion.div>
          )}

          {activeTab === 'plugins' && (
            <motion.div
              key="plugins"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <PluginsPage
                addedPluginIds={addedPluginIds}
                onToggleAddPlugin={handleToggleAddPlugin}
                isZh={isZh}
              />
            </motion.div>
          )}

          {activeTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <AgentsPage
                addedAgentIds={addedAgentIds}
                onToggleAddAgent={handleToggleAddAgent}
                isZh={isZh}
              />
            </motion.div>
          )}

          {activeTab === 'people' && (
            <motion.div
              key="people"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <PeoplePage
                onSelectPerson={(id) => setSelectedPersonId(id)}
                onContactPerson={(id) => setContactPersonId(id)}
                isZh={isZh}
              />
            </motion.div>
          )}

          {activeTab === 'organizations' && (
            <motion.div
              key="organizations"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <OrganizationsPage
                onSelectOrg={(id) => setSelectedOrgId(id)}
                onPartnerOrg={(id) => setPartnerOrgId(id)}
                isZh={isZh}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. INTERACTIVE DETAIL & CONTACT DRAWERS */}
      <DetailDrawers
        selectedPersonId={selectedPersonId}
        selectedOrgId={selectedOrgId}
        contactPersonId={contactPersonId}
        partnerOrgId={partnerOrgId}
        onClose={handleCloseModals}
        isZh={isZh}
      />
    </div>
  )
}
