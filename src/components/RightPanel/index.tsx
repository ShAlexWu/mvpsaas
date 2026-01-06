import React, { useState } from 'react';
import { mockKnowledgeBases } from '../../mock/data';
import KnowledgeBaseTree from './KnowledgeBaseTree';
import type { KnowledgeBaseNode } from '../../mock/data';

interface RightPanelProps {
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  selectedNodeId, 
  onNodeSelect
}) => {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseNode[]>(mockKnowledgeBases);

  return (
    <div style={{ 
      height: '100%', 
      backgroundColor: '#fff',
      borderLeft: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 知识库目录 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <KnowledgeBaseTree
          knowledgeBases={knowledgeBases}
          onNodeSelect={onNodeSelect}
          selectedNodeId={selectedNodeId}
          onKnowledgeBasesChange={setKnowledgeBases}
        />
      </div>
    </div>
  );
};

export default RightPanel;
