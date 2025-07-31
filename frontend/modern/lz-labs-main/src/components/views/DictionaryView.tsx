

import React, { useState, useMemo, useRef } from 'react';
import type { DictionaryEntry } from '../../../types'; // Adjusted path
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import Icon from '../Icon';

interface DictionaryViewProps {
  currentProjectId: string;
  dictionaryEntries: DictionaryEntry[];
  addDictionaryEntry: (
    newEntryData: Omit<DictionaryEntry, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>,
    projectId: string
  ) => void;
  updateDictionaryEntry: (updatedEntry: DictionaryEntry) => void;
  deleteDictionaryEntry: (entryId: string) => void;
}

const DictionaryView: React.FC<DictionaryViewProps> = ({
  currentProjectId,
  dictionaryEntries,
  addDictionaryEntry,
  updateDictionaryEntry,
  deleteDictionaryEntry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [formTerm, setFormTerm] = useState('');
  const [formDefinition, setFormDefinition] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const ai = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY! })).current;

  const btnPrimary = "px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover active:scale-95 transition-all duration-200 flex items-center";
  const btnSecondary = "px-4 py-2 bg-surface text-text-primary rounded-md hover:bg-border active:scale-95 transition-all duration-200 border border-border flex items-center";
  const btnIcon = (colorClass: string) => `p-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface active:scale-90 transition-colors ${colorClass}`;


  const projectEntries = useMemo(
    () =>
      dictionaryEntries
        .filter(
          (entry) =>
            entry.projectId === currentProjectId &&
            (entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
             entry.definition.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => a.term.localeCompare(b.term, 'th-TH')),
    [dictionaryEntries, currentProjectId, searchTerm]
  );

  const handleStartAdd = () => {
    setIsAdding(true);
    setIsEditingId(null);
    setFormTerm('');
    setFormDefinition('');
  };

  const handleStartEdit = (entry: DictionaryEntry) => {
    setIsEditingId(entry.id);
    setIsAdding(false);
    setFormTerm(entry.term);
    setFormDefinition(entry.definition);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setIsEditingId(null);
    setFormTerm('');
    setFormDefinition('');
    setIsAiSuggesting(false); // Reset AI suggestion state
  };

  const handleAiSuggestDefinition = async () => {
    if (!formTerm.trim()) {
      alert("กรุณาใส่คำศัพท์ก่อนใช้ AI ช่วยแนะนำคำจำกัดความ");
      return;
    }
    setIsAiSuggesting(true);
    try {
      const prompt = `The user requires a definition for the term: "${formTerm.trim()}" for their fictional story's dictionary.
Instructions:
1.  Provide a concise and creative definition in **Thai**. This definition should be suitable for a fictional setting (e.g., fantasy, sci-fi).
2.  If the term is a common word, try to give it a specific or nuanced meaning relevant to a fictional world.
Example for a Thai term "วิญญูศิลา":
คำจำกัดความ: ศิลาอาคมที่กักเก็บความทรงจำและปัญญาของผู้ล่วงลับ ผู้ที่สัมผัสจะสามารถเข้าถึงความรู้โบราณได้ชั่วขณะ

Output only the resulting Thai definition. Do not include conversational filler or labels like "คำจำกัดความ:".`;
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 0 } }
      });
      setFormDefinition(response.text.trim());
    } catch (error) {
      console.error("Error suggesting definition:", error);
      alert("เกิดข้อผิดพลาดในการแนะนำคำจำกัดความจาก AI");
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTerm = formTerm.trim();
    if (!trimmedTerm) return; // Term is required, definition is not

    const trimmedDef = formDefinition.trim();
    
    if (isEditingId) {
      const entry = dictionaryEntries.find((e) => e.id === isEditingId);
      if (!entry) return;
      updateDictionaryEntry({
        ...entry,
        term: trimmedTerm,
        definition: trimmedDef,
        isVerified: trimmedDef !== '',
        updatedAt: new Date().toISOString(),
      });
    } else {
      addDictionaryEntry(
        {
          term: trimmedTerm,
          definition: trimmedDef,
          isVerified: trimmedDef !== '',
        },
        currentProjectId
      );
    }
    handleCancelForm();
  };

  return (
    <div className="space-y-6 text-text-primary h-full flex flex-col">
      <header className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold flex items-center">
          <Icon name="dictionary" className="text-primary mr-3" /> Dictionary
        </h1>
        <button
          className={btnPrimary}
          onClick={handleStartAdd}
        >
          <Icon name="plus" className="mr-2" />
          เพิ่มคำศัพท์
        </button>
      </header>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-disabled" />
            <input
                type="text"
                placeholder="ค้นหาคำศัพท์..."
                className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-border focus:ring-2 focus:ring-primary text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>
      
      {/* Add/Edit Form */}
      {(isAdding || isEditingId) && (
        <form
          onSubmit={handleSubmitForm}
          className="mb-4 bg-bg p-6 rounded-xl shadow-sm border border-border animate-fade-in"
        >
          <h3 className="text-lg font-semibold mb-4 text-text-primary">
            {isEditingId ? 'แก้ไขคำศัพท์' : 'เพิ่มคำศัพท์ใหม่'}
          </h3>
          <div className="mb-4">
            <label htmlFor="formTerm" className="block text-sm font-medium text-text-secondary mb-1">คำศัพท์</label>
            <input
              id="formTerm"
              type="text"
              className="w-full p-3 bg-surface rounded-lg border border-border focus:ring-2 focus:ring-primary text-base"
              value={formTerm}
              onChange={(e) => setFormTerm(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="formDefinition" className="block text-sm font-medium text-text-secondary">คำจำกัดความ</label>
                <button
                    type="button"
                    onClick={handleAiSuggestDefinition}
                    disabled={isAiSuggesting || !formTerm.trim()}
                    className={`${btnSecondary} text-xs`}
                    title="AI ช่วยแนะนำคำจำกัดความ"
                >
                    {isAiSuggesting ? (
                        <><Icon name="spinner" className="w-4 h-4 mr-1.5 animate-spin" />กำลังแนะนำ...</>
                    ) : (
                        <><Icon name="magic-wand-sparkles" className="w-4 h-4 mr-1.5" />AI แนะนำ</>
                    )}
                </button>
            </div>
            <textarea
              id="formDefinition"
              className="w-full p-3 bg-surface rounded-lg border border-border focus:ring-2 focus:ring-primary text-base"
              value={formDefinition}
              onChange={(e) => setFormDefinition(e.target.value)}
              rows={4}
              placeholder="เว้นว่างไว้เพื่อกำหนดในภายหลัง"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className={btnPrimary}
              disabled={isAiSuggesting || !formTerm.trim()}
            >
              <Icon name="save" className="w-4 h-4 mr-2" />
              บันทึก
            </button>
            <button
              type="button"
              onClick={handleCancelForm}
              className={btnSecondary}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="flex-grow overflow-y-auto pb-4">
        {projectEntries.length === 0 ? (
          <div className="text-center text-text-secondary py-12 bg-surface rounded-lg">
            <Icon name="comments" className="text-6xl text-text-disabled mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
                {searchTerm ? 'ไม่พบคำศัพท์ที่ตรงกับการค้นหา' : 'ยังไม่มีคำศัพท์ในพจนานุกรม'}
            </h3>
            <p className="text-text-secondary mb-6">
                {searchTerm ? 'ลองเปลี่ยนคำค้นหาของคุณ' : 'เริ่มสร้างคลังคำศัพท์สำหรับโปรเจกต์นี้'}
            </p>
             {!searchTerm && (
                <button
                    className={btnPrimary}
                    onClick={handleStartAdd}
                >
                    <Icon name="plus" className="w-4 h-4 mr-2" />
                    เพิ่มคำศัพท์แรก
                </button>
            )}
          </div>
        ) : (
          <ul className="space-y-4">
            {projectEntries.map((entry) => (
              <li
                key={entry.id}
                className={`bg-bg border rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-l-4 transition-colors ${entry.definition.trim() ? 'border-l-transparent' : 'border-l-warning'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg text-primary break-words">
                    {entry.term}
                  </div>
                  {entry.definition.trim() ? (
                    <div className="text-text-primary break-words whitespace-pre-line mt-1 text-sm">
                      {entry.definition}
                    </div>
                  ) : (
                    <div className="text-warning-dark italic mt-1 text-sm">
                      ยังไม่มีคำจำกัดความ...
                    </div>
                  )}
                  <div className="text-xs text-text-disabled mt-2">
                    สร้าง: {new Date(entry.createdAt).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'2-digit' })} | 
                    แก้ไข: {new Date(entry.updatedAt).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'2-digit' })}
                  </div>
                </div>
                <div className="flex gap-1 mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 items-start">
                  {deleteConfirmId === entry.id ? (
                      <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-error-bg rounded-md">
                        <span className="text-sm text-error">ยืนยันลบ?</span>
                        <button
                          className={`${btnIcon('text-success')} bg-success-bg`}
                          onClick={() => {
                            deleteDictionaryEntry(entry.id);
                            setDeleteConfirmId(null);
                          }}
                        >
                          <Icon name="check" />
                        </button>
                        <button
                          className={`${btnIcon('text-text-secondary')} bg-surface`}
                          onClick={() => setDeleteConfirmId(null)}
                        >
                          <Icon name="times" />
                        </button>
                      </div>
                    ) : (
                    <>
                        <button
                        className={btnIcon("text-primary")}
                        onClick={() => handleStartEdit(entry)}
                        aria-label={`แก้ไขคำว่า ${entry.term}`}
                        title="แก้ไข"
                        >
                        <Icon name="edit" />
                        </button>
                        <button
                        className={btnIcon("text-error")}
                        onClick={() =>
                            setDeleteConfirmId(entry.id)
                        }
                        aria-label={`ลบคำว่า ${entry.term}`}
                        title="ลบ"
                        >
                        <Icon name="trash" />
                        </button>
                    </>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DictionaryView;
