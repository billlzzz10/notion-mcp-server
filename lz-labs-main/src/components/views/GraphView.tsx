import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Note, PlotPoint, WorldElement, GraphLink, SelectedGraphNode, ViewName, LinkRelationshipType } from '../../../types';
import { NOTE_CATEGORIES, PLOT_POINT_TYPES, WORLD_ELEMENT_CATEGORIES } from '../../../constants';
import { getSafeHtml } from '../../../utils';
import Icon from '../Icon';

const NODE_ID_PREFIX = {
  NOTE: 'note-',
  PLOT_POINT: 'plotpoint-',
  WORLD_ELEMENT: 'worldelement-',
};

interface AllItems {
    notes: Note[];
    plotPoints: PlotPoint[];
    worldElements: WorldElement[];
}

// Define a type for vis-network nodes and edges for clarity
interface VisNode {
  id: string; // Prefixed ID, e.g., "note-xyz", "plotpoint-abc"
  label: string;
  group: string; 
  title?: string; // Tooltip
  shape?: string;
  icon?: { face?: string; code?: string; size?: number; color?: string; };
  color?: string | { border?: string; background?: string; highlight?: { border?: string; background?: string; }; hover?: { border?: string; background?: string; }; };
  originalId: string; // Original ID without prefix
  itemType: 'note' | 'plotPoint' | 'worldElement';
  level?: number; // For hierarchical layout
}

interface VisEdge {
  from: string;
  to: string;
  label?: string;
  arrows?: string;
  color?: { color?: string; highlight?: string; hover?: string; opacity?: number; };
  font?: { align?: string; };
}

interface NodeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: SelectedGraphNode | null;
  allItems: AllItems;
  onEditNote: (note: Note) => void;
  onNavigate: (view: ViewName) => void;
}

const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ isOpen, onClose, nodeData, allItems, onEditNote, onNavigate }) => {
  if (!isOpen || !nodeData) return null;

  const getItemNameById = (id: string): string => {
    const item = [...allItems.notes, ...allItems.plotPoints, ...allItems.worldElements].find(i => i.id === id);
    if (!item) return 'Unknown Item';
    // Type guard to safely access title or name
    if ('title' in item) { 
      return item.title;
    }
    // item is WorldElement
    return item.name;
  };

  const getIcon = () => {
    if (nodeData.itemType === 'note') return (nodeData as Note).icon || <Icon name={NOTE_CATEGORIES.find(c => c.key === (nodeData as Note).category)?.icon || 'file-question'} />;
    if (nodeData.itemType === 'plotPoint') return <Icon name={PLOT_POINT_TYPES.find(p => p.key === (nodeData as PlotPoint).type)?.icon || 'sitemap'} />;
    if (nodeData.itemType === 'worldElement') return <Icon name={WORLD_ELEMENT_CATEGORIES.find(w => w.key === (nodeData as WorldElement).category)?.icon || 'globe'} />;
    return <Icon name="file-question" />;
  };

  const getTitle = () => {
    if (nodeData.itemType === 'note') return (nodeData as Note).title;
    if (nodeData.itemType === 'plotPoint') return (nodeData as PlotPoint).title;
    if (nodeData.itemType === 'worldElement') return (nodeData as WorldElement).name;
    return 'Unknown Item';
  };

  const getCategoryLabel = () => {
    if (nodeData.itemType === 'note') return NOTE_CATEGORIES.find(c => c.key === (nodeData as Note).category)?.label || 'Other Note';
    if (nodeData.itemType === 'plotPoint') return PLOT_POINT_TYPES.find(p => p.key === (nodeData as PlotPoint).type)?.label || 'Other Plot Point';
    if (nodeData.itemType === 'worldElement') return WORLD_ELEMENT_CATEGORIES.find(w => w.key === (nodeData as WorldElement).category)?.label || 'Other World Element';
    return 'Unknown Category';
  };
  
  const getDescription = () => {
    if (nodeData.itemType === 'note') return (nodeData as Note).content;
    if (nodeData.itemType === 'plotPoint') return (nodeData as PlotPoint).description;
    if (nodeData.itemType === 'worldElement') return (nodeData as WorldElement).description;
    return '';
  };

  const handleEdit = () => {
    if (nodeData.itemType === 'note') {
      onEditNote(nodeData as Note);
    } else if (nodeData.itemType === 'plotPoint') {
      onNavigate(ViewName.LoreManager); 
    } else if (nodeData.itemType === 'worldElement') {
      onNavigate(ViewName.LoreManager); 
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-modal-enter">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col text-text-primary">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="flex items-center min-w-0">
            <span className="text-primary text-xl mr-3 flex-shrink-0">{getIcon()}</span>
            <h3 className="text-lg font-semibold truncate" title={getTitle()}>{getTitle()}</h3>
          </div>
          <button onClick={onClose} className="p-2 w-8 h-8 flex items-center justify-center rounded-md hover:bg-bg-subtle text-text-secondary transition-colors" aria-label="Close node detail modal">
            <Icon name="times" className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-3 overflow-y-auto">
          <p className="text-sm text-text-secondary"><strong>ประเภท:</strong> {nodeData.itemType === 'note' ? 'Note' : nodeData.itemType === 'plotPoint' ? 'Plot Point' : 'World Element'}</p>
          <p className="text-sm text-text-secondary"><strong>หมวดหมู่/ชนิด:</strong> {getCategoryLabel()}</p>
          
          <h4 className="font-medium mt-2">คำอธิบาย/เนื้อหา:</h4>
          <div className="text-sm markdown-content max-h-40 overflow-y-auto p-2 bg-bg-subtle rounded" dangerouslySetInnerHTML={getSafeHtml(getDescription().substring(0, 500) + (getDescription().length > 500 ? '...' : ''))}></div>

          {nodeData.itemType === 'note' && (nodeData as Note).links && (nodeData as Note).links!.length > 0 && (
            <div>
              <h4 className="font-medium mt-2">Links:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {(nodeData as Note).links!.map((link, index) => (
                  <li key={index} className="text-text-secondary">
                    <span className="font-semibold text-text-primary">{link.type}:</span> {getItemNameById(link.targetId)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border flex justify-end space-x-2 bg-bg-subtle rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 bg-surface text-text-primary rounded-md hover:bg-border transition-colors">Close</button>
          <button 
            onClick={handleEdit} 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors"
            title={nodeData.itemType === 'note' ? "Edit Note" : "Navigate to item's view for editing"}
          >
            {nodeData.itemType === 'note' ? 'Edit Full Note' : 'Edit Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceNode: VisNode | null;
  targetNode: VisNode | null;
  onSaveLink: (sourceNoteId: string, targetItemId: string, relationshipType: LinkRelationshipType | string) => void;
}

const CreateLinkModal: React.FC<CreateLinkModalProps> = ({ isOpen, onClose, sourceNode, targetNode, onSaveLink }) => {
  const [relationshipType, setRelationshipType] = useState<LinkRelationshipType | string>('เกี่ยวข้องกับ');

  if (!isOpen || !sourceNode || !targetNode) return null;

  const allRelationshipTypes: (LinkRelationshipType | string)[] = [
    'เกี่ยวข้องกับ', 'เป็นส่วนหนึ่งของ', 'สาเหตุของ', 'ผลลัพธ์ของ', 
    'พันธมิตรกับ', 'ศัตรูกับ', 'อาศัยอยู่ที่', 'ครอบครอง', 'ถูกสร้างโดย', 'อื่นๆ'
  ];

  const handleSave = () => {
    if (sourceNode.itemType === 'note') {
        onSaveLink(sourceNode.originalId, targetNode.originalId, relationshipType); // Pass original IDs
    } else {
        alert("Link creation is currently only supported from Notes.");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[110] p-4 animate-modal-enter">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-md flex flex-col text-text-primary">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold">สร้างความสัมพันธ์ (Link)</h3>
          <button onClick={onClose} className="p-2 w-8 h-8 flex items-center justify-center rounded-md hover:bg-bg-subtle text-text-secondary transition-colors" aria-label="Close create link modal">
            <Icon name="times" className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm">
            <strong>จาก:</strong> <span className="text-primary">{sourceNode.label}</span> ({sourceNode.itemType})
          </p>
          <p className="text-sm">
            <strong>ไปยัง:</strong> <span className="text-primary">{targetNode.label}</span> ({targetNode.itemType})
          </p>
          <div>
            <label htmlFor="relationshipType" className="block text-sm font-medium mb-1">ประเภทความสัมพันธ์:</label>
            <select
              id="relationshipType"
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as LinkRelationshipType | string)}
              className="w-full p-2.5 bg-bg border border-border rounded-lg focus:ring-2 focus:ring-primary text-base"
            >
              {allRelationshipTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-4 border-t border-border flex justify-end space-x-2 bg-bg-subtle rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 bg-surface text-text-primary rounded-md hover:bg-border transition-colors">ยกเลิก</button>
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors">บันทึก Link</button>
        </div>
      </div>
    </div>
  );
};


interface GraphViewProps {
  notes: Note[];
  plotPoints: PlotPoint[];
  worldElements: WorldElement[];
  allItems: AllItems;
  onOpenNoteEditor: (noteData: Note) => void;
  onNavigate: (view: ViewName) => void;
  onAddLink: (sourceNoteId: string, targetItemId: string, relationshipType: LinkRelationshipType | string) => void;
}

type LayoutType = 'force' | 'hierarchical';

const GraphView: React.FC<GraphViewProps> = ({ notes, plotPoints, worldElements, allItems, onOpenNoteEditor, onNavigate, onAddLink }) => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<any>(null); 
  const isDarkMode = useMemo(() => document.documentElement.classList.contains('dark'), []);

  const [selectedNodeForModal, setSelectedNodeForModal] = useState<SelectedGraphNode | null>(null);
  const [isNodeDetailModalOpen, setIsNodeDetailModalOpen] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('force');
  const [isCreateLinkModalOpen, setIsCreateLinkModalOpen] = useState(false);
  const [linkCreationData, setLinkCreationData] = useState<{ source: VisNode; target: VisNode } | null>(null);


  const allVisNodes = useMemo(() => {
    const visNodes: VisNode[] = [];
    notes.forEach(note => {
      const categoryDetails = NOTE_CATEGORIES.find(cat => cat.key === note.category) || NOTE_CATEGORIES.find(cat => cat.key === '');
      visNodes.push({
        id: `${NODE_ID_PREFIX.NOTE}${note.id}`, 
        originalId: note.id,
        itemType: 'note',
        label: note.title.substring(0, 20) + (note.title.length > 20 ? '...' : ''),
        group: `note-${note.category || 'other'}`,
        title: `<b>${note.title}</b><br><i>Note: ${categoryDetails?.label || 'N/A'}</i>`,
        shape: categoryDetails?.graphStyle?.shape,
        color: categoryDetails?.graphStyle?.color ? 
               { background: categoryDetails.graphStyle.color, border: categoryDetails.graphStyle.borderColor || categoryDetails.graphStyle.color } : 
               undefined,
      });
    });

    plotPoints.forEach(pp => {
      const typeDetails = PLOT_POINT_TYPES.find(pt => pt.key === pp.type) || PLOT_POINT_TYPES.find(pt => pt.key === 'other');
      visNodes.push({
        id: `${NODE_ID_PREFIX.PLOT_POINT}${pp.id}`,
        originalId: pp.id,
        itemType: 'plotPoint',
        label: pp.title.substring(0, 20) + (pp.title.length > 20 ? '...' : ''),
        group: `plotpoint-${pp.type || 'other'}`,
        title: `<b>${pp.title}</b><br><i>Plot Point: ${typeDetails?.label || 'N/A'}</i>`,
        shape: typeDetails?.graphStyle?.shape,
        color: typeDetails?.graphStyle?.color ?
               { background: typeDetails.graphStyle.color, border: typeDetails.graphStyle.borderColor || typeDetails.graphStyle.color } :
               undefined,
        level: pp.order, // Use order for hierarchical layout
      });
    });

    worldElements.forEach(we => {
      const categoryDetails = WORLD_ELEMENT_CATEGORIES.find(cat => cat.key === we.category) || WORLD_ELEMENT_CATEGORIES.find(cat => cat.key === 'other');
      visNodes.push({
        id: `${NODE_ID_PREFIX.WORLD_ELEMENT}${we.id}`,
        originalId: we.id,
        itemType: 'worldElement',
        label: we.name.substring(0, 20) + (we.name.length > 20 ? '...' : ''),
        group: `worldelement-${we.category || 'other'}`,
        title: `<b>${we.name}</b><br><i>World Element: ${categoryDetails?.label || 'N/A'}</i>`,
        shape: categoryDetails?.graphStyle?.shape,
        color: categoryDetails?.graphStyle?.color ?
               { background: categoryDetails.graphStyle.color, border: categoryDetails.graphStyle.borderColor || categoryDetails.graphStyle.color } :
               undefined,
      });
    });
    return visNodes;
  }, [notes, plotPoints, worldElements]);


  const handleNodeClick = useCallback((params: any) => {
    if (params.nodes.length > 0) {
      const clickedVisNodeId = params.nodes[0];
      const visNode = allVisNodes.find(n => n.id === clickedVisNodeId);

      if (visNode) {
        let fullNodeData: SelectedGraphNode | null = null;
        if (visNode.itemType === 'note') {
          const foundNote = notes.find(n => n.id === visNode.originalId);
          if (foundNote) fullNodeData = { ...foundNote, itemType: 'note' };
        } else if (visNode.itemType === 'plotPoint') {
          const foundPP = plotPoints.find(p => p.id === visNode.originalId);
          if (foundPP) fullNodeData = { ...foundPP, itemType: 'plotPoint' };
        } else if (visNode.itemType === 'worldElement') {
          const foundWE = worldElements.find(w => w.id === visNode.originalId);
          if (foundWE) fullNodeData = { ...foundWE, itemType: 'worldElement' };
        }
        
        if (fullNodeData) {
          setSelectedNodeForModal(fullNodeData);
          setIsNodeDetailModalOpen(true);
        }
      }
    }
  }, [notes, plotPoints, worldElements, allVisNodes]);

  const handleAddEdge = useCallback((edgeData: { from: string; to: string }, callback: (edge: VisEdge | null) => void) => {
    const sourceNode = allVisNodes.find(n => n.id === edgeData.from);
    const targetNode = allVisNodes.find(n => n.id === edgeData.to);

    if (sourceNode && targetNode && sourceNode.itemType === 'note') {
      setLinkCreationData({ source: sourceNode, target: targetNode });
      setIsCreateLinkModalOpen(true);
      callback(null); 
    } else {
      if (sourceNode && sourceNode.itemType !== 'note') {
        alert("การสร้าง Link รองรับเฉพาะการลากจาก Note เท่านั้นในขณะนี้");
      }
      callback(null); 
    }
  }, [allVisNodes]);

  const handleSaveLinkFromModal = (sourceNoteId: string, targetItemId: string, relationshipType: LinkRelationshipType | string) => {
    onAddLink(sourceNoteId, targetItemId, relationshipType);
    setIsCreateLinkModalOpen(false);
    setLinkCreationData(null);
  };


  useEffect(() => {
    if (!graphContainerRef.current || typeof window.vis === 'undefined') {
      return;
    }

    const visEdges: VisEdge[] = [];
    notes.forEach(note => {
      if (note.links) {
        note.links.forEach((link) => {
          let targetVisNodeId = `${NODE_ID_PREFIX.NOTE}${link.targetId}`; // Default to note
          if (plotPoints.some(p => p.id === link.targetId)) targetVisNodeId = `${NODE_ID_PREFIX.PLOT_POINT}${link.targetId}`;
          else if (worldElements.some(w => w.id === link.targetId)) targetVisNodeId = `${NODE_ID_PREFIX.WORLD_ELEMENT}${link.targetId}`;
          
          if (allVisNodes.some(n => n.id === targetVisNodeId) && allVisNodes.some(n => n.id === `${NODE_ID_PREFIX.NOTE}${note.id}`)) {
            visEdges.push({
              from: `${NODE_ID_PREFIX.NOTE}${note.id}`,
              to: targetVisNodeId,
              label: link.type,
              arrows: 'to',
              font: { align: 'middle' },
              color: { color: isDarkMode ? '#6B7280' : '#9CA3AF', highlight: 'var(--c-primary)', hover: 'var(--c-primary)' }
            });
          }
        });
      }
    });

    const nodesDataSet = new window.vis.DataSet(allVisNodes);
    const edgesDataSet = new window.vis.DataSet(visEdges);

    const data = { nodes: nodesDataSet, edges: edgesDataSet };
    const options = { 
      autoResize: true, height: '100%', width: '100%', locale: 'th',
      nodes: {
        shape: 'ellipse',
        font: { color: isDarkMode ? '#FFFFFF' : '#1C1C1E', size: 12, },
        borderWidth: 1.5,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.25)', x:3, y:3, size:8 },
      },
      edges: {
        smooth: { enabled: true, type: 'dynamic', roundness: 0.5 },
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        color: { 
          color: isDarkMode ? 'rgba(174, 174, 178, 0.3)' : 'rgba(142, 142, 147, 0.4)',
          highlight: 'var(--c-primary)', 
          hover: 'var(--c-primary-hover)', 
          opacity: 1.0, 
        },
        font: { color: isDarkMode ? '#AEAEB2' : '#8E8E93', size: 10, strokeWidth: 0, align: 'middle', },
        width: 1.5, hoverWidth: 2,
      },
      physics: {
        enabled: layout === 'force', 
        solver: 'barnesHut',
        barnesHut: { 
          gravitationalConstant: -15000,
          centralGravity: 0.1,
          springLength: 250,
          springConstant: 0.02,
          damping: 0.15,
          avoidOverlap: 0.5
        },
        stabilization: { iterations: 1000, fit: true, }
      },
      layout: {
        hierarchical: layout === 'hierarchical' ? {
            enabled: true,
            direction: 'UD', // Up-Down
            sortMethod: 'directed', // Sort by node level (order)
            shakeTowards: 'roots',
            levelSeparation: 150,
            nodeSpacing: 200,
        } : false
      },
      interaction: { hover: true, tooltipDelay: 200, navigationButtons: true, keyboard: true, },
      manipulation: {
        enabled: true, 
        initiallyActive: true, 
        addEdge: (edgeData: {from: string, to: string}, callback: (edge: VisEdge | null) => void) => {
            handleAddEdge(edgeData, callback);
        },
        addNode: false, editEdge: false, deleteNode: false, deleteEdge: false,
      },
    };

    if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
    }
    
    // Add a small delay to prevent ResizeObserver errors
    setTimeout(() => {
        if(graphContainerRef.current) {
            networkInstanceRef.current = new window.vis.Network(graphContainerRef.current, data, options);
            networkInstanceRef.current.on("selectNode", handleNodeClick);
        }
    }, 0);

    return () => {
      if (networkInstanceRef.current) {
        networkInstanceRef.current.off("selectNode", handleNodeClick);
        networkInstanceRef.current.destroy();
        networkInstanceRef.current = null;
      }
    };
  }, [allVisNodes, notes, plotPoints, worldElements, isDarkMode, layout, handleNodeClick, handleAddEdge]);

  return (
    <>
      <div className="space-y-6 text-text-primary h-full flex flex-col">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Icon name="project-diagram" className="w-6 h-6 text-primary mr-3" />
              Knowledge Map
            </h1>
            <p className="text-text-secondary">แสดงความเชื่อมโยงของข้อมูลในรูปแบบไดนามิก (ลากเส้นจาก Note เพื่อสร้าง Link)</p>
          </div>
           <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <div className="flex items-center bg-surface rounded-md p-0.5">
                    <button onClick={() => setLayout('force')} title="Force Directed Layout" className={`px-3 py-1 text-sm rounded ${layout === 'force' ? 'bg-primary text-white' : 'text-text-secondary'}`}>
                        <Icon name="atom" className="w-4 h-4 mr-1" /> Force
                    </button>
                    <button onClick={() => setLayout('hierarchical')} title="Hierarchical Layout (Timeline)" className={`px-3 py-1 text-sm rounded ${layout === 'hierarchical' ? 'bg-primary text-white' : 'text-text-secondary'}`}>
                        <Icon name="stream" className="w-4 h-4 mr-1" /> Timeline
                    </button>
                </div>
                <button 
                    onClick={() => networkInstanceRef.current?.fit()}
                    className="p-2 w-10 h-10 flex items-center justify-center rounded-md hover:bg-surface text-text-secondary"
                    title="Fit graph to view"
                >
                    <Icon name="expand-arrows-alt" className="w-5 h-5" />
                </button>
           </div>
        </div>
        <div ref={graphContainerRef} className="vis-network-container flex-grow bg-bg rounded-lg shadow-sm border border-border">
          {allVisNodes.length === 0 && (
              <div className="flex items-center justify-center h-full text-text-secondary">
                  <p>ยังไม่มีข้อมูลสำหรับแสดงในกราฟ เริ่มสร้างโน้ต, จุดโครงเรื่อง, หรือองค์ประกอบโลก.</p>
              </div>
          )}
        </div>
      </div>
      <NodeDetailModal
        isOpen={isNodeDetailModalOpen}
        onClose={() => setIsNodeDetailModalOpen(false)}
        nodeData={selectedNodeForModal}
        allItems={allItems}
        onEditNote={onOpenNoteEditor as (note:Note) => void} 
        onNavigate={onNavigate}
      />
      <CreateLinkModal
        isOpen={isCreateLinkModalOpen}
        onClose={() => {
            setIsCreateLinkModalOpen(false);
            setLinkCreationData(null);
            if(networkInstanceRef.current) networkInstanceRef.current.addEdgeMode();
        }}
        sourceNode={linkCreationData?.source || null}
        targetNode={linkCreationData?.target || null}
        onSaveLink={handleSaveLinkFromModal}
      />
    </>
  );
};

export default GraphView;
