import React, { useState, useRef, useEffect } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined, DatabaseOutlined, AppstoreOutlined } from '@ant-design/icons';
import type { Message } from '../../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onNavigateToDataManagement?: () => void;
  onNavigateToTemplate?: (templateType: 'qa' | 'analysis') => void;
}

// 注意：onNavigateToTemplate 参数保留用于未来功能扩展

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  onSendMessage,
  onNavigateToDataManagement,
  onNavigateToTemplate: _onNavigateToTemplate
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 点击外部关闭模板菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTemplateMenu && !target.closest('.template-menu-container')) {
        setShowTemplateMenu(false);
      }
    };

    if (showTemplateMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTemplateMenu]);

  const handleSend = () => {
    if (!inputValue.trim()) {
      return;
    }
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#999', 
            marginTop: '100px',
            fontSize: '14px'
          }}>
            开始对话，我可以帮您：
            <div style={{ marginTop: '16px', textAlign: 'left', display: 'inline-block' }}>
              <div>• 上传文件和管理数据</div>
              <div>• 创建和管理智能体</div>
              <div>• 进行数据探索和分析</div>
              <div>• 管理权限和查看日志</div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '8px'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: msg.type === 'user' ? '#1890ff' : '#fff',
                  color: msg.type === 'user' ? '#fff' : '#262626',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #e8e8e8',
        backgroundColor: '#fff'
      }}>
        {/* 快捷入口 */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '8px',
          position: 'relative'
        }}>
          <Button
            type="text"
            size="small"
            icon={<DatabaseOutlined />}
            onClick={() => {
              if (onNavigateToDataManagement) {
                onNavigateToDataManagement();
              }
            }}
            style={{ 
              color: '#1890ff',
              padding: '4px 8px',
              height: 'auto',
              fontSize: '12px'
            }}
          >
            数据管理
          </Button>
          <div style={{ position: 'relative' }} className="template-menu-container">
            <Button
              type="text"
              size="small"
              icon={<AppstoreOutlined />}
              onClick={() => setShowTemplateMenu(!showTemplateMenu)}
              style={{ 
                color: '#1890ff',
                padding: '4px 8px',
                height: 'auto',
                fontSize: '12px'
              }}
            >
              模板
            </Button>
            {showTemplateMenu && (
              <div 
                className="template-menu-container"
                style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: '4px',
                backgroundColor: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: '120px'
              }}>
                <Button
                  type="text"
                  block
                  style={{ 
                    textAlign: 'left',
                    padding: '8px 12px',
                    height: 'auto',
                    fontSize: '12px'
                  }}>
                  知识问答
                </Button>
                <Button
                  type="text"
                  block
                  style={{ 
                    textAlign: 'left',
                    padding: '8px 12px',
                    height: 'auto',
                    fontSize: '12px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                  数据分析
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* 输入框和发送按钮 */}
        <div style={{ 
          display: 'flex',
          gap: '8px'
        }}>
          <Input.TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息... (Shift+Enter 换行)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1 }}
            onFocus={() => setShowTemplateMenu(false)}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            style={{ alignSelf: 'flex-end' }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

