import React, { useState } from 'react';
import { Layout } from 'antd';
import LeftMenu from './components/LeftMenu';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import type { MenuKey, Message, ViewType } from './types';

const { Sider, Content } = Layout;

const App: React.FC = () => {
  const [currentMenu, setCurrentMenu] = useState<MenuKey | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [selectedKnowledgeBaseNode, setSelectedKnowledgeBaseNode] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '您好！我是AI数据探索平台的助手。\n\n我可以帮您：\n• 上传文件和管理数据\n• 创建和管理智能体\n• 进行数据探索和分析\n• 管理权限和查看日志\n\n您可以通过左侧菜单或直接告诉我您想要做什么。',
      timestamp: new Date().toISOString()
    }
  ]);

  const handleMenuClick = (key: MenuKey) => {
    setCurrentMenu(key);
    setCurrentView(key);
    // 点击菜单时，清除知识库节点选择
    setSelectedKnowledgeBaseNode(null);
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
    setCurrentMenu(null);
    // 返回系统对话时，不清除知识库节点选择，保持右侧选中状态
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedKnowledgeBaseNode(nodeId);
    // 点击知识库节点时，切换到知识库管理视图
    setCurrentView('knowledge-base-management');
    setCurrentMenu(null);
  };

  const handleShowBuildTasks = () => {
    setCurrentView('knowledge-build-tasks');
    setCurrentMenu(null);
    setSelectedKnowledgeBaseNode(null);
  };

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    // 简单的对话调起逻辑
    let response = '';
    let shouldSwitchView: MenuKey | null = null;

    if (content.includes('上传') || content.includes('文件')) {
      response = '好的，我来帮您上传文件。';
      shouldSwitchView = 'data-management';
    } else if (content.includes('创建') && content.includes('智能体')) {
      response = '您想要通过模板创建还是从0开始搭建？\n\n[使用模板创建] [从0开始搭建]';
      shouldSwitchView = 'agent-management';
    } else if (content.includes('知识库')) {
      response = '好的，我来帮您管理知识库。';
      shouldSwitchView = 'data-management';
    } else if (content.includes('导出')) {
      response = '好的，我来帮您导出知识库。';
      shouldSwitchView = 'data-management';
    } else if (content.includes('报销') || content.includes('医疗险')) {
      response = '我来调起财务助手智能体为您解答。\n\n根据财务政策文档，商业医疗险的报销流程如下：\n1. 准备相关医疗发票和证明材料\n2. 登录财务系统提交报销申请\n3. 等待审核通过后，财务部门会在5个工作日内完成报销。';
    } else {
      response = '我理解您的需求。您可以通过左侧菜单访问具体功能，或者告诉我更详细的需求，我会尽力帮助您。';
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, userMessage, assistantMessage]);

    // 如果需要切换视图，延迟一下让用户看到回复
    if (shouldSwitchView) {
      setTimeout(() => {
        setCurrentView(shouldSwitchView!);
        setCurrentMenu(shouldSwitchView!);
      }, 500);
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={200} style={{ backgroundColor: '#001529' }}>
        <LeftMenu currentMenu={currentMenu} onMenuClick={handleMenuClick} />
      </Sider>
      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        <CenterPanel
          currentView={currentView}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBackToChat={handleBackToChat}
          selectedKnowledgeBaseNode={selectedKnowledgeBaseNode}
          onNavigateToDataManagement={() => {
            setCurrentView('data-management');
            setCurrentMenu('data-management');
          }}
          onNavigateToTemplate={(templateType) => {
            // 切换到智能体管理页面，并可以传递模板类型
            setCurrentView('agent-management');
            setCurrentMenu('agent-management');
            // 这里可以根据模板类型做进一步处理，比如打开模板选择弹窗
            if (templateType === 'qa') {
              // 可以设置状态来打开知识问答模板
            } else if (templateType === 'analysis') {
              // 可以设置状态来打开数据分析模板
            }
          }}
        />
      </Content>
      <Sider width={300} style={{ backgroundColor: '#fff' }}>
        <RightPanel
          selectedNodeId={selectedKnowledgeBaseNode}
          onNodeSelect={handleNodeSelect}
          onShowBuildTasks={handleShowBuildTasks}
        />
      </Sider>
    </Layout>
  );
};

export default App;

