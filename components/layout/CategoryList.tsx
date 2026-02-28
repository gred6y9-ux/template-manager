"use client";

import React, { useState, useEffect } from "react";
import { Plus, Folder, ChevronRight, ChevronDown, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Category } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryListProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryList({ selectedCategory, onSelectCategory }: CategoryListProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParent, setNewCategoryParent] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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
      setCategories(cats.sort((a, b) => a.name.localeCompare(b.name)));
    });

    return () => unsubscribe();
  }, [user]);

  const rootCategories = categories.filter((c) => c.parentId === null);
  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId);

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateCategory = async () => {
    if (!user || !newCategoryName.trim()) return;

    await addDoc(collection(db, "categories"), {
      userId: user.id,
      name: newCategoryName.trim(),
      parentId: newCategoryParent,
      createdAt: serverTimestamp(),
    });

    setNewCategoryName("");
    setNewCategoryParent(null);
    setIsCreating(false);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цю категорію? Всі шаблони в ній також будуть видалені.")) return;

    // Delete subcategories first
    const subcategories = getSubcategories(categoryId);
    for (const sub of subcategories) {
      await deleteDoc(doc(db, "categories", sub.id));
    }

    await deleteDoc(doc(db, "categories", categoryId));
  };

  const handleEditCategory = async (categoryId: string) => {
    if (!editName.trim()) return;

    await updateDoc(doc(db, "categories", categoryId), {
      name: editName.trim(),
    });

    setEditingCategory(null);
    setEditName("");
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.id;
    const isEditing = editingCategory === category.id;

    return (
      <div key={category.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-default ${
            isSelected
              ? "bg-primary/20 text-primary-light"
              : "hover:bg-surface-hover text-text-secondary hover:text-text"
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onSelectCategory(category.id)}
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

          <Folder className={`w-4 h-4 ${isSelected ? "text-primary-light" : ""}`} />

          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleEditCategory(category.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEditCategory(category.id);
                if (e.key === "Escape") {
                  setEditingCategory(null);
                  setEditName("");
                }
              }}
              autoFocus
              className="flex-1 bg-background border border-primary rounded px-2 py-1 text-sm text-text"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm truncate">{category.name}</span>
          )}

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-default">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCreating(true);
                setNewCategoryParent(category.id);
              }}
              className="p-1 hover:bg-surface-active rounded text-text-muted hover:text-text"
              title="Додати підкатегорію"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingCategory(category.id);
                setEditName(category.name);
              }}
              className="p-1 hover:bg-surface-active rounded text-text-muted hover:text-text"
              title="Редагувати"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(category.id);
              }}
              className="p-1 hover:bg-error/10 rounded text-text-muted hover:text-error"
              title="Видалити"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Subcategories */}
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

  return (
    <div className="w-64 bg-surface border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text">Категорії</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsCreating(true);
              setNewCategoryParent(null);
            }}
            className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-default"
            title="Створити категорію"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Create category form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3"
            >
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={newCategoryParent ? "Назва підкатегорії" : "Назва категорії"}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateCategory();
                  if (e.key === "Escape") {
                    setIsCreating(false);
                    setNewCategoryName("");
                    setNewCategoryParent(null);
                  }
                }}
                autoFocus
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary transition-default"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleCreateCategory}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white text-sm py-1.5 rounded transition-default"
                >
                  Створити
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewCategoryName("");
                    setNewCategoryParent(null);
                  }}
                  className="flex-1 bg-surface-hover hover:bg-surface-active text-text text-sm py-1.5 rounded transition-default"
                >
                  Скасувати
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {rootCategories.length === 0 ? (
          <div className="empty-state py-8">
            <Folder className="empty-state-icon" />
            <p className="text-sm">Немає категорій</p>
            <p className="text-xs mt-1">Створіть першу категорію</p>
          </div>
        ) : (
          <div className="space-y-1">
            {rootCategories.map((category) => renderCategory(category))}
          </div>
        )}
      </div>
    </div>
  );
}
