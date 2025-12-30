import React from 'react';
import ChatWindow from './ChatWindow';
import DataManagement from './DataManagement';
import AgentManagement from './AgentManagement';
import DataExploration from './DataExploration';
import PermissionManagement from './PermissionManagement';
import Logs from './Logs';
import KnowledgeBaseManagement from './KnowledgeBaseManagement';
import KnowledgeBuildTasks from './KnowledgeBuildTasks';
import type { ViewType, Message } from '../../types';

interface CenterPanelProps {
  currentView: ViewType;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBackToChat: () => void;
  selectedKnowledgeBaseNode: string | null;
  onNavigateToDataManagement?: () => void;
  onNavigateToTemplate?: (templateType: 'qa' | 'analysis') => void;
}

const CenterPanel: React.FC<CenterPanelProps> = ({
  currentView,
  messages,
  onSendMessage,
  onBackToChat,
  selectedKnowledgeBaseNode,
  onNavigateToDataManagement,
  onNavigateToTemplate
}) => {
  if (currentView === 'chat') {
    return (
      <ChatWindow 
        messages={messages} 
        onSendMessage={onSendMessage}
        onNavigateToDataManagement={onNavigateToDataManagement}
        onNavigateToTemplate={onNavigateToTemplate}
      />
    );
  }

  if (currentView === 'knowledge-base-management') {
    return <KnowledgeBaseManagement selectedNodeId={selectedKnowledgeBaseNode} onBackToChat={onBackToChat} />;
  }

  if (currentView === 'knowledge-build-tasks') {
    return <KnowledgeBuildTasks onBackToChat={onBackToChat} />;
  }

  if (currentView === 'data-management') {
    return <DataManagement onBackToChat={onBackToChat} />;
  }

  if (currentView === 'agent-management') {
    return <AgentManagement onBackToChat={onBackToChat} />;
  }

  if (currentView === 'data-exploration') {
    return <DataExploration onBackToChat={onBackToChat} />;
  }

  if (currentView === 'permission-management') {
    return <PermissionManagement onBackToChat={onBackToChat} />;
  }

  if (currentView === 'logs') {
    return <Logs onBackToChat={onBackToChat} />;
  }

  return null;
};

export default CenterPanel;

