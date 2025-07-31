

import React, { useState, useMemo } from 'react';
import { Note } from '../types';
import Icon from '../Icon';

interface ContextSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onAddContext: (selectedNotes: Note[]) => void;
}

const ContextSelectorModal: React.FC<ContextSelectorModalProps> = ({
  isOpen,
  onClose,
  notes,
  onAddContext,
}) => {
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = useMemo(() => {
    return notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchTerm]);

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(noteId)) {
        newSelection.delete(noteId);
      } else {
        newSelection.add(noteId);
      }
      return newSelection;
    });
  };

  const handleConfirmAddContext = () => {
    const selectedNotes = notes.filter(note => selectedNoteIds.has(note.id));
    onAddContext(selectedNotes);
    onClose(); // Modal closes itself, but this confirms closure logic
  };
  
  const handleSelectAll = () => {
    const allFilteredNoteIds = new Set(filteredNotes.map(n => n.id));
    setSelectedNoteIds(allFilteredNoteIds);
  };

  const handleDeselectAll = () => {
    setSelectedNoteIds(new Set());
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div className="bg-bg rounded-xl shadow-xl w-full max-w-2xl flex flex-col animate-scale-in text-text-primary max-h-[80vh]">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold">เลือกโน้ตสำหรับเพิ่มบริบท</h3>
          <button onClick={onClose} className="p-2 w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface text-text-secondary" aria-label="Close">
            <Icon name="times" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            type="text"
            placeholder="ค้นหาโน้ต..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-surface focus:ring-primary focus:border-primary"
          />
           <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">พบ {filteredNotes.length} โน้ต</span>
            <div>
                <button onClick={handleSelectAll} className="text-primary hover:underline mr-2 active:brightness-90">เลือกทั้งหมด</button>
                <button onClick={handleDeselectAll} className="text-primary hover:underline active:brightness-90">ยกเลิกทั้งหมด</button>
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow p-4 border-t border-b border-border">
          {filteredNotes.length > 0 ? (
            <ul className="space-y-2">
              {filteredNotes.map(note => (
                <li key={note.id} className="p-3 rounded-md bg-surface hover:bg-border">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNoteIds.has(note.id)}
                      onChange={() => toggleNoteSelection(note.id)}
                      className="task-checkbox mr-3"
                    />
                    <div className="flex-grow">
                      <span className="font-medium block truncate">{note.title}</span>
                      <p className="text-xs text-text-secondary truncate">
                        {note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-text-secondary py-4">ไม่พบโน้ตที่ตรงกับการค้นหา หรือยังไม่มีโน้ตในโปรเจกต์นี้</p>
          )}
        </div>

        <div className="p-4 flex justify-end space-x-2 bg-bg-subtle rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface text-text-primary rounded-md hover:bg-border transition-colors border border-border"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirmAddContext}
            disabled={selectedNoteIds.size === 0}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            เพิ่ม {selectedNoteIds.size > 0 ? `(${selectedNoteIds.size})` : ''} บริบท
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContextSelectorModal;
