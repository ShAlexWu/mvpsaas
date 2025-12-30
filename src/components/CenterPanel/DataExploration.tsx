import React, { useState } from 'react';
import { Select, Button, Card, Space, Tag } from 'antd';
import { mockAgents } from '../../mock/data';
import ChatWindow from './ChatWindow';
import type { Message } from '../../types';

interface DataExplorationProps {
  onBackToChat: () => void;
}

const DataExploration: React.FC<DataExplorationProps> = ({ onBackToChat }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: selectedAgentId 
        ? `这是基于智能体 "${mockAgents.find(a => a.id === selectedAgentId)?.name}" 的回复。\n\n思考路径：\n1. 理解用户问题\n2. 检索相关知识库\n3. 生成回答\n\n回答内容：根据您的问题，我找到了相关信息...`
        : '请先选择一个智能体',
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, userMessage, assistantMessage]);
  };

  const selectedAgent = mockAgents.find(a => a.id === selectedAgentId);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <Space>
          <span>选择智能体：</span>
          <Select
            style={{ width: 200 }}
            placeholder="请选择智能体"
            value={selectedAgentId}
            onChange={setSelectedAgentId}
          >
            {mockAgents.filter(a => a.status === 'online').map(agent => (
              <Select.Option key={agent.id} value={agent.id}>
                {agent.name}
              </Select.Option>
            ))}
          </Select>
          {selectedAgent && (
            <Tag color={selectedAgent.type === 'unstructured' ? 'blue' : selectedAgent.type === 'structured' ? 'green' : 'purple'}>
              {selectedAgent.type === 'unstructured' ? '知识问答' : selectedAgent.type === 'structured' ? '数据分析' : '复合探索'}
            </Tag>
          )}
        </Space>
        <Button onClick={onBackToChat}>返回对话</Button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {selectedAgentId ? (
          <ChatWindow messages={messages} onSendMessage={handleSendMessage} />
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontSize: '16px', color: '#999' }}>请先选择一个智能体开始数据探索</div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', maxWidth: '800px' }}>
              {mockAgents.filter(a => a.status === 'online').map(agent => (
                <Card
                  key={agent.id}
                  hoverable
                  style={{ width: 200 }}
                  onClick={() => setSelectedAgentId(agent.id)}
                >
                  <Card.Meta
                    title={agent.name}
                    description={agent.description}
                  />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExploration;




