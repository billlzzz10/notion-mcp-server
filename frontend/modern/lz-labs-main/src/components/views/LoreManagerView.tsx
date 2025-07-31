

import React, { useState, useMemo, useRef } from 'react';
import { PlotPoint, WorldElement, Note, PlotPointType, PlotPointStatus, WorldElementCategory } from '../../../types';
import { PLOT_POINT_TYPES, PLOT_POINT_STATUS_OPTIONS, DEFAULT_PLOT_POINT_STATUS, WORLD_ELEMENT_CATEGORIES } from '../../../constants';
import { getSafeHtml } from '../../../utils';
import Icon from '../Icon';

// --- PROPS INTERFACE ---
interface LoreManagerViewProps {
  currentProjectId: string;
  notes: Note[];
  // Plot Point related props
  plotPoints: PlotPoint[];
  addPlotPoint: (newPlotPointData: Omit<PlotPoint, 'id' | 'createdAt' | 'updatedAt' | 'projectId' | 'order' | 'status'> & { status: PlotPointStatus }) => void;
  updatePlotPoint: (updatedPlotPoint: PlotPoint) => void;
  deletePlotPoint: (plotPointId: string) => void;
  // World Element related props
  worldElements: WorldElement[];
  addWorldElement: (newElementData: Omit<WorldElement, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>) => void;
  updateWorldElement: (updatedElement: WorldElement) => void;
  deleteWorldElement: (elementId: string) => void;
}

type ActiveTab = 'plot' | 'world';


// --- PLOT OUTLINE COMPONENT (Internal) ---
const PlotOutlineTab: React.FC<Omit<LoreManagerViewProps, 'worldElements' | 'addWorldElement' | 'updateWorldElement' | 'deleteWorldElement'>> = ({
  plotPoints, addPlotPoint, updatePlotPoint, deletePlotPoint
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPlotPoint, setEditingPlotPoint] = useState<PlotPoint | null>(null);
    const [formState, setFormState] = useState({ title: '', description: '', type: PLOT_POINT_TYPES[0]?.key || 'other', status: DEFAULT_PLOT_POINT_STATUS });
  
    const getTypeDetails = (typeKey: PlotPointType | string) => PLOT_POINT_TYPES.find(pt => pt.key === typeKey) || PLOT_POINT_TYPES.find(pt => pt.key === 'other');
    const getStatusDetails = (statusKey: PlotPointStatus) => PLOT_POINT_STATUS_OPTIONS.find(so => so.key === statusKey) || PLOT_POINT_STATUS_OPTIONS.find(so => so.key === DEFAULT_PLOT_POINT_STATUS)!;
  
    const openFormForNew = () => {
        setEditingPlotPoint(null);
        setFormState({ title: '', description: '', type: PLOT_POINT_TYPES[0]?.key || 'other', status: DEFAULT_PLOT_POINT_STATUS });
        setIsFormOpen(true);
    };

    const openFormForEdit = (pp: PlotPoint) => {
        setEditingPlotPoint(pp);
        setFormState({ title: pp.title, description: pp.description, type: pp.type, status: pp.status });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.title.trim()) return;
        const dataToSave = { title: formState.title.trim(), description: formState.description.trim(), type: formState.type, status: formState.status };
        if (editingPlotPoint) {
            updatePlotPoint({ ...editingPlotPoint, ...dataToSave });
        } else {
            addPlotPoint(dataToSave);
        }
        setIsFormOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="text-right">
                <button onClick={openFormForNew} className="px-4 py-2 bg-primary text-white rounded-md text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all"><Icon name="plus" className="w-4 h-4 mr-2" />Add Plot Point</button>
            </div>
            {plotPoints.length === 0 ? (
                <p className="text-center text-text-secondary py-8">No plot points yet. Add one to start building your story structure.</p>
            ) : (
                plotPoints.map(pp => {
                    const typeDetails = getTypeDetails(pp.type);
                    const statusDetails = getStatusDetails(pp.status);
                    return (
                        <div key={pp.id} className={`bg-bg rounded-lg p-4 border-l-4 ${statusDetails.colorClasses}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full mr-2 font-medium ${statusDetails.pillClasses} inline-flex items-center gap-1`}><Icon name={statusDetails.icon} className="w-3 h-3" />{statusDetails.label}</span>
                                    <h3 className="font-semibold text-lg inline">{pp.title}</h3>
                                    <p className="text-xs text-text-secondary ml-1 mt-1 flex items-center gap-1.5"><Icon name={typeDetails?.icon || 'ellipsis-h'} className="w-3 h-3" />{typeDetails?.label || pp.type}</p>
                                </div>
                                <div className="space-x-1">
                                    <button onClick={() => openFormForEdit(pp)} className="p-2 w-8 h-8 rounded-full hover:bg-surface text-primary"><Icon name="edit" /></button>
                                    <button onClick={() => deletePlotPoint(pp.id)} className="p-2 w-8 h-8 rounded-full hover:bg-surface text-error"><Icon name="trash" /></button>
                                </div>
                            </div>
                            {pp.description && <div className="mt-2 text-sm text-text-secondary markdown-content" dangerouslySetInnerHTML={getSafeHtml(pp.description)} />}
                        </div>
                    );
                })
            )}
            {isFormOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4 animate-fade-in">
                    <div className="bg-bg rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-in">
                        <div className="p-4 border-b border-border flex justify-between items-center"><h3 className="text-lg font-semibold">{editingPlotPoint ? 'Edit Plot Point' : 'New Plot Point'}</h3><button onClick={() => setIsFormOpen(false)}><Icon name="times" /></button></div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <input value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} placeholder="Title" required className="w-full p-2 border border-border rounded bg-surface" />
                            <select value={formState.type} onChange={e => setFormState({...formState, type: e.target.value})} className="w-full p-2 border border-border rounded bg-surface">
                                {PLOT_POINT_TYPES.map(pt => <option key={pt.key} value={pt.key}>{pt.label}</option>)}
                            </select>
                            <select value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as PlotPointStatus})} className="w-full p-2 border border-border rounded bg-surface">
                                {PLOT_POINT_STATUS_OPTIONS.map(so => <option key={so.key} value={so.key}>{so.label}</option>)}
                            </select>
                            <textarea value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} placeholder="Description (Markdown supported)" rows={5} className="w-full p-2 border border-border rounded bg-surface font-mono"></textarea>
                        </form>
                        <div className="p-4 border-t border-border flex justify-end gap-2"><button onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-surface rounded-md">Cancel</button><button type="submit" form="plot-point-form-in-modal" onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded-md">Save</button></div>
                    </div>
                 </div>
            )}
        </div>
    );
};

// --- WORLD ANVIL COMPONENT (Internal) ---
const WorldAnvilTab: React.FC<Omit<LoreManagerViewProps, 'plotPoints' | 'addPlotPoint' | 'updatePlotPoint' | 'deletePlotPoint'>> = ({
  worldElements, addWorldElement, updateWorldElement, deleteWorldElement
}) => {
    const getCategoryDetails = (categoryKey: WorldElementCategory | string) => WORLD_ELEMENT_CATEGORIES.find(cat => cat.key === categoryKey) || WORLD_ELEMENT_CATEGORIES.find(cat => cat.key === 'other');
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => addWorldElement({ name: 'New Element', category: 'other', description: '' })} className="p-4 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-text-secondary hover:bg-surface hover:border-primary transition-colors h-full">
                <Icon name="plus" className="text-2xl mb-2" /><span>Add World Element</span>
            </button>
            {worldElements.map(element => {
                const categoryDetails = getCategoryDetails(element.category);
                return (
                    <div key={element.id} className="bg-bg rounded-lg shadow-sm p-4 flex flex-col border border-border">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-semibold text-md">{element.name}</h3>
                                <p className="text-xs text-text-secondary flex items-center gap-1"><Icon name={categoryDetails?.icon || 'file-question'} className="w-3 h-3" />{categoryDetails?.label}</p>
                            </div>
                            <div className="space-x-1">
                                <button onClick={() => updateWorldElement(element)} className="p-2 w-8 h-8 rounded-full hover:bg-surface text-primary"><Icon name="edit" /></button>
                                <button onClick={() => deleteWorldElement(element.id)} className="p-2 w-8 h-8 rounded-full hover:bg-surface text-error"><Icon name="trash" /></button>
                            </div>
                        </div>
                        <div className="text-sm text-text-secondary line-clamp-4 flex-grow" dangerouslySetInnerHTML={getSafeHtml(element.description)} />
                        <p className="text-xs text-text-disabled mt-2">Updated: {new Date(element.updatedAt).toLocaleDateString()}</p>
                    </div>
                );
            })}
        </div>
    );
};


// --- MAIN LORE MANAGER COMPONENT ---
const LoreManagerView: React.FC<LoreManagerViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('plot');
  const { currentProjectId, plotPoints, worldElements } = props;

  const projectPlotPoints = useMemo(() => plotPoints.filter(p => p.projectId === currentProjectId).sort((a,b) => a.order - b.order), [plotPoints, currentProjectId]);
  const projectWorldElements = useMemo(() => worldElements.filter(w => w.projectId === currentProjectId).sort((a,b) => a.name.localeCompare(b.name)), [worldElements, currentProjectId]);
  
  const getTabClass = (tabName: ActiveTab) => 
    `px-4 py-2 font-medium text-sm rounded-md transition-colors flex items-center gap-2 ${
      activeTab === tabName ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'
    }`;
    
  return (
    <div className="space-y-6 text-text-primary h-full flex flex-col">
      <header>
        <h1 className="text-2xl font-bold flex items-center"><Icon name="lore-manager" className="w-6 h-6 text-primary mr-3" /> Lore Manager</h1>
        <p className="text-text-secondary">Manage your story's plot and world-building elements in one place.</p>
      </header>

      {/* Tabs */}
      <div className="border-b border-border flex items-center space-x-2">
        <button className={getTabClass('plot')} onClick={() => setActiveTab('plot')}>
          <Icon name="project-diagram" className="w-4 h-4" /> Plot Outline
        </button>
        <button className={getTabClass('world')} onClick={() => setActiveTab('world')}>
          <Icon name="globe" className="w-4 h-4" /> World Anvil
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto pb-4">
        {activeTab === 'plot' && (
          <PlotOutlineTab 
            {...props}
            plotPoints={projectPlotPoints}
          />
        )}
        {activeTab === 'world' && (
          <WorldAnvilTab
            {...props}
            worldElements={projectWorldElements}
          />
        )}
      </div>
    </div>
  );
};

export default LoreManagerView;
