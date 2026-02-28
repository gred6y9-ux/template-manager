"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CommunityUser } from "@/types";
import { motion } from "framer-motion";
import { Heart, FileText, Users } from "lucide-react";

interface CommunityListProps {
  selectedUser: CommunityUser | null;
  onSelectUser: (user: CommunityUser | null) => void;
}

export default function CommunityList({ selectedUser, onSelectUser }: CommunityListProps) {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get users with public templates
    const q = query(collection(db, "templates"), where("isPublic", "==", true));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const userIds = new Set<string>();
      const userTemplateCounts = new Map<string, number>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        userIds.add(data.userId);
        userTemplateCounts.set(data.userId, (userTemplateCounts.get(data.userId) || 0) + 1);
      });

      // Fetch user details
      const usersData: CommunityUser[] = [];
      for (const userId of userIds) {
        const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", userId)));
        userDoc.forEach((doc) => {
          const data = doc.data();
          usersData.push({
            id: doc.id,
            name: data.name,
            avatar: data.avatar,
            totalLikes: data.totalLikes || 0,
            templatesCount: userTemplateCounts.get(doc.id) || 0,
          });
        });
      }

      setUsers(usersData.sort((a, b) => b.totalLikes - a.totalLikes));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="w-80 bg-surface border-r border-border flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="w-80 bg-surface border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-text">Ком&apos;юніті</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="empty-state">
            <Users className="empty-state-icon" />
            <p className="text-sm">Поки що немає публічних шаблонів</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-surface border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-text">Ком&apos;юніті</h2>
        <p className="text-sm text-text-secondary mt-1">Користувачі з публічними шаблонами</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {users.map((user, index) => (
            <motion.button
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectUser(user)}
              className={`w-full p-3 rounded-xl text-left transition-default ${
                selectedUser?.id === user.id
                  ? "bg-primary/20 border border-primary/30"
                  : "hover:bg-surface-hover border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-medium">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text truncate">{user.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {user.templatesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {user.totalLikes}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
