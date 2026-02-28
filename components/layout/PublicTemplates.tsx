"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDocs, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { CommunityUser, Template, Category } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Heart, Plus, Folder, ChevronRight, ChevronDown } from "lucide-react";

interface PublicTemplatesProps {
  selectedUser: CommunityUser | null;
}

export default function PublicTemplates({ selectedUser }: PublicTemplatesProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [likedTemplates, setLikedTemplates] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userCategories, setUserCategories] = useState<Category[]>([]);

  // Fetch user's categories for "Add to my templates" feature
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "categories"), where("userId", "==", user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        cats.push({
          id: doc.id,
          userId: data.userId,
          name: data.name,
          parentId: data.parentId,
          createdAt: data.createdAt?.toDate(),
        });
      });
      setUserCategories(cats);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch liked templates
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "templateLikes"), where("userId", "==", user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liked = new Set<string>();
      snapshot.forEach((doc) => {
        liked.add(doc.data().templateId);
      });
      setLikedTemplates(liked);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch categories and templates for selected user
  useEffect(() => {
    if (!selectedUser) {
      setCategories([]);
      setTemplates([]);
      setSelectedCategory(null);
      return;
    }

    // Fetch categories
    const catQ = query(collection(db, "categories"), where("userId", "==", selectedUser.id));
    const catUnsubscribe = onSnapshot(catQ, (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        cats.push({
          id: doc.id,
          userId: data.userId,
          name: data.name,
          parentId: data.parentId,
          createdAt: data.createdAt?.toDate(),
        });
      });
      setCategories(cats);
    });

    // Fetch public templates
    const tempQ = query(
      collection(db, "templates"),
      where("userId", "==", selectedUser.id),
      where("isPublic", "==", true)
    );
    const tempUnsubscribe = onSnapshot(tempQ, (snapshot) => {
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
      setTemplates(temps);
    });

    return () => {
      catUnsubscribe();
      tempUnsubscribe();
    };
  }, [selectedUser]);

  const rootCategories = categories.filter((c) => c.parentId === null);
  const getSubcategories = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  const getTemplatesForCategory = (categoryId: string) =>
    templates.filter((t) => t.categoryId === categoryId);

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleLike = async (template: Template) => {
    if (!user) return;

    const likeRef = collection(db, "templateLikes");
    const existingLike = await getDocs(
      query(likeRef, where("templateId", "==", template.id), where("userId", "==", user.id))
    );

    if (existingLike.empty) {
      // Add like
      await addDoc(likeRef, {
        templateId: template.id,
        userId: user.id,
        createdAt: serverTimestamp(),
      });

      // Increment template likes
      await updateDoc(doc(db, "templates", template.id), {
        likesCount: increment(1),
      });

      // Increment user total likes
      await updateDoc(doc(db, "users", template.userId), {
        totalLikes: increment(1),
      });
    } else {
      // Remove like
      existingLike.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Decrement template likes
      await updateDoc(doc(db, "templates", template.id), {
        likesCount: increment(-1),
      });

      // Decrement user total likes
      await updateDoc(doc(db, "users", template.userId), {
        totalLikes: increment(-1),
      });
    }
  };

  const handleCopy = async (content: string, templateId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddToMyTemplates = async (template: Template) => {
    if (!user || userCategories.length === 0) {
      alert("Спочатку створіть категорію у своїх шаблонах");
      return;
    }

    // Show category selection (simplified - using first category)
    const targetCategory = userCategories[0];

    await addDoc(collection(db, "templates"), {
      userId: user.id,
      categoryId: targetCategory.id,
      title: template.title,
      content: template.content,
      isPublic: false,
      likesCount: 0,
      createdAt: serverTimestamp(),
    });

    alert("Шаблон додано до ваших шаблонів!");
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const categoryTemplates = getTemplatesForCategory(category.id);
    const hasTemplates = categoryTemplates.length > 0;

    return (
      <div key={category.id}>
        <button
          onClick={() => setSelectedCategory(category.id)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-default ${
            selectedCategory === category.id
              ? "bg-primary/20 text-primary-light"
              : "hover:bg-surface-hover text-text-secondary hover:text-text"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {hasSubcategories ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
              className="p-0.5 hover:bg-surface-active rounded transition-default"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-5"></span>
          )}

          <Folder className={`w-4 h-4 ${selectedCategory === category.id ? "text-primary-light" : ""}`} />
          <span className="flex-1 text-sm truncate">{category.name}</span>
          {hasTemplates && (
            <span className="text-xs text-text-muted">{categoryTemplates.length}</span>
          )}
        </button>

        <AnimatePresence>
          {isExpanded && hasSubcategories && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {subcategories.map((sub) => renderCategory(sub, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="empty-state">
          <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-text mb-2">Оберіть профіль</h3>
          <p className="text-text-secondary text-sm">Виберіть користувача зі списку, щоб переглянути його публічні шаблони</p>
        </div>
      </div>
    );
  }

  const displayedTemplates = selectedCategory
    ? getTemplatesForCategory(selectedCategory)
    : templates;

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-medium">
            {selectedUser.avatar ? (
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              selectedUser.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text">{selectedUser.name}</h2>
            <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {selectedUser.totalLikes} лайків
              </span>
              <span className="flex items-center gap-1">
                <Plus className="w-4 h-4" />
                {selectedUser.templatesCount} шаблонів
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Categories sidebar */}
        <div className="w-56 bg-surface border-r border-border overflow-y-auto p-3">
          <h3 className="text-sm font-medium text-text-secondary mb-3 px-3">Категорії</h3>
          {categories.length === 0 ? (
            <div className="empty-state py-4">
              <p className="text-xs">Немає категорій</p>
            </div>
          ) : (
            <div className="space-y-1">
              {rootCategories.map((category) => renderCategory(category))}
            </div>
          )}
        </div>

        {/* Templates */}
        <div className="flex-1 overflow-y-auto p-6">
          {displayedTemplates.length === 0 ? (
            <div className="empty-state py-12">
              <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-text mb-2">Немає шаблонів</h3>
              <p className="text-text-secondary text-sm">
                {selectedCategory
                  ? "У цій категорії немає публічних шаблонів"
                  : "Цей користувач ще не опублікував жодного шаблону"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {displayedTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface border border-border rounded-xl p-5 card-hover"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-text truncate pr-4">{template.title}</h3>
                    <span className="flex items-center gap-1 text-sm text-text-secondary">
                      <Heart className="w-4 h-4" />
                      {template.likesCount}
                    </span>
                  </div>

                  <p className="text-text-secondary text-sm mb-4 line-clamp-3">{template.content}</p>

                  <div className="flex items-center gap-2 pt-3 border-t border-border">
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

                    {user && user.id !== template.userId && (
                      <>
                        <button
                          onClick={() => handleAddToMyTemplates(template)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-surface-hover hover:bg-surface-active text-text-secondary hover:text-text transition-default"
                        >
                          <Plus className="w-4 h-4" />
                          Додати до моїх
                        </button>

                        <button
                          onClick={() => handleLike(template)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-default ${
                            likedTemplates.has(template.id)
                              ? "bg-error/20 text-error"
                              : "bg-surface-hover hover:bg-surface-active text-text-secondary hover:text-text"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${likedTemplates.has(template.id) ? "fill-current" : ""}`}
                          />
                          {likedTemplates.has(template.id) ? "Лайкнуто" : "Лайк"}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
