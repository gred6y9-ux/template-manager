"use client";

import React, { useState, useEffect } from "react";
import { Plus, Copy, Edit2, Trash2, Globe, Lock, Check, X } from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Template } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateListProps {
  categoryId: string | null;
}

export default function TemplateList({ categoryId }: TemplateListProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: "", content: "" });
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", content: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !categoryId) {
      setTemplates([]);
      return;
    }

    const q = query(
      collection(db, "templates"),
      where("userId", "==", user.id),
      where("categoryId", "==", categoryId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const temps: Template[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        temps.push({
          id: doc.id,
          userId: data.userId,
          categoryId: data.categoryId,
          title: data.title,
          content: data.content,
          isPublic: data.isPublic,
          likesCount: data.likesCount || 0,
          createdAt: data.createdAt?.toDate(),
        });
      });
      setTemplates(temps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    });

    return () => unsubscribe();
  }, [user, categoryId]);

  const handleCreateTemplate = async () => {
    if (!user || !categoryId || !newTemplate.title.trim() || !newTemplate.content.trim()) return;

    await addDoc(collection(db, "templates"), {
      userId: user.id,
      categoryId,
      title: newTemplate.title.trim(),
      content: newTemplate.content.trim(),
      isPublic: false,
      likesCount: 0,
      createdAt: serverTimestamp(),
    });

    setNewTemplate({ title: "", content: "" });
    setIsCreating(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей шаблон?")) return;

    await deleteDoc(doc(db, "templates", templateId));
  };

  const handleTogglePublic = async (template: Template) => {
    await updateDoc(doc(db, "templates", template.id), {
      isPublic: !template.isPublic,
    });
  };

  const handleCopy = async (content: string, templateId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template.id);
    setEditData({ title: template.title, content: template.content });
  };

  const handleSaveEdit = async () => {
    if (!editData.title.trim() || !editData.content.trim()) return;

    await updateDoc(doc(db, "templates", editingTemplate!), {
      title: editData.title.trim(),
      content: editData.content.trim(),
    });

    setEditingTemplate(null);
    setEditData({ title: "", content: "" });
  };

  if (!categoryId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="empty-state">
          <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-text mb-2">Оберіть категорію</h3>
          <p className="text-text-secondary text-sm">Виберіть категорію зі списку, щоб побачити шаблони</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text">Шаблони</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-default btn-glow"
        >
          <Plus className="w-4 h-4" />
          Створити шаблон
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Create template form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-surface border border-border rounded-xl p-5 mb-6"
            >
              <h3 className="font-medium text-text mb-4">Новий шаблон</h3>
              <input
                type="text"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                placeholder="Назва шаблону"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-default mb-3"
              />
              <textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                placeholder="Текст шаблону"
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-text placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-default mb-4 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateTemplate}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-default"
                >
                  Створити
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewTemplate({ title: "", content: "" });
                  }}
                  className="bg-surface-hover hover:bg-surface-active text-text px-4 py-2 rounded-lg transition-default"
                >
                  Скасувати
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates grid */}
        {templates.length === 0 ? (
          <div className="empty-state py-12">
            <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text mb-2">Немає шаблонів</h3>
            <p className="text-text-secondary text-sm mb-4">Створіть перший шаблон у цій категорії</p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-primary hover:text-primary-light transition-default"
            >
              Створити шаблон
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface border border-border rounded-xl p-5 card-hover group"
              >
                {editingTemplate === template.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text"
                    />
                    <textarea
                      value={editData.content}
                      onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                      rows={3}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded text-sm transition-default"
                      >
                        Зберегти
                      </button>
                      <button
                        onClick={() => {
                          setEditingTemplate(null);
                          setEditData({ title: "", content: "" });
                        }}
                        className="bg-surface-hover hover:bg-surface-active text-text px-3 py-1.5 rounded text-sm transition-default"
                      >
                        Скасувати
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-text truncate pr-4">{template.title}</h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-default">
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-1.5 hover:bg-surface-hover rounded-lg text-text-muted hover:text-text transition-default"
                          title="Редагувати"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1.5 hover:bg-error/10 rounded-lg text-text-muted hover:text-error transition-default"
                          title="Видалити"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-text-secondary text-sm mb-4 line-clamp-3">{template.content}</p>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <button
                        onClick={() => handleCopy(template.content, template.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-default ${
                          copiedId === template.id
                            ? "bg-success/20 text-success"
                            : "bg-surface-hover hover:bg-surface-active text-text-secondary hover:text-text"
                        }`}
                      >
                        {copiedId === template.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            Скопійовано
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Копіювати
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleTogglePublic(template)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-default ${
                          template.isPublic
                            ? "bg-primary/20 text-primary-light"
                            : "bg-surface-hover text-text-muted"
                        }`}
                        title={template.isPublic ? "Публічний" : "Приватний"}
                      >
                        {template.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {template.isPublic ? "Публічний" : "Приватний"}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
