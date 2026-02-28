"use client";

import React from "react";
import { User, FileText, Users, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ViewType } from "@/types";
import { motion } from "framer-motion";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { logout } = useAuth();

  const menuItems = [
    { id: "profile" as ViewType, icon: User, label: "Профіль" },
    { id: "templates" as ViewType, icon: FileText, label: "Мої шаблони" },
    { id: "community" as ViewType, icon: Users, label: "Ком'юніті" },
  ];

  return (
    <div className="w-16 bg-surface border-r border-border flex flex-col items-center py-6">
      <div className="mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-default group ${
                isActive
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-surface-hover border border-border rounded-lg text-sm text-text whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-default z-50">
                {item.label}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-surface-hover border-l border-b border-border rotate-45"></div>
              </div>
            </motion.button>
          );
        })}
      </nav>

      <motion.button
        onClick={logout}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-text-muted hover:text-error hover:bg-error/10 transition-default group"
        title="Вийти"
      >
        <LogOut className="w-5 h-5" />
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-surface-hover border border-border rounded-lg text-sm text-text whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-default z-50">
          Вийти
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-surface-hover border-l border-b border-border rotate-45"></div>
        </div>
      </motion.button>
    </div>
  );
}
