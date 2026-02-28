"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { User, Mail, FileText, Heart, Edit2, Check, X, Camera } from "lucide-react";

export default function ProfileView() {
  const { user, firebaseUser } = useAuth();
  const [templatesCount, setTemplatesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "templates"), where("userId", "==", user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTemplatesCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !editName.trim()) return;

    await updateDoc(doc(db, "users", user.id), {
      name: editName.trim(),
    });

    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-2xl p-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-medium">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-surface-hover hover:bg-surface-active border border-border rounded-full flex items-center justify-center text-text-muted hover:text-text transition-default">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-background border border-border rounded-lg px-3 py-2 text-xl font-semibold text-text"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-2 bg-success/20 text-success rounded-lg hover:bg-success/30 transition-default"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(user.name);
                      }}
                      className="p-2 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-default"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-text">{user.name}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-default"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-text-secondary flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-background border border-border rounded-xl p-4 text-center"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5 text-primary-light" />
              </div>
              <p className="text-2xl font-bold text-text">{templatesCount}</p>
              <p className="text-sm text-text-secondary">Шаблонів</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-background border border-border rounded-xl p-4 text-center"
            >
              <div className="w-10 h-10 bg-error/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-error" />
              </div>
              <p className="text-2xl font-bold text-text">{user.totalLikes}</p>
              <p className="text-sm text-text-secondary">Лайків</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-background border border-border rounded-xl p-4 text-center"
            >
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <User className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-text">
                {new Date(user.createdAt).toLocaleDateString("uk-UA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-text-secondary">Дата реєстрації</p>
            </motion.div>
          </div>

          {/* Info section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text">Інформація про профіль</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-text-secondary">ID користувача</span>
                <span className="text-text font-mono text-sm">{user.id}</span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-text-secondary">Спосіб входу</span>
                <span className="text-text text-sm">
                  {firebaseUser?.providerData[0]?.providerId === "password"
                    ? "Email/Пароль"
                    : "Google"}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <span className="text-text-secondary">Email підтверджено</span>
                <span className={`text-sm ${firebaseUser?.emailVerified ? "text-success" : "text-warning"}`}>
                  {firebaseUser?.emailVerified ? "Так" : "Ні"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 bg-surface border border-border rounded-2xl p-6"
        >
          <h3 className="font-semibold text-text mb-4">Поради</h3>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              Створюйте публічні шаблони, щоб поділитися ними з ком&apos;юніті
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              Використовуйте категорії для організації ваших шаблонів
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
              Лайкайте шаблони інших користувачів, щоб підтримати їх
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
