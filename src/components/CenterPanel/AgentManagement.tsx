import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Switch, Tree } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PoweroffOutlined } from '@ant-design/icons';
import { mockAgents } from '../../mock/data';
import type { Agent } from '../../mock/data';

interface AgentManagementProps {
  onBackToChat: () => void;
}

type AgentViewType = 'shared' | 'mine' | 'all' | 'templates';

const AgentManagement: React.FC<AgentManagementProps> = ({ onBackToChat }) => {
  const [agentModalVisible, setAgentModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [selectedUsersAndGroups, setSelectedUsersAndGroups] = useState<string[]>([]);
  const [autoGrantKnowledgeBaseAccess, setAutoGrantKnowledgeBaseAccess] = useState(true);
  const [currentView, setCurrentView] = useState<AgentViewType>('shared');

  // Mock用户组和用户数据
  const mockUserGroupsTree = [
    {
      title: '管理层',
      key: 'group1',
      children: [
        { title: '张三', key: 'user1' }
      ]
    },
    {
      title: 'IT部',
      key: 'group2',
      children: [
        { title: '李四', key: 'user2' }
      ]
    },
    {
      title: '财务部',
      key: 'group3',
      children: [
        { title: '王五', key: 'user3' },
        { title: '孙七', key: 'user5' }
      ]
    },
    {
      title: '产品部',
      key: 'group4',
      children: [
        { title: '赵六', key: 'user4' }
      ]
    }
  ];

  // 根据当前视图过滤智能体
  const getFilteredAgents = (): Agent[] => {
    const currentUserId = 'current-user'; // Mock当前用户ID
    
    switch (currentView) {
      case 'shared':
        return mockAgents.filter(agent => agent.isShared && !agent.isTemplate);
      case 'mine':
        return mockAgents.filter(agent => agent.owner === currentUserId && !agent.isTemplate);
      case 'templates':
        return mockAgents.filter(agent => agent.isTemplate);
      case 'all':
      default:
        return mockAgents.filter(agent => !agent.isTemplate);
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          unstructured: { color: 'blue', text: '知识问答' },
          structured: { color: 'green', text: '数据分析' },
          composite: { color: 'purple', text: '复合探索' }
        };
        const t = typeMap[type] || { color: 'default', text: type };
        return <Tag color={t.color}>{t.text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'online' ? 'green' : 'default'}>
          {status === 'online' ? '在线' : '离线'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Agent) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>编辑</Button>
          <Button 
            type="link" 
            size="small" 
            icon={<PoweroffOutlined />}
          >
            {record.status === 'online' ? '下线' : '上线'}
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedAgent(record);
              setDeleteModalVisible(true);
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0 }}>智能体管理</h2>
        <Space>
          <Button>使用模板创建</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAgentModalVisible(true)}>
            新建智能体
          </Button>
          <Button onClick={onBackToChat}>返回系统对话</Button>
        </Space>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* 分类链接 */}
        <div style={{ 
          marginBottom: '16px', 
          paddingBottom: '12px',
          borderBottom: '1px solid #e8e8e8',
          display: 'flex',
          gap: '24px'
        }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('shared');
            }}
            style={{
              color: currentView === 'shared' ? '#1890ff' : '#666',
              textDecoration: currentView === 'shared' ? 'underline' : 'none',
              fontWeight: currentView === 'shared' ? 'bold' : 'normal',
              fontSize: '14px'
            }}
          >
            共享的智能体
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('mine');
            }}
            style={{
              color: currentView === 'mine' ? '#1890ff' : '#666',
              textDecoration: currentView === 'mine' ? 'underline' : 'none',
              fontWeight: currentView === 'mine' ? 'bold' : 'normal',
              fontSize: '14px'
            }}
          >
            我的智能体
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('all');
            }}
            style={{
              color: currentView === 'all' ? '#1890ff' : '#666',
              textDecoration: currentView === 'all' ? 'underline' : 'none',
              fontWeight: currentView === 'all' ? 'bold' : 'normal',
              fontSize: '14px'
            }}
          >
            所有智能体
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('templates');
            }}
            style={{
              color: currentView === 'templates' ? '#1890ff' : '#666',
              textDecoration: currentView === 'templates' ? 'underline' : 'none',
              fontWeight: currentView === 'templates' ? 'bold' : 'normal',
              fontSize: '14px'
            }}
          >
            智能体模板
          </a>
        </div>
        
        <Table
          columns={columns}
          dataSource={getFilteredAgents()}
          rowKey="id"
          pagination={false}
        />
      </div>

      <Modal
        title="新建智能体"
        open={agentModalVisible}
        onCancel={() => {
          setAgentModalVisible(false);
          setShareEnabled(false);
          setSelectedUsersAndGroups([]);
          setAutoGrantKnowledgeBaseAccess(true);
        }}
        width={800}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="名称" name="name" required>
            <Input placeholder="请输入智能体名称" />
          </Form.Item>
          <Form.Item label="描述" name="description" required>
            <Input.TextArea placeholder="请输入智能体描述" rows={3} />
          </Form.Item>
          <Form.Item label="人设和回复逻辑" name="persona">
            <Input.TextArea placeholder="角色、背景、任务、格式、样例、文风" rows={4} />
          </Form.Item>
          <Form.Item label="开场白" name="greeting">
            <Input.TextArea placeholder="首轮提问之前，智能体的自我介绍" rows={2} />
          </Form.Item>
          <Form.Item label="关联知识库" name="knowledgeBases" required>
            <Select mode="multiple" placeholder="请选择知识库">
              <Select.Option value="kb1">财务部知识库</Select.Option>
              <Select.Option value="kb2">产品知识库</Select.Option>
              <Select.Option value="kb3">测试知识库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="检索方式" name="retrievalType">
            <Select placeholder="请选择检索方式">
              <Select.Option value="vector">向量检索</Select.Option>
              <Select.Option value="fulltext">全文检索</Select.Option>
              <Select.Option value="hybrid">混合检索</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="TOP K 阈值" name="topK">
            <Input type="number" placeholder="请输入TOP K阈值" />
          </Form.Item>
          <Form.Item label="相似度阈值" name="similarity">
            <Input type="number" placeholder="请输入相似度阈值" />
          </Form.Item>
          <Form.Item label="发布和共享">
            <div>
              <div style={{ marginBottom: '12px' }}>
                <Switch 
                  checked={shareEnabled}
                  onChange={setShareEnabled}
                /> 
                <span style={{ marginLeft: '8px' }}>发布后共享给其他用户</span>
              </div>
              {shareEnabled && (
                <div style={{ 
                  marginLeft: '32px', 
                  padding: '16px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px',
                  border: '1px solid #e8e8e8'
                }}>
                  <Form.Item label="选择用户组/用户" style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      border: '1px solid #d9d9d9', 
                      borderRadius: '4px', 
                      padding: '12px',
                      maxHeight: '200px',
                      overflow: 'auto',
                      backgroundColor: '#fff'
                    }}>
                      <Tree
                        checkable
                        treeData={mockUserGroupsTree}
                        checkedKeys={selectedUsersAndGroups}
                        onCheck={(checkedKeys) => {
                          setSelectedUsersAndGroups(checkedKeys as string[]);
                        }}
                        defaultExpandAll
                      />
                    </div>
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          自动下发知识库权限
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {autoGrantKnowledgeBaseAccess 
                            ? '被分享的用户将会拥有该智能体关联的所有知识库的使用权限'
                            : '被分享的用户是否能获取智能体回复，取决于其是否已经拥有相关知识库的使用权限'
                          }
                        </div>
                      </div>
                      <Switch 
                        checked={autoGrantKnowledgeBaseAccess}
                        onChange={setAutoGrantKnowledgeBaseAccess}
                      />
                    </div>
                  </Form.Item>
                </div>
              )}
            </div>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary">保存</Button>
              <Button onClick={() => {
                setAgentModalVisible(false);
                setShareEnabled(false);
                setSelectedUsersAndGroups([]);
                setAutoGrantKnowledgeBaseAccess(true);
              }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={() => {
          setDeleteModalVisible(false);
          setSelectedAgent(null);
        }}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedAgent(null);
        }}
      >
        <p>确定要删除智能体 "{selectedAgent?.name}" 吗？</p>
        <p style={{ color: '#ff4d4f' }}>删除后将影响所有使用该智能体的用户，此操作不可恢复。</p>
      </Modal>
    </div>
  );
};

export default AgentManagement;

