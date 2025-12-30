import React, { useState, useMemo } from 'react';
import { Button, Card, Space, Tag, Table, Modal, message, Descriptions, Tabs, Tree, Select, Radio, Checkbox, Input } from 'antd';
import { EyeOutlined, DeleteOutlined, BuildOutlined, FolderOutlined, FileOutlined, DatabaseOutlined } from '@ant-design/icons';
import { mockKnowledgeBases, mockAgents, mockFileDirectories } from '../../mock/data';
import type { KnowledgeBaseNode, FileDirectory, FileItem } from '../../mock/data';

interface KnowledgeBaseManagementProps {
  selectedNodeId: string | null;
  onBackToChat: () => void;
}

const KnowledgeBaseManagement: React.FC<KnowledgeBaseManagementProps> = ({ selectedNodeId, onBackToChat }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [buildVisible, setBuildVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<KnowledgeBaseNode | null>(null);
  const [processingType, setProcessingType] = useState<'structured' | 'unstructured' | 'both'>('unstructured');
  const [selectedFileDirectoryId, setSelectedFileDirectoryId] = useState<string>('dir-root');
  const [selectedFilesForBuild, setSelectedFilesForBuild] = useState<string[]>([]);
  const [taskName, setTaskName] = useState('');

  // 查找选中的节点
  const findNode = (nodes: KnowledgeBaseNode[], id: string): KnowledgeBaseNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNode(mockKnowledgeBases, selectedNodeId);
  }, [selectedNodeId]);

  // 获取知识库根节点
  const getKnowledgeBaseRoot = (nodeId: string): KnowledgeBaseNode | null => {
    for (const kb of mockKnowledgeBases) {
      if (kb.id === nodeId) return kb;
      if (findNode([kb], nodeId)) return kb;
    }
    return null;
  };

  const knowledgeBaseRoot = selectedNodeId ? getKnowledgeBaseRoot(selectedNodeId) : null;

  // 获取受影响的智能体
  const affectedAgents = useMemo(() => {
    if (!knowledgeBaseRoot) return [];
    return mockAgents.filter(agent => agent.knowledgeBases.includes(knowledgeBaseRoot.id));
  }, [knowledgeBaseRoot]);

  // 获取当前目录下的文件列表
  const getFilesInDirectory = (node: KnowledgeBaseNode | null): KnowledgeBaseNode[] => {
    if (!node) return [];
    if (node.type === 'file') return [node];
    if (node.type === 'directory' && node.children) {
      return node.children.filter(child => child.type === 'file');
    }
    return [];
  };

  const files = getFilesInDirectory(selectedNode);

  // 文件列表列定义
  const fileColumns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <FileOutlined style={{ color: '#52c41a' }} />
          {text}
        </Space>
      )
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      render: (type: string) => <Tag>{type?.toUpperCase() || '未知'}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: KnowledgeBaseNode) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedFile(record);
              setPreviewVisible(true);
            }}
          >
            预览
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedFile(record);
              setDeleteVisible(true);
            }}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  const handleDelete = () => {
    message.success(`已删除 ${selectedFile?.name || selectedNode?.name}`);
    setDeleteVisible(false);
    setSelectedFile(null);
  };

  // 构建文件目录树
  const buildFileDirectoryTree = (directories: FileDirectory[]): any[] => {
    const rootDirs = directories.filter(d => d.parentId === 'dir-root');
    
    const buildChildren = (parentId: string, level: number): any[] => {
      if (level > 3) return [];
      
      return directories
        .filter(d => d.parentId === parentId)
        .map(dir => ({
          title: dir.name,
          key: dir.id,
          icon: <FolderOutlined />,
          children: buildChildren(dir.id, level + 1)
        }));
    };

    return [
      {
        title: 'root',
        key: 'dir-root',
        icon: <FolderOutlined />,
        children: rootDirs.map(dir => ({
          title: dir.name,
          key: dir.id,
          icon: <FolderOutlined />,
          children: buildChildren(dir.id, 2)
        }))
      }
    ];
  };

  const fileDirectoryTreeData = buildFileDirectoryTree(mockFileDirectories);

  // 获取目录下的所有文件
  const getFilesInFileDirectory = (dirId: string): FileItem[] => {
    const dir = mockFileDirectories.find(d => d.id === dirId);
    return dir?.files || [];
  };

  // 获取目录路径
  const getFileDirectoryPath = (dirId: string): string => {
    const dir = mockFileDirectories.find(d => d.id === dirId);
    if (!dir) return 'root';
    if (dir.parentId === 'dir-root') return `root/${dir.name}`;
    
    const parent = mockFileDirectories.find(d => d.id === dir.parentId);
    if (!parent) return dir.name;
    
    return `${getFileDirectoryPath(parent.id)}/${dir.name}`;
  };

  // 获取文件信息
  const getFileInfo = (fileId: string): FileItem | null => {
    for (const dir of mockFileDirectories) {
      const file = dir.files?.find(f => f.id === fileId);
      if (file) return file;
    }
    return null;
  };

  // 获取文件目录路径
  const getFileDirectoryPathById = (dirId: string): string => {
    const dir = mockFileDirectories.find(d => d.id === dirId);
    if (!dir) return '未知目录';
    return getFileDirectoryPath(dirId);
  };

  const handleBuild = () => {
    if (!taskName.trim()) {
      message.warning('请输入任务名称');
      return;
    }
    if (selectedFilesForBuild.length === 0) {
      message.warning('请至少选择一个文件');
      return;
    }
    message.success('知识构建任务已创建');
    setBuildVisible(false);
    setSelectedFilesForBuild([]);
    setTaskName('');
  };

  if (!selectedNode) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fff'
      }}>
        <div style={{ textAlign: 'center', color: '#999' }}>
          <DatabaseOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
          <div>请从右侧知识库树中选择一个节点</div>
        </div>
      </div>
    );
  }

  const isKnowledgeBase = selectedNode.type === 'knowledgeBase';
  const isDirectory = selectedNode.type === 'directory';
  const isFile = selectedNode.type === 'file';

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
        <div>
          <h2 style={{ margin: 0, marginBottom: '8px' }}>
            {isKnowledgeBase && <DatabaseOutlined style={{ marginRight: '8px', color: '#1890ff' }} />}
            {isDirectory && <FolderOutlined style={{ marginRight: '8px', color: '#faad14' }} />}
            {isFile && <FileOutlined style={{ marginRight: '8px', color: '#52c41a' }} />}
            {selectedNode.name}
          </h2>
          {selectedNode.status && (
            <Tag color={selectedNode.status === 'available' ? 'green' : selectedNode.status === 'building' ? 'orange' : 'red'}>
              {selectedNode.status === 'available' ? '可用' : selectedNode.status === 'building' ? '构建中' : '失败'}
            </Tag>
          )}
        </div>
        <Space>
          {!isFile && (
            <Button 
              type="primary" 
              icon={<BuildOutlined />}
              onClick={() => setBuildVisible(true)}
            >
              构建知识
            </Button>
          )}
          <Button onClick={onBackToChat}>返回对话</Button>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <Tabs
          items={[
            {
              key: 'info',
              label: '基本信息',
              children: (
                <div>
                  <Descriptions bordered column={2} style={{ marginBottom: '24px' }}>
                    <Descriptions.Item label="名称">{selectedNode.name}</Descriptions.Item>
                    <Descriptions.Item label="类型">
                      {isKnowledgeBase && '知识库'}
                      {isDirectory && '目录'}
                      {isFile && '文件'}
                    </Descriptions.Item>
                    {selectedNode.status && (
                      <Descriptions.Item label="状态">
                        <Tag color={selectedNode.status === 'available' ? 'green' : selectedNode.status === 'building' ? 'orange' : 'red'}>
                          {selectedNode.status === 'available' ? '可用' : selectedNode.status === 'building' ? '构建中' : '失败'}
                        </Tag>
                      </Descriptions.Item>
                    )}
                    {selectedNode.fileType && (
                      <Descriptions.Item label="文件类型">
                        <Tag>{selectedNode.fileType.toUpperCase()}</Tag>
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  {isKnowledgeBase && (
                    <Card title="关联的智能体" style={{ marginTop: '16px' }}>
                      {affectedAgents.length > 0 ? (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {affectedAgents.map(agent => (
                            <div key={agent.id} style={{ 
                              padding: '8px', 
                              backgroundColor: '#f5f5f5', 
                              borderRadius: '4px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{ fontWeight: 'bold' }}>{agent.name}</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>{agent.description}</div>
                              </div>
                              <Tag color={agent.status === 'online' ? 'green' : 'default'}>
                                {agent.status === 'online' ? '在线' : '离线'}
                              </Tag>
                            </div>
                          ))}
                        </Space>
                      ) : (
                        <div style={{ color: '#999' }}>暂无关联的智能体</div>
                      )}
                    </Card>
                  )}
                </div>
              )
            },
            {
              key: 'files',
              label: '文件列表',
              children: (
                <div>
                  {files.length > 0 ? (
                    <Table
                      columns={fileColumns}
                      dataSource={files}
                      rowKey="id"
                      pagination={false}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      {isFile ? '当前节点是文件，无子文件' : '当前目录下暂无文件'}
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'permissions',
              label: '权限设置',
              children: (
                <div>
                  <Card title="用户组/用户权限" style={{ marginBottom: '16px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <Button type="primary">分配权限</Button>
                    </div>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                      当前权限设置：所有用户组/用户均可访问
                    </div>
                  </Card>
                  {isKnowledgeBase && (
                    <Card title="行列级权限（结构化数据）">
                      <div style={{ color: '#999', fontSize: '14px' }}>
                        对于结构化数据，可以设置行列级权限控制，限制用户查看特定字段或数据行。
                      </div>
                    </Card>
                  )}
                </div>
              )
            }
          ]}
        />
      </div>

      {/* 预览文件模态框 */}
      <Modal
        title={`预览文件 - ${selectedFile?.name}`}
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setSelectedFile(null);
        }}
        footer={null}
        width={800}
      >
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999'
        }}>
          <div style={{ textAlign: 'center' }}>
            <FileOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>文件预览功能（Mock）</div>
            <div style={{ fontSize: '12px', marginTop: '8px' }}>
              实际环境中将显示文件内容预览
            </div>
          </div>
        </div>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        title="确认删除"
        open={deleteVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteVisible(false);
          setSelectedFile(null);
        }}
      >
        <p>确定要删除 "{selectedFile?.name || selectedNode?.name}" 吗？</p>
        {affectedAgents.length > 0 && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#fff7e6', 
            borderRadius: '4px',
            border: '1px solid #ffd591'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#d46b08' }}>
              警告：此操作将影响以下智能体：
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {affectedAgents.map(agent => (
                <li key={agent.id}>{agent.name}</li>
              ))}
            </ul>
          </div>
        )}
        <p style={{ color: '#ff4d4f', marginTop: '16px' }}>此操作不可恢复，请谨慎操作。</p>
      </Modal>

      {/* 构建知识模态框 */}
      <Modal
        title="构建知识"
        open={buildVisible}
        onOk={handleBuild}
        onCancel={() => {
          setBuildVisible(false);
          setSelectedFilesForBuild([]);
          setTaskName('');
        }}
        width={900}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>任务名称：</div>
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="请输入任务名称"
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>选择文件目录：</div>
          <div style={{ display: 'flex', gap: '16px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
            <div style={{ width: '300px', borderRight: '1px solid #e8e8e8', paddingRight: '16px' }}>
              <Tree
                treeData={fileDirectoryTreeData}
                defaultExpandAll
                selectedKeys={[selectedFileDirectoryId]}
                onSelect={(selectedKeys) => {
                  if (selectedKeys.length > 0) {
                    setSelectedFileDirectoryId(selectedKeys[0] as string);
                  }
                }}
                showIcon
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                当前目录：{getFileDirectoryPath(selectedFileDirectoryId)}
              </div>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <Checkbox.Group
                  value={selectedFilesForBuild}
                  onChange={(values) => setSelectedFilesForBuild(values as string[])}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {getFilesInFileDirectory(selectedFileDirectoryId).map(file => (
                      <div key={file.id} style={{ 
                        padding: '8px', 
                        border: '1px solid #e8e8e8', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Checkbox value={file.id} />
                        <FileOutlined style={{ color: '#52c41a' }} />
                        <span>{file.name}</span>
                        <Tag style={{ marginLeft: 'auto' }}>{file.fileType.toUpperCase()}</Tag>
                      </div>
                    ))}
                    {getFilesInFileDirectory(selectedFileDirectoryId).length === 0 && (
                      <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                        当前目录下暂无文件
                      </div>
                    )}
                  </Space>
                </Checkbox.Group>
              </div>
            </div>
          </div>
        </div>
        
        {/* 已选文件列表 */}
        {selectedFilesForBuild.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>已选文件：</div>
            <div style={{ 
              border: '1px solid #e8e8e8', 
              borderRadius: '4px', 
              padding: '12px',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {selectedFilesForBuild.map(fileId => {
                  const file = getFileInfo(fileId);
                  if (!file) return null;
                  return (
                    <div key={fileId} style={{ 
                      padding: '8px', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileOutlined style={{ color: '#52c41a' }} />
                        <span>{file.name}</span>
                        <Tag>{file.fileType.toUpperCase()}</Tag>
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        来自：{getFileDirectoryPathById(file.directoryId)}
                      </div>
                    </div>
                  );
                })}
              </Space>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>处理方式：</div>
          <Radio.Group value={processingType} onChange={(e) => setProcessingType(e.target.value)}>
            <Radio value="unstructured">非结构化处理</Radio>
            <Radio value="structured">结构化处理</Radio>
            <Radio value="both">两者都选</Radio>
          </Radio.Group>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>构建频率：</div>
          <Select defaultValue="once" style={{ width: '100%' }}>
            <Select.Option value="once">单次</Select.Option>
            <Select.Option value="periodic">周期</Select.Option>
            <Select.Option value="trigger">载入时触发</Select.Option>
          </Select>
        </div>
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          <div>默认处理方式：</div>
          <div>• 非结构化数据（doc、pdf、png等）默认非结构化处理</div>
          <div>• 结构化数据（csv、xlsx等）默认结构化处理</div>
        </div>
      </Modal>
    </div>
  );
};

export default KnowledgeBaseManagement;

