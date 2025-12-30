import React, { useState } from 'react';
import { Tree, Dropdown, Modal, Input, message } from 'antd';
import { FolderOutlined, DatabaseOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import type { KnowledgeBaseNode } from '../../mock/data';
import type { MenuProps } from 'antd';

interface KnowledgeBaseTreeProps {
  knowledgeBases: KnowledgeBaseNode[];
  onNodeSelect: (nodeId: string) => void;
  selectedNodeId: string | null;
  onKnowledgeBasesChange?: (knowledgeBases: KnowledgeBaseNode[]) => void;
}

const KnowledgeBaseTree: React.FC<KnowledgeBaseTreeProps> = ({
  knowledgeBases,
  onNodeSelect,
  selectedNodeId,
  onKnowledgeBasesChange
}) => {
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [currentNode, setCurrentNode] = useState<KnowledgeBaseNode | null>(null);
  const [newName, setNewName] = useState('');
  const [newDirName, setNewDirName] = useState('');

  // 计算目录下的文件数量
  const countFiles = (node: KnowledgeBaseNode): number => {
    if (node.type === 'file') return 1;
    if (!node.children) return 0;
    return node.children.reduce((sum, child) => sum + countFiles(child), 0);
  };

  const getIcon = (node: KnowledgeBaseNode) => {
    if (node.type === 'knowledgeBase') {
      return <DatabaseOutlined style={{ color: '#1890ff' }} />;
    }
    return <FolderOutlined style={{ color: '#faad14' }} />;
  };

  const getStatusBadge = (node: KnowledgeBaseNode) => {
    if (node.status === 'building') {
      return <span style={{ color: '#faad14', fontSize: '12px', marginLeft: '8px' }}>(构建中)</span>;
    }
    if (node.status === 'failed') {
      return <span style={{ color: '#ff4d4f', fontSize: '12px', marginLeft: '8px' }}>(失败)</span>;
    }
    return null;
  };

  // 查找节点
  const findNode = (nodes: KnowledgeBaseNode[], id: string): KnowledgeBaseNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 更新节点
  const updateNode = (nodes: KnowledgeBaseNode[], id: string, updater: (node: KnowledgeBaseNode) => KnowledgeBaseNode): KnowledgeBaseNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        return updater(node);
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children, id, updater) };
      }
      return node;
    });
  };

  // 删除节点
  const deleteNode = (nodes: KnowledgeBaseNode[], id: string): KnowledgeBaseNode[] => {
    return nodes.filter(node => {
      if (node.id === id) return false;
      if (node.children) {
        node.children = deleteNode(node.children, id);
      }
      return true;
    });
  };

  // 添加目录
  const addDirectory = (nodes: KnowledgeBaseNode[], parentId: string, name: string): KnowledgeBaseNode[] => {
    return nodes.map(node => {
      if (node.id === parentId && node.type !== 'file') {
        const newDir: KnowledgeBaseNode = {
          id: `${parentId}-dir-${Date.now()}`,
          name,
          type: 'directory',
          fileCount: 0,
          children: []
        };
        return {
          ...node,
          children: [...(node.children || []), newDir]
        };
      }
      if (node.children) {
        return { ...node, children: addDirectory(node.children, parentId, name) };
      }
      return node;
    });
  };

  const handleRename = () => {
    if (!newName.trim()) {
      message.warning('请输入名称');
      return;
    }
    if (!currentNode) return;
    
    const updated = updateNode(knowledgeBases, currentNode.id, node => ({
      ...node,
      name: newName
    }));
    
    if (onKnowledgeBasesChange) {
      onKnowledgeBasesChange(updated);
    }
    message.success('重命名成功');
    setRenameModalVisible(false);
    setCurrentNode(null);
    setNewName('');
  };

  const handleDelete = () => {
    if (!currentNode) return;
    
    const updated = deleteNode(knowledgeBases, currentNode.id);
    
    if (onKnowledgeBasesChange) {
      onKnowledgeBasesChange(updated);
    }
    message.success('删除成功');
    setDeleteModalVisible(false);
    setCurrentNode(null);
  };

  const handleAddDirectory = () => {
    if (!newDirName.trim()) {
      message.warning('请输入目录名称');
      return;
    }
    if (!currentNode) return;
    
    // 检查层级（最多三级）
    const getLevel = (node: KnowledgeBaseNode, id: string, level: number = 0): number => {
      if (node.id === id) return level;
      if (node.children) {
        for (const child of node.children) {
          const found = getLevel(child, id, level + 1);
          if (found !== -1) return found;
        }
      }
      return -1;
    };
    
    const level = getLevel(knowledgeBases.find(kb => kb.id === currentNode.id) || currentNode, currentNode.id);
    if (level >= 3) {
      message.warning('目录层级最多支持三级');
      return;
    }
    
    const updated = addDirectory(knowledgeBases, currentNode.id, newDirName);
    
    if (onKnowledgeBasesChange) {
      onKnowledgeBasesChange(updated);
    }
    message.success('目录创建成功');
    setAddModalVisible(false);
    setCurrentNode(null);
    setNewDirName('');
  };

  const convertToTreeData = (nodes: KnowledgeBaseNode[]): any[] => {
    return nodes.map(node => {
      const fileCount = node.fileCount !== undefined ? node.fileCount : countFiles(node);
      const title = (
        <span>
          {getIcon(node)}
          <span style={{ marginLeft: '8px' }}>{node.name}</span>
          {node.type === 'directory' && (
            <span style={{ color: '#999', fontSize: '12px', marginLeft: '8px' }}>
              ({fileCount}个文件)
            </span>
          )}
          {getStatusBadge(node)}
        </span>
      );

      return {
        title,
        key: node.id,
        children: node.children && node.children.length > 0 
          ? convertToTreeData(node.children.filter(child => child.type !== 'file'))
          : undefined
      };
    });
  };

  const treeData = convertToTreeData(knowledgeBases);

  const getMenuItems = (node: KnowledgeBaseNode): MenuProps['items'] => {
    const items: MenuProps['items'] = [];
    
    if (node.type === 'knowledgeBase' || node.type === 'directory') {
      items.push({
        key: 'add',
        label: '添加目录',
        icon: <PlusOutlined />,
        onClick: () => {
          setCurrentNode(node);
          setAddModalVisible(true);
        }
      });
      items.push({
        key: 'rename',
        label: '重命名',
        icon: <EditOutlined />,
        onClick: () => {
          setCurrentNode(node);
          setNewName(node.name);
          setRenameModalVisible(true);
        }
      });
      items.push({
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          setCurrentNode(node);
          setDeleteModalVisible(true);
        }
      });
    }
    
    return items;
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ 
        fontSize: '16px', 
        fontWeight: 'bold', 
        marginBottom: '16px',
        color: '#262626',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>知识库目录</span>
        <Dropdown
          menu={{
            items: [
              {
                key: 'add-kb',
                label: '新建知识库',
                icon: <PlusOutlined />,
                onClick: () => {
                  message.info('新建知识库功能（Mock）');
                }
              }
            ]
          }}
          trigger={['click']}
        >
          <PlusOutlined style={{ cursor: 'pointer' }} />
        </Dropdown>
      </div>
      <Tree
        treeData={treeData}
        selectedKeys={selectedNodeId ? [selectedNodeId] : []}
        onSelect={(selectedKeys) => {
          if (selectedKeys.length > 0) {
            onNodeSelect(selectedKeys[0] as string);
          }
        }}
        defaultExpandAll
        showIcon
        titleRender={(nodeData) => {
          const node = findNode(knowledgeBases, nodeData.key as string);
          if (!node) return nodeData.title;
          
          const menuItems = getMenuItems(node);
          if (menuItems && menuItems.length > 0) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{nodeData.title}</span>
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreOutlined 
                    style={{ 
                      cursor: 'pointer', 
                      padding: '4px',
                      marginLeft: '8px',
                      opacity: 0.6
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </div>
            );
          }
          return nodeData.title;
        }}
      />

      {/* 重命名模态框 */}
      <Modal
        title="重命名"
        open={renameModalVisible}
        onOk={handleRename}
        onCancel={() => {
          setRenameModalVisible(false);
          setCurrentNode(null);
          setNewName('');
        }}
      >
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="请输入新名称"
          onPressEnter={handleRename}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCurrentNode(null);
        }}
      >
        <p>确定要删除 "{currentNode?.name}" 吗？</p>
        <p style={{ color: '#ff4d4f' }}>此操作不可恢复，请谨慎操作。</p>
      </Modal>

      {/* 添加目录模态框 */}
      <Modal
        title="添加目录"
        open={addModalVisible}
        onOk={handleAddDirectory}
        onCancel={() => {
          setAddModalVisible(false);
          setCurrentNode(null);
          setNewDirName('');
        }}
      >
        <Input
          value={newDirName}
          onChange={(e) => setNewDirName(e.target.value)}
          placeholder="请输入目录名称"
          onPressEnter={handleAddDirectory}
        />
      </Modal>
    </div>
  );
};

export default KnowledgeBaseTree;
