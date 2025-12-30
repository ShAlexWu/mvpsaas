import React, { useState } from 'react';
import { Divider } from 'antd';
import { mockKnowledgeBases } from '../../mock/data';
import KnowledgeBaseTree from './KnowledgeBaseTree';
import type { KnowledgeBaseNode } from '../../mock/data';

interface RightPanelProps {
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onShowBuildTasks?: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  selectedNodeId, 
  onNodeSelect,
  onShowBuildTasks 
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
      {/* 上方：知识库目录 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <KnowledgeBaseTree
          knowledgeBases={knowledgeBases}
          onNodeSelect={onNodeSelect}
          selectedNodeId={selectedNodeId}
          onKnowledgeBasesChange={setKnowledgeBases}
        />
      </div>

      {/* 分隔线 */}
      <Divider style={{ margin: 0 }} />

      {/* 下方：构建任务入口 */}
      <div style={{ 
        padding: '16px',
        borderTop: '1px solid #e8e8e8',
        cursor: 'pointer',
        backgroundColor: '#fafafa',
        transition: 'background-color 0.3s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f0f0f0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fafafa';
      }}
      onClick={() => {
        if (onShowBuildTasks) {
          onShowBuildTasks();
        }
      }}
      >
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#262626',
          textAlign: 'center'
        }}>
          构建任务
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
