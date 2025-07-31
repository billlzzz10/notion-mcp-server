import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Note, ViewName, NoteCategory, Project, NoteDisplayFormat } from '../../../types';
import { NOTE_CATEGORIES, INITIAL_NOTES, NOTE_DISPLAY_OPTIONS } from '../../../constants'; 
import * as jsyaml from 'js-yaml'; 
import { getSafeHtml } from '../../../utils';
import Icon from '../Icon';


interface NotesViewProps {
  notes: Note[];
  currentProjectId: string;
  onOpenNoteEditor: (noteData?: Partial<Note> | Note) => void; 
  deleteNote: (noteId: string) => void;
  onNavigate: (view: ViewName) => void;
  addMultipleNotes: (notesToAdd: Note[]) => void; 
}

type SortOption = 'newest' | 'oldest' | 'title' | 'category' | 'characterCount';

const NotesView: React.FC<NotesViewProps> = ({
  notes,
  currentProjectId,
  onOpenNoteEditor, 
  deleteNote,
  addMultipleNotes, 
}) => {
  const [displayFormat, setDisplayFormat] = useState<NoteDisplayFormat>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryPill, setActiveCategoryPill] = useState<NoteCategory | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | 'all'>('all');
  const [sortFilter, setSortFilter] = useState<SortOption>('newest');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const projectNotes = useMemo(() => {
    return notes.filter(note => note.projectId === currentProjectId);
  }, [notes, currentProjectId]);

  const categoryCounts = useMemo(() => {
    const counts: { [key in NoteCategory | 'all']: number } = { 
        '':0, character: 0, event: 0, other: 0, place: 0, plot: 0, world: 0, all: projectNotes.length 
    };
    projectNotes.forEach(note => {
      counts[note.category || ''] = (counts[note.category || ''] || 0) + 1;
    });
    return counts;
  }, [projectNotes]);
  
  const filteredAndSortedNotes = useMemo(() => {
    let processedNotes = [...projectNotes];

    if (activeCategoryPill !== 'all') {
      processedNotes = processedNotes.filter(note => note.category === activeCategoryPill);
    }
    if (categoryFilter !== 'all') {
        processedNotes = processedNotes.filter(note => note.category === categoryFilter);
    }

    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      processedNotes = processedNotes.filter(note =>
        note.title.toLowerCase().includes(lowerSearchTerm) ||
        note.content.toLowerCase().includes(lowerSearchTerm) ||
        (note.subtitle && note.subtitle.toLowerCase().includes(lowerSearchTerm)) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    switch (sortFilter) {
      case 'oldest':
        processedNotes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title':
        processedNotes.sort((a, b) => a.title.localeCompare(b.title, 'th-TH'));
        break;
      case 'category':
        processedNotes.sort((a, b) => (a.category || '').localeCompare(b.category || '', 'th-TH') || a.title.localeCompare(b.title, 'th-TH'));
        break;
      case 'characterCount':
        processedNotes.sort((a, b) => b.characterCount - a.characterCount);
        break;
      case 'newest':
      default:
        processedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }
    return processedNotes;
  }, [projectNotes, activeCategoryPill, categoryFilter, searchTerm, sortFilter]);

  const handleAddNewNote = () => {
    onOpenNoteEditor({ category: '', projectId: currentProjectId }); 
  };

  const handleEditNote = (note: Note) => {
    onOpenNoteEditor(note); 
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      deleteNote(noteId);
    }
  };
  
  const getCategoryDetails = useCallback((categoryKey: NoteCategory | undefined) => {
    return NOTE_CATEGORIES.find(cat => cat.key === (categoryKey || '')) || NOTE_CATEGORIES.find(cat => cat.key === '');
  }, []);

  const handleExportNote = (note: Note) => {
    const { yamlFrontmatter, characterCount, ...restOfNote } = note; 
    const frontmatterData = {
      id: restOfNote.id,
      title: restOfNote.title,
      subtitle: restOfNote.subtitle || '',
      category: restOfNote.category,
      tags: restOfNote.tags,
      icon: restOfNote.icon || '',
      projectId: restOfNote.projectId,
      createdAt: restOfNote.createdAt,
      updatedAt: restOfNote.updatedAt,
    };

    try {
      const yamlString = jsyaml.dump(frontmatterData);
      const markdownContent = `---\n${yamlString}---\n\n${note.content}`;
      
      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${note.title.replace(/[^a-z0-9_]+/gi, '-') || 'note'}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error("Error creating YAML for export:", e);
      alert("เกิดข้อผิดพลาดในการสร้าง YAML สำหรับ Export");
    }
  };

  const handleImportNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const importedNotes: Note[] = [];
    let filesProcessed = 0;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parts = content.split(/---\s*$/m);
          let frontmatter: Partial<Note> = {};
          let markdownBody = content;

          if (parts.length >= 3 && parts[0].trim() === '') { 
            const yamlContent = parts[1].trim();
            markdownBody = parts.slice(2).join('---').trimStart(); 
            
            const parsedYaml = jsyaml.load(yamlContent) as any;
            if (parsedYaml && typeof parsedYaml === 'object') {
              frontmatter = {
                id: parsedYaml.id || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                title: parsedYaml.title || file.name.replace('.md', ''),
                subtitle: parsedYaml.subtitle || '',
                category: NOTE_CATEGORIES.find(c => c.key === parsedYaml.category) ? parsedYaml.category : '',
                tags: Array.isArray(parsedYaml.tags) ? parsedYaml.tags.map(String) : [],
                icon: parsedYaml.icon || '',
                createdAt: parsedYaml.createdAt && !isNaN(new Date(parsedYaml.createdAt).getTime()) ? new Date(parsedYaml.createdAt).toISOString() : new Date().toISOString(),
                updatedAt: parsedYaml.updatedAt && !isNaN(new Date(parsedYaml.updatedAt).getTime()) ? new Date(parsedYaml.updatedAt).toISOString() : new Date().toISOString(),
                projectId: currentProjectId, 
                yamlFrontmatter: yamlContent,
              };
            }
          } else { 
             frontmatter = {
                id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                title: file.name.replace('.md', ''),
                category: '',
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                projectId: currentProjectId,
            };
          }
          
          importedNotes.push({
            ...frontmatter,
            content: markdownBody,
            characterCount: markdownBody.length, 
          } as Note);

        } catch (error) {
          console.error("Error parsing imported file:", file.name, error);
          alert(`เกิดข้อผิดพลาดในการอ่านไฟล์: ${file.name}`);
        }
        filesProcessed++;
        if (filesProcessed === files.length) {
          if (importedNotes.length > 0) {
            addMultipleNotes(importedNotes);
            alert(`นำเข้าโน้ต ${importedNotes.length} รายการสำเร็จ!`);
          }
        }
      };
      reader.readAsText(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };


  const NoteCard: React.FC<{ note: Note; displayFormat: NoteDisplayFormat }> = ({ note, displayFormat }) => {
    const catDetails = getCategoryDetails(note.category);
    
    let cardClasses = "note-card group relative flex flex-col h-full bg-paper-bg text-paper-text rounded-xl shadow-card border border-border/50 hover:border-primary/30 hover:-translate-y-px transition-all duration-300 ease-in-out cursor-pointer hover:scale-103 ";
    let iconSize = "text-xl";
    let titleSize = "text-base font-heading";
    let contentLineClamp = "line-clamp-3";
    let showFullContent = false;
    let showSubtitle = true;
    let maxTags = 3;
    let metadataContainerClasses = "mt-auto pt-3";

    if (displayFormat === 'cover') {
        cardClasses += "p-4 h-64 justify-between items-center text-center";
        iconSize = "text-5xl mb-2";
        titleSize = "text-lg font-bold font-heading";
        contentLineClamp = "hidden";
        maxTags = 2;
        metadataContainerClasses = "";
    } else if (displayFormat === 'page') {
        cardClasses += "py-6 border-b border-border shadow-none rounded-none";
        iconSize = "text-2xl";
        titleSize = "text-xl font-bold font-heading";
        contentLineClamp = "line-clamp-none";
        showFullContent = true;
        maxTags = 10;
    } else { // Grid
        cardClasses += "p-4";
    }

    return (
        <div 
            className={cardClasses}
            data-category={note.category} 
            data-id={note.id}
            onClick={() => handleEditNote(note)}
        >
            <div className="flex-grow flex flex-col"> {/* Top part of the card */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center min-w-0">
                        <span className={`${iconSize} mr-3 flex-shrink-0`}>{note.icon || <Icon name={catDetails?.icon || 'file-question'} />}</span>
                        <div className="min-w-0">
                            <h3 className={`${titleSize} font-semibold truncate`} title={note.title}>{note.title}</h3>
                            {showSubtitle && note.subtitle && <p className="text-xs opacity-80 truncate" title={note.subtitle}>{note.subtitle}</p>}
                        </div>
                    </div>
                    <div className="flex space-x-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-1.5 w-7 h-7 flex items-center justify-center text-current opacity-70 hover:opacity-100 rounded-full hover:bg-black/10 transition-colors" onClick={(e) => { e.stopPropagation(); handleExportNote(note); }} aria-label={`Export ${note.title}`}>
                            <Icon name="file-export" className="w-3 h-3" />
                        </button>
                        <button className="p-1.5 w-7 h-7 flex items-center justify-center text-current opacity-70 hover:opacity-100 rounded-full hover:bg-black/10 transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} aria-label={`ลบ ${note.title}`}>
                            <Icon name="trash" className="w-3 h-3" />
                        </button>
                    </div>
                </div>
                <div className="flex-grow">
                    {!showFullContent && displayFormat !== 'cover' && (
                        <div className={`text-sm opacity-90 ${contentLineClamp} markdown-content`} dangerouslySetInnerHTML={{ __html: note.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' }}></div>
                    )}
                    {showFullContent && (
                        <div className={`markdown-content text-sm mt-4`} dangerouslySetInnerHTML={getSafeHtml(note.content)}></div>
                    )}
                </div>
            </div>

            <div className={metadataContainerClasses}> {/* Bottom part of the card */}
                {note.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                        {note.tags.slice(0, maxTags).map(tag => ( 
                            <span key={tag} className="inline-block bg-black/5 text-current opacity-80 px-2 py-0.5 rounded text-xs">#{tag}</span>
                        ))}
                        {note.tags.length > maxTags && <span className="text-xs opacity-60">...</span>}
                    </div>
                )}
                <div className="flex items-center justify-between text-xs opacity-70 border-t border-black/10 pt-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${catDetails?.colorClasses.pillBg ? catDetails.colorClasses.pillBg.replace('bg-','bg-black/').replace('dark:bg-','dark:bg-white/') : 'bg-black/5'}`}>
                        {catDetails?.label || 'ไม่มีหมวดหมู่'}
                    </span>
                    <span>{note.characterCount.toLocaleString()} chars</span>
                    <span>{new Date(note.updatedAt).toLocaleDateString('th-TH', { day:'numeric', month:'short' })}</span>
                </div>
            </div>
        </div>
    );
  };

  const NoteListItem: React.FC<{ note: Note }> = ({ note }) => {
    const catDetails = getCategoryDetails(note.category);
    return (
        <div className="p-4 hover:bg-surface cursor-pointer note-item flex items-center justify-between" data-id={note.id} onClick={() => handleEditNote(note)}>
            <div className="flex items-center space-x-3 flex-grow min-w-0">
                <span className="text-xl flex-shrink-0">{note.icon || <Icon name={catDetails?.icon || 'file-question'} />}</span>
                <div className="min-w-0">
                    <h4 className="font-medium truncate text-text-primary font-heading" title={note.title}>{note.title}</h4>
                    <p className="text-sm text-text-secondary truncate" title={note.subtitle}>
                        {note.subtitle || `${catDetails?.label || 'ไม่มีหมวดหมู่'} - ${note.characterCount.toLocaleString()} ตัวอักษร`}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                <span className={`px-2 py-1 rounded-full text-xs hidden sm:inline-block ${catDetails?.colorClasses.pillBg || NOTE_CATEGORIES.find(c=>c.key==='')?.colorClasses.pillBg}`}>
                  {catDetails?.label || 'ไม่มีหมวดหมู่'}
                </span>
                <span className="text-xs text-text-secondary hidden md:inline-block">{new Date(note.updatedAt).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'2-digit' })}</span>
                <button className="text-text-secondary hover:text-primary p-1.5 w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary/10 active:scale-90" data-id={note.id} onClick={(e) => { e.stopPropagation(); handleEditNote(note); }} aria-label={`แก้ไข ${note.title}`}>
                    <Icon name="edit" className="w-3.5 h-3.5" />
                </button>
                 <button className="text-text-secondary hover:text-success-dark p-1.5 w-7 h-7 flex items-center justify-center rounded-full hover:bg-success/10 active:scale-90" data-id={note.id} onClick={(e) => { e.stopPropagation(); handleExportNote(note); }} aria-label={`Export ${note.title}`}>
                    <Icon name="file-export" className="w-3.5 h-3.5" />
                </button>
                <button className="text-text-secondary hover:text-error p-1.5 w-7 h-7 flex items-center justify-center rounded-full hover:bg-error/10 active:scale-90" data-id={note.id} onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} aria-label={`ลบ ${note.title}`}>
                    <Icon name="trash" className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
  };

  const getLayoutClass = () => {
    switch(displayFormat) {
        case 'grid': return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
        case 'cover': return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
        case 'page': return 'space-y-8'; // Vertical stack for page view
        case 'list': return 'bg-surface rounded-xl shadow-card divide-y divide-border';
        default: return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  }
  
  const btnSecondary = `px-4 py-2 bg-surface text-text-primary rounded-md hover:bg-border active:scale-95 transition-all duration-200 border border-border flex items-center text-sm font-medium`;
  const btnPrimary = `px-4 py-2 rounded-md transition-all duration-200 flex items-center text-sm font-medium btn-textured-primary`;


  return (
    <div className="space-y-6 text-text-primary h-full flex flex-col">
      {/* Header and controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-0">
          <div>
              <h1 className="text-2xl font-bold font-heading flex items-center">
                  <Icon name="notes" className="w-6 h-6 text-primary mr-3" />
                  Notes
              </h1>
              <p className="text-text-secondary">จัดการแนวคิด ตัวละคร และเนื้อหาทั้งหมดของคุณ</p>
          </div>
          <div className="flex flex-wrap items-center space-x-2 mt-3 md:mt-0">
              <input type="file" ref={fileInputRef} onChange={handleImportNotes} accept=".md, .txt" multiple style={{ display: 'none' }} />
              <button onClick={() => fileInputRef.current?.click()} className={btnSecondary}>
                  <Icon name="file-import" className="w-4 h-4 mr-2" />Import
              </button>
              <div className="flex items-center bg-surface rounded-md p-0.5 border border-border">
                {NOTE_DISPLAY_OPTIONS.map(opt => (
                    <button 
                        key={opt.key}
                        onClick={() => setDisplayFormat(opt.key)} 
                        title={opt.label}
                        className={`p-2 w-9 h-9 flex items-center justify-center rounded-md text-sm transition-colors
                          ${displayFormat === opt.key ? 'bg-primary text-white' : 'text-text-secondary hover:bg-bg-subtle'}`}
                        >
                        <Icon name={opt.icon} className="w-5 h-5" />
                    </button>
                ))}
              </div>
              <button onClick={handleAddNewNote} className={btnPrimary}>
                  <Icon name="plus" className="w-4 h-4 mr-2" />โน้ตใหม่
              </button>
          </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-surface rounded-xl shadow-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                  <div className="relative">
                      <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-disabled" />
                      <input type="text" id="notes-search" placeholder="ค้นหาโน้ต..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-bg-subtle rounded-lg border border-border focus:ring-2 focus:ring-primary text-base"/>
                  </div>
              </div>
              <div className="md:w-48">
                  <select id="category-filter-dropdown" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as NoteCategory | 'all')} className="w-full py-2.5 px-3 bg-bg-subtle rounded-lg border border-border focus:ring-2 focus:ring-primary text-base">
                      <option value="all">ทุก Category</option>
                      {NOTE_CATEGORIES.filter(c => c.key !== '').map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
                  </select>
              </div>
              <div className="md:w-48">
                  <select id="sort-filter" value={sortFilter} onChange={(e) => setSortFilter(e.target.value as SortOption)} className="w-full py-2.5 px-3 bg-bg-subtle rounded-lg border border-border focus:ring-2 focus:ring-primary text-base">
                      <option value="newest">เรียง: ใหม่ล่าสุด</option>
                      <option value="oldest">เรียง: เก่าที่สุด</option>
                      <option value="title">เรียง: ชื่อ A-Z</option>
                      <option value="category">เรียง: Category</option>
                      <option value="characterCount">เรียง: จำนวนตัวอักษร</option>
                  </select>
              </div>
          </div>
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
              <button 
                  className={`category-pill px-3 py-1 rounded-full text-sm transition-colors ${activeCategoryPill === 'all' ? 'bg-primary text-white' : 'bg-bg-subtle text-text-secondary hover:bg-border active:scale-95'}`}
                  onClick={() => setActiveCategoryPill('all')}
              >
                  ทั้งหมด ({categoryCounts.all})
              </button>
              {NOTE_CATEGORIES.filter(cat => cat.key !== '' && categoryCounts[cat.key] > 0).map(cat => (
                  <button 
                      key={cat.key}
                      className={`category-pill px-3 py-1 rounded-full text-sm transition-colors ${activeCategoryPill === cat.key ? 'bg-primary text-white' : (cat.colorClasses.pillBg || '')} active:scale-95 flex items-center gap-1.5`}
                      onClick={() => setActiveCategoryPill(cat.key)}
                  >
                      <Icon name={cat.icon} className="w-3.5 h-3.5" /> {cat.label} ({categoryCounts[cat.key] || 0})
                  </button>
              ))}
          </div>
      </div>
      
      {/* Notes Display Area */}
      <div className="flex-grow overflow-y-auto pb-4">
        {filteredAndSortedNotes.length > 0 ? (
          <div id="notes-display-area" className={getLayoutClass()}>
             {displayFormat === 'list' 
                ? filteredAndSortedNotes.map(note => <NoteListItem key={note.id} note={note} />)
                : filteredAndSortedNotes.map(note => <NoteCard key={note.id} note={note} displayFormat={displayFormat} />)
             }
          </div>
        ) : (
          <div id="notes-empty" className="text-center py-12 bg-surface rounded-xl mt-6">
              <Icon name="folder-open" className="w-16 h-16 text-text-disabled mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2 font-heading">
                {searchTerm || categoryFilter !== 'all' || activeCategoryPill !== 'all' ? 'ไม่พบโน้ตที่ตรงกับเงื่อนไข' : 'ยังไม่มีโน้ต'}
              </h3>
              <p className="text-text-secondary mb-6">
                {searchTerm || categoryFilter !== 'all' || activeCategoryPill !== 'all' ? 'ลองปรับการค้นหาหรือตัวกรองของคุณ' : 'เริ่มสร้างโน้ตแรกของคุณเพื่อจดบันทึกแนวคิดและเนื้อหา'}
              </p>
              {!(searchTerm || categoryFilter !== 'all' || activeCategoryPill !== 'all') && (
                  <button onClick={handleAddNewNote} className={btnPrimary}>
                      <Icon name="plus" className="w-4 h-4 mr-2" />สร้างโน้ตแรก
                  </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesView;
