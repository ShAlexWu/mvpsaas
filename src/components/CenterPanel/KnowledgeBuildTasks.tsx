import React, { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Tree, message } from 'antd';
import { PauseOutlined, PlayCircleOutlined, DeleteOutlined, EditOutlined, FileOutlined } from '@ant-design/icons';
import { mockKnowledgeBuildTasks, mockFileDirectories, mockKnowledgeBases } from '../../mock/data';
import type { KnowledgeBuildTask, FileItem } from '../../mock/data';

interface KnowledgeBuildTasksProps {
  onBackToChat: () => void;
}

const KnowledgeBuildTasks: React.FC<KnowledgeBuildTasksProps> = ({ onBackToChat }) => {
  const [tasks, setTasks] = useState(mockKnowledgeBuildTasks);
  const [fileSourceModalVisible, setFileSourceModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KnowledgeBuildTask | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // 获取文件信息
  const getFileInfo = (fileId: string): FileItem | null => {
    for (const dir of mockFileDirectories) {
      const file = dir.files?.find(f => f.id === fileId);
      if (file) return file;
    }
    return null;
  };

  // 获取目录路径
  const getDirectoryPath = (dirId: string): string => {
    const dir = mockFileDirectories.find(d => d.id === dirId);
    if (!dir) return '未知目录';
    if (dir.parentId === 'dir-root') return `root/${dir.name}`;
    
    const parent = mockFileDirectories.find(d => d.id === dir.parentId);
    if (!parent) return dir.name;
    
    return `${getDirectoryPath(parent.id)}/${dir.name}`;
  };

  // 获取知识库目录名称
  const getKnowledgeBaseDirectoryName = (dirId: string): string => {
    const findNode = (nodes: typeof mockKnowledgeBases, id: string): string | null => {
      for (const node of nodes) {
        if (node.id === id) return node.name;
        if (node.children) {
          for (const child of node.children) {
            if (child.id === id) return child.name;
            if (child.children) {
              const found = findNode([child as any], id);
              if (found) return found;
            }
          }
        }
      }
      return null;
    };
    
    return findNode(mockKnowledgeBases, dirId) || '未知目录';
  };

  // 构建文件树
  const buildFileTree = (fileIds: string[]): any[] => {
    const fileMap = new Map<string, FileItem>();
    fileIds.forEach(id => {
      const file = getFileInfo(id);
      if (file) fileMap.set(id, file);
    });

    const dirMap = new Map<string, FileItem[]>();
    fileMap.forEach((file, id) => {
      if (!dirMap.has(file.directoryId)) {
        dirMap.set(file.directoryId, []);
      }
      dirMap.get(file.directoryId)!.push(file);
    });

    return Array.from(dirMap.entries()).map(([dirId, files]) => ({
      title: getDirectoryPath(dirId),
      key: dirId,
      icon: <FileOutlined />,
      children: files.map(file => ({
        title: file.name,
        key: file.id,
        icon: <FileOutlined />
      }))
    }));
  };

  const handlePauseResume = (task: KnowledgeBuildTask) => {
    const updated = tasks.map(t => 
      t.id === task.id 
        ? { ...t, status: t.status === 'running' ? 'paused' : 'running' }
        : t
    );
    setTasks(updated);
    message.success(task.status === 'running' ? '任务已暂停' : '任务已启动');
  };

  const handleDelete = () => {
    if (!selectedTask) return;
    const updated = tasks.filter(t => t.id !== selectedTask.id);
    setTasks(updated);
    message.success('任务已删除');
    setDeleteModalVisible(false);
    setSelectedTask(null);
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          running: { color: 'blue', text: '运行中' },
          paused: { color: 'orange', text: '已暂停' },
          success: { color: 'green', text: '成功' },
          failed: { color: 'red', text: '失败' }
        };
        const s = statusMap[status] || { color: 'default', text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string | undefined) => time || '-'
    },
    {
      title: '文件来源',
      dataIndex: 'fileSource',
      key: 'fileSource',
      render: (fileSource: string[], record: KnowledgeBuildTask) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedTask(record);
            setFileSourceModalVisible(true);
          }}
        >
          查看文件 ({fileSource.length}个)
        </Button>
      )
    },
    {
      title: '知识库目录',
      dataIndex: 'knowledgeBaseDirectoryId',
      key: 'knowledgeBaseDirectoryId',
      render: (dirId: string) => getKnowledgeBaseDirectoryName(dirId)
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: KnowledgeBuildTask) => (
        <Space>
          {(record.status === 'running' || record.status === 'paused') && (
            <Button
              type="link"
              size="small"
              icon={record.status === 'running' ? <PauseOutlined /> : <PlayCircleOutlined />}
              onClick={() => handlePauseResume(record)}
            >
              {record.status === 'running' ? '暂停' : '启动'}
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              message.info('编辑功能（Mock）');
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedTask(record);
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
        <h2 style={{ margin: 0 }}>知识构建任务</h2>
        <Button onClick={onBackToChat}>返回对话</Button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={false}
        />
      </div>

      {/* 文件来源模态框 */}
      <Modal
        title="文件来源"
        open={fileSourceModalVisible}
        onCancel={() => {
          setFileSourceModalVisible(false);
          setSelectedTask(null);
        }}
        footer={null}
        width={600}
      >
        {selectedTask && (
          <Tree
            treeData={buildFileTree(selectedTask.fileSource)}
            defaultExpandAll
            showIcon
          />
        )}
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedTask(null);
        }}
      >
        <p>确定要删除任务 "{selectedTask?.taskName}" 吗？</p>
        <p style={{ color: '#ff4d4f' }}>此操作不可恢复，请谨慎操作。</p>
      </Modal>
    </div>
  );
};

export default KnowledgeBuildTasks;

