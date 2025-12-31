import React, { useState } from 'react';
import { Tabs, Table, Button, Space, Tag, Progress, Modal, Form, Input, Select, Upload, Tree, message } from 'antd';
import { PlusOutlined, UploadOutlined, ReloadOutlined, FolderOutlined, DeleteOutlined } from '@ant-design/icons';
import { mockDataSources, mockSyncTasks, mockFileDirectories } from '../../mock/data';
import type { SyncTask, FileDirectory, FileItem } from '../../mock/data';

interface DataManagementProps {
  onBackToChat: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onBackToChat }) => {
  const [connectorModalVisible, setConnectorModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [directoryModalVisible, setDirectoryModalVisible] = useState(false);
  const [fileDirectories, setFileDirectories] = useState<FileDirectory[]>(mockFileDirectories);
  const [selectedDirectoryId, setSelectedDirectoryId] = useState<string>('dir-root');

  // 构建目录树数据
  const buildDirectoryTree = (directories: FileDirectory[]): any[] => {
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

  const directoryTreeData = buildDirectoryTree(fileDirectories);

  // 获取目录下的所有文件
  const getFilesInDirectory = (dirId: string): FileItem[] => {
    const dir = fileDirectories.find(d => d.id === dirId);
    return dir?.files || [];
  };

  // 获取目录路径
  const getDirectoryPath = (dirId: string): string => {
    const dir = fileDirectories.find(d => d.id === dirId);
    if (!dir) return 'root';
    if (dir.parentId === 'dir-root') return `root/${dir.name}`;
    
    const parent = fileDirectories.find(d => d.id === dir.parentId);
    if (!parent) return dir.name;
    
    return `${getDirectoryPath(parent.id)}/${dir.name}`;
  };

  // 检查是否可以创建子目录（最多三级）
  const canCreateSubDirectory = (parentId: string): boolean => {
    const parent = fileDirectories.find(d => d.id === parentId);
    if (!parent) return true;
    return parent.level < 3;
  };

  const handleCreateDirectory = (values: any) => {
    const parentDir = fileDirectories.find(d => d.id === values.parentId);
    if (!canCreateSubDirectory(values.parentId)) {
      message.error('目录层级最多支持三级，无法继续创建');
      return;
    }
    
    const newDir: FileDirectory = {
      id: `dir-${Date.now()}`,
      name: values.name,
      parentId: values.parentId,
      level: (parentDir?.level || 0) + 1,
      files: []
    };
    
    setFileDirectories([...fileDirectories, newDir]);
    message.success('目录创建成功');
    setDirectoryModalVisible(false);
  };

  const dataSourceColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          s3: 'S3',
          oss: 'OSS',
          baidu: '百度网盘',
          feishu: '飞书文档库',
          database: '数据库'
        };
        return typeMap[type] || type;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'connected' ? 'green' : 'red'}>
          {status === 'connected' ? '已连接' : '未连接'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      )
    }
  ];

  const taskColumns = [
    {
      title: '任务编号',
      dataIndex: 'name',
      key: 'name'
    },
    {
        title: '同步方式',
        dataIndex: 'connect_type',
        key: 'connect_type'
      },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          running: { color: 'blue', text: '运行中' },
          success: { color: 'green', text: '成功' },
          failed: { color: 'red', text: '失败' }
        };
        const s = statusMap[status] || { color: 'default', text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record: SyncTask) => (
        record.status === 'running' ? (
          <Progress percent={progress} size="small" />
        ) : (
          <span>{progress}%</span>
        )
      )
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" size="small">查看详情</Button>
      )
    }
  ];

  const fileColumns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => (
        <Tag color={source === 'connector' ? 'blue' : 'green'}>
          {source === 'connector' ? '连接器' : '手动上传'}
        </Tag>
      )
    },
    {
      title: '上传时间',
      dataIndex: 'uploadTime',
      key: 'uploadTime'
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
          删除
        </Button>
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
        <h2 style={{ margin: 0 }}>数据管理</h2>
        <Button onClick={onBackToChat}>返回系统对话</Button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <Tabs
          items={[
            {
              key: 'directories',
              label: '文件目录',
              children: (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setDirectoryModalVisible(true)}
                    >
                      创建目录
                    </Button>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '300px', border: '1px solid #e8e8e8', borderRadius: '4px', padding: '16px' }}>
                      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>目录结构</div>
                      <Tree
                        treeData={directoryTreeData}
                        defaultExpandAll
                        selectedKeys={[selectedDirectoryId]}
                        onSelect={(selectedKeys) => {
                          if (selectedKeys.length > 0) {
                            setSelectedDirectoryId(selectedKeys[0] as string);
                          }
                        }}
                        showIcon
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontWeight: 'bold' }}>当前目录：</span>
                        <span>{getDirectoryPath(selectedDirectoryId)}</span>
                      </div>
                      <Table
                        columns={fileColumns}
                        dataSource={getFilesInDirectory(selectedDirectoryId)}
                        rowKey="id"
                        pagination={false}
                      />
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'connectors',
              label: '连接器',
              children: (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={() => setConnectorModalVisible(true)}
                    >
                      新建连接器
                    </Button>
                  </div>
                  <Table
                    columns={dataSourceColumns}
                    dataSource={mockDataSources}
                    rowKey="id"
                    pagination={false}
                  />
                </div>
              )
            },
            {
              key: 'sync',
              label: '数据同步',
              children: (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<UploadOutlined />}
                        onClick={() => setUploadModalVisible(true)}
                      >
                        上传文件
                      </Button>
                      <Button 
                        icon={<ReloadOutlined />}
                        onClick={() => setSyncModalVisible(true)}
                      >
                        同步数据
                      </Button>
                    </Space>
                  </div>
                  <Table
                    columns={taskColumns}
                    dataSource={mockSyncTasks}
                    rowKey="id"
                    pagination={false}
                  />
                </div>
              )
            }
          ]}
        />
      </div>

      {/* 创建目录模态框 */}
      <Modal
        title="创建目录"
        open={directoryModalVisible}
        onCancel={() => setDirectoryModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleCreateDirectory}>
          <Form.Item label="目录名称" name="name" rules={[{ required: true, message: '请输入目录名称' }]}>
            <Input placeholder="请输入目录名称" />
          </Form.Item>
          <Form.Item label="父目录" name="parentId" initialValue="dir-root">
            <Select>
              {fileDirectories.map(dir => (
                <Select.Option key={dir.id} value={dir.id}>
                  {getDirectoryPath(dir.id)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">创建</Button>
              <Button onClick={() => setDirectoryModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新建连接器模态框 */}
      <Modal
        title="新建连接器"
        open={connectorModalVisible}
        onCancel={() => setConnectorModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="名称" name="name" required>
            <Input placeholder="请输入连接器名称" />
          </Form.Item>
          <Form.Item label="类型" name="type" required>
            <Select placeholder="请选择数据源类型">
              <Select.Option value="s3">S3</Select.Option>
              <Select.Option value="oss">OSS</Select.Option>
              <Select.Option value="baidu">百度网盘</Select.Option>
              <Select.Option value="feishu">飞书文档库</Select.Option>
              <Select.Option value="database">数据库</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="地址" name="address">
            <Input placeholder="请输入连接地址" />
          </Form.Item>
          <Form.Item label="端口" name="port">
            <Input placeholder="请输入端口" />
          </Form.Item>
          <Form.Item label="用户名" name="username">
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码" name="password">
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary">保存</Button>
              <Button onClick={() => setConnectorModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传文件模态框 */}
      <Modal
        title="上传文件"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="选择文件" name="files" required>
            <Upload.Dragger multiple>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持单个文件最大200MB，最多上传20个文件
              </p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item label="目标目录" name="targetDir" required>
            <Select placeholder="请选择目标目录">
              {fileDirectories.map(dir => (
                <Select.Option key={dir.id} value={dir.id}>
                  {getDirectoryPath(dir.id)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary">上传</Button>
              <Button onClick={() => setUploadModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 同步数据模态框 */}
      <Modal
        title="同步数据"
        open={syncModalVisible}
        onCancel={() => setSyncModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="选择连接器" name="connector" required>
            <Select placeholder="请选择连接器">
              {mockDataSources.filter(ds => ds.status === 'connected').map(ds => (
                <Select.Option key={ds.id} value={ds.id}>{ds.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="目标目录" name="targetDir" required>
            <Select placeholder="请选择目标目录">
              {fileDirectories.map(dir => (
                <Select.Option key={dir.id} value={dir.id}>
                  {getDirectoryPath(dir.id)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="同步方式" name="syncType" initialValue="once">
            <Select>
              <Select.Option value="once">单次拉取</Select.Option>
              <Select.Option value="periodic">定期拉取</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary">开始同步</Button>
              <Button onClick={() => setSyncModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataManagement;
