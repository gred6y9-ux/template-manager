"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import CategoryList from "@/components/layout/CategoryList";
import TemplateList from "@/components/layout/TemplateList";
import CommunityList from "@/components/layout/CommunityList";
import PublicTemplates from "@/components/layout/PublicTemplates";
import ProfileView from "@/components/layout/ProfileView";
import { ViewType, CommunityUser } from "@/types";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const [currentView, setCurrentView] = useState<ViewType>("templates");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<CommunityUser | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // 🔥 Якщо нема user — просто нічого не рендеримо
  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (currentView) {
      case "profile":
        return <ProfileView />;

      case "templates":
        return (
          <>
            <CategoryList
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <TemplateList categoryId={selectedCategory} />
          </>
        );

      case "community":
        return (
          <>
            <CommunityList
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
            />
            <PublicTemplates selectedUser={selectedUser} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex overflow-hidden"
      >
        {renderContent()}
      </motion.main>
    </div>
  );
}