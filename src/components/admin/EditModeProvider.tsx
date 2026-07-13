"use client";

import { createContext, useContext, useEffect, useState } from "react";

type EditModeContextValue = {
  isAdmin: boolean;
  editMode: boolean;
  toggleEditMode: () => void;
};

const EditModeContext = createContext<EditModeContextValue>({
  isAdmin: false,
  editMode: false,
  toggleEditMode: () => {},
});

export function useEditMode() {
  return useContext(EditModeContext);
}

const STORAGE_KEY = "reversal_edit_mode";

export function EditModeProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (isAdmin && localStorage.getItem(STORAGE_KEY) === "1") setEditMode(true);
  }, [isAdmin]);

  function toggleEditMode() {
    setEditMode((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <EditModeContext.Provider value={{ isAdmin, editMode: isAdmin && editMode, toggleEditMode }}>
      {children}
      {isAdmin && <EditModeToggleButton editMode={editMode} onToggle={toggleEditMode} />}
    </EditModeContext.Provider>
  );
}

function EditModeToggleButton({ editMode, onToggle }: { editMode: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-5 left-5 z-50 rounded-full border px-4 py-2 text-xs font-bold shadow-lg transition-colors ${
        editMode
          ? "border-gold bg-gold text-surface"
          : "border-gold/50 bg-surface-card text-gold-light hover:bg-gold/10"
      }`}
    >
      {editMode ? "✏️ 編集モード: ON" : "✏️ 編集モード: OFF"}
    </button>
  );
}
