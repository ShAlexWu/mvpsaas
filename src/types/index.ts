export type MenuKey = 'data-management' | 'agent-management' | 'data-exploration' | 'permission-management' | 'logs';
export type ViewType = 'chat' | MenuKey | 'knowledge-base-management' | 'knowledge-build-tasks';

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AppState {
  currentMenu: MenuKey | null;
  currentView: ViewType;
  selectedKnowledgeBaseNode: string | null;
  messages: Message[];
}

