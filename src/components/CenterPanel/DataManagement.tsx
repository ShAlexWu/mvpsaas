import React, { useState } from 'react';
import { Tabs, Table, Button, Space, Tag, Progress, Modal, Form, Input, Select, Upload, Tree, message, Checkbox, Radio, Tooltip } from 'antd';
import { PlusOutlined, UploadOutlined, ReloadOutlined, FolderOutlined, DeleteOutlined, BuildOutlined, PauseOutlined, PlayCircleOutlined, EditOutlined, FileOutlined, DatabaseOutlined } from '@ant-design/icons';
import { mockDataSources, mockSyncTasks, mockFileDirectories, mockKnowledgeBuildTasks, mockKnowledgeBases, mockDatabaseConnections, mockConnectorSourceDirectories } from '../../mock/data';
import type { SyncTask, FileDirectory, FileItem, KnowledgeBuildTask, DatabaseConnection } from '../../mock/data';

interface DataManagementProps {
  onBackToChat: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ onBackToChat }) => {
  const [connectorModalVisible, setConnectorModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [directoryModalVisible, setDirectoryModalVisible] = useState(false);
  const [selectedSyncConnectorId, setSelectedSyncConnectorId] = useState<string>('');
  const [selectedSourceDirectoryId, setSelectedSourceDirectoryId] = useState<string>('');
  const [selectedSourceFiles, setSelectedSourceFiles] = useState<string[]>([]);
  const [expandedSourceDirs, setExpandedSourceDirs] = useState<string[]>([]);
  const [fileDirectories, setFileDirectories] = useState<FileDirectory[]>(mockFileDirectories);
  const [selectedDirectoryId, setSelectedDirectoryId] = useState<string>('dir-root');
  
  // 数据加工相关状态
  const [buildKnowledgeModalVisible, setBuildKnowledgeModalVisible] = useState(false);
  const [tasks, setTasks] = useState<KnowledgeBuildTask[]>(mockKnowledgeBuildTasks);
  const [selectedFileDirectoryId, setSelectedFileDirectoryId] = useState<string>('dir-root');
  const [selectedFilesForBuild, setSelectedFilesForBuild] = useState<string[]>([]);
  const [taskName, setTaskName] = useState('');
  const [processingType, setProcessingType] = useState<'structured' | 'unstructured' | 'both'>('unstructured');
  const [selectedKnowledgeBaseDirectoryId, setSelectedKnowledgeBaseDirectoryId] = useState<string>('');
  const [fileSourceModalVisible, setFileSourceModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KnowledgeBuildTask | null>(null);
  const [deleteTaskModalVisible, setDeleteTaskModalVisible] = useState(false);
  
  // 数据库连接相关状态
  const [databaseConnections, setDatabaseConnections] = useState<DatabaseConnection[]>(mockDatabaseConnections);
  const [newDatabaseConnectionModalVisible, setNewDatabaseConnectionModalVisible] = useState(false);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [connectionName, setConnectionName] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<any[]>([]);
  
  // 存储用量状态（Mock数据）
  const [storageUsage] = useState({
    total: 1000, // 总容量 1000GB
    used: 350,   // 已使用 350GB
    remaining: 650 // 剩余 650GB
  });
  
  // 格式化存储大小显示
  const formatStorageSize = (gb: number) => {
    if (gb >= 1024) {
      return `${(gb / 1024).toFixed(2)} TB`;
    }
    return `${gb.toFixed(2)} GB`;
  };

  // 获取连接器的源目录数据
  const getConnectorSourceDirectories = (connectorId: string) => {
    const connectorSource = mockConnectorSourceDirectories.find(cs => cs.connectorId === connectorId);
    return connectorSource?.directories || [];
  };

  // 构建源目录树数据（包含文件）
  const buildSourceDirectoryTree = (connectorId: string): any[] => {
    const directories = getConnectorSourceDirectories(connectorId);
    if (directories.length === 0) return [];
    
    const rootDirs = directories.filter(d => d.parentId === null);
    
    const buildChildren = (parentId: string, level: number): any[] => {
      if (level > 3) return [];
      
      const dirChildren = directories
        .filter(d => d.parentId === parentId)
        .map(dir => {
          const fileChildren = (dir.files || []).map(file => ({
            title: file.name,
            key: file.id,
            icon: <FileOutlined />,
            isLeaf: true
          }));
          
          const subDirs = buildChildren(dir.id, level + 1);
          
          return {
            title: dir.name,
            key: dir.id,
            icon: <FolderOutlined />,
            children: [...subDirs, ...fileChildren].length > 0 
              ? [...subDirs, ...fileChildren] 
              : undefined
          };
        });
      
      return dirChildren;
    };

    return rootDirs.map(rootDir => {
      const fileChildren = (rootDir.files || []).map(file => ({
        title: file.name,
        key: file.id,
        icon: <FileOutlined />,
        isLeaf: true
      }));
      
      const subDirs = buildChildren(rootDir.id, 1);
      
      return {
        title: rootDir.name,
        key: rootDir.id,
        icon: <FolderOutlined />,
        children: [...subDirs, ...fileChildren].length > 0 
          ? [...subDirs, ...fileChildren] 
          : undefined
      };
    });
  };

  // 获取源目录路径
  const getSourceDirectoryPath = (dirId: string, connectorId: string): string => {
    const directories = getConnectorSourceDirectories(connectorId);
    const dir = directories.find(d => d.id === dirId);
    if (!dir) return 'root';
    if (dir.parentId === null) return dir.name;
    
    const parent = directories.find(d => d.id === dir.parentId);
    if (!parent) return dir.name;
    
    return `${getSourceDirectoryPath(parent.id, connectorId)}/${dir.name}`;
  };

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

  // 获取文件信息
  const getFileInfo = (fileId: string): FileItem | null => {
    for (const dir of fileDirectories) {
      const file = dir.files?.find(f => f.id === fileId);
      if (file) return file;
    }
    return null;
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
    fileMap.forEach((file) => {
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

  // 构建知识库目录树（只显示目录，不显示文件）
  const buildKnowledgeBaseTree = (): any[] => {
    const buildNode = (nodes: typeof mockKnowledgeBases): any[] => {
      return nodes.map(node => {
        // 只显示知识库和目录，不显示文件
        if (node.type === 'file') return null;
        
        const children = node.children 
          ? buildNode(node.children.filter(child => child.type !== 'file') as any)
          : undefined;
        
        return {
          title: node.name,
          key: node.id,
          icon: node.type === 'knowledgeBase' ? <DatabaseOutlined /> : <FolderOutlined />,
          children: children && children.length > 0 ? children : undefined
        };
      }).filter(Boolean) as any[];
    };
    return buildNode(mockKnowledgeBases);
  };

  const handleBuildKnowledge = () => {
    if (!taskName.trim()) {
      message.warning('请输入任务名称');
      return;
    }
    if (selectedFilesForBuild.length === 0) {
      message.warning('请至少选择一个文件');
      return;
    }
 
    
    const newTask: KnowledgeBuildTask = {
      id: `task-${Date.now()}`,
      taskName,
      status: 'running',
      createTime: new Date().toLocaleString('zh-CN'),
      fileSource: selectedFilesForBuild,
      knowledgeBaseDirectoryId: selectedKnowledgeBaseDirectoryId,
      processingType: processingType
    };
    
    setTasks([...tasks, newTask]);
    message.success('知识构建任务已创建');
    setBuildKnowledgeModalVisible(false);
    setSelectedFilesForBuild([]);
    setTaskName('');
    setSelectedKnowledgeBaseDirectoryId('');
  };

  const handlePauseResume = (task: KnowledgeBuildTask) => {
    const updated: KnowledgeBuildTask[] = tasks.map(t => 
      t.id === task.id 
        ? { ...t, status: (t.status === 'running' ? 'paused' : 'running') as KnowledgeBuildTask['status'] }
        : t
    );
    setTasks(updated);
    message.success(task.status === 'running' ? '任务已暂停' : '任务已启动');
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;
    const updated = tasks.filter(t => t.id !== selectedTask.id);
    setTasks(updated);
    message.success('任务已删除');
    setDeleteTaskModalVisible(false);
    setSelectedTask(null);
  };

  // Mock数据库列表
  const getDatabases = (connectorId: string): string[] => {
    if (!connectorId) return [];
    // Mock数据：根据连接器返回数据库列表
    return ['finance_db', 'hr_db', 'product_db'];
  };

  // Mock表列表
  const getTables = (connectorId: string, databaseName: string): string[] => {
    if (!connectorId || !databaseName) return [];
    // Mock数据：根据数据库返回表列表
    if (databaseName === 'finance_db') {
      return ['revenue_data', 'expense_data', 'budget_data'];
    } else if (databaseName === 'hr_db') {
      return ['employee_info', 'salary_data', 'attendance_data'];
    } else if (databaseName === 'product_db') {
      return ['product_info', 'inventory_data', 'sales_data'];
    }
    return ['table1', 'table2', 'table3'];
  };

  // 构建数据库和表的树结构
  const buildDatabaseTableTree = (): any[] => {
    if (!selectedConnectorId) return [];
    
    const databases = getDatabases(selectedConnectorId);
    return databases.map(db => ({
      title: db,
      key: `db-${db}`,
      icon: <DatabaseOutlined style={{ color: '#1890ff' }} />,
      children: getTables(selectedConnectorId, db).map(table => ({
        title: table,
        key: `table-${db}-${table}`,
        icon: <FileOutlined style={{ color: '#52c41a' }} />,
        isLeaf: true
      }))
    }));
  };

  // 处理树节点选择（点击）
  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length === 0) {
      setSelectedDatabase('');
      setSelectedTable('');
      setPreviewData([]);
      setPreviewColumns([]);
      return;
    }
    
    const selectedKey = selectedKeys[0] as string;
    
    // 判断是数据库节点还是表节点
    if (selectedKey.startsWith('db-')) {
      // 数据库节点
      const dbName = selectedKey.replace('db-', '');
      setSelectedDatabase(dbName);
      setSelectedTable('');
      setPreviewData([]);
      setPreviewColumns([]);
    } else if (selectedKey.startsWith('table-')) {
      // 表节点
      const parts = selectedKey.replace('table-', '').split('-');
      const dbName = parts[0];
      const tableName = parts.slice(1).join('-');
      setSelectedDatabase(dbName);
      setSelectedTable(tableName);
      
      // 自动预览表数据
      generatePreviewData(tableName);
    }
  };

  // 处理树节点勾选
  const handleTreeCheck = (checkedKeysValue: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    const checked = Array.isArray(checkedKeysValue) ? checkedKeysValue : checkedKeysValue.checked;
    setCheckedKeys(checked);
    
    // 如果勾选了表节点，自动预览最后一个勾选的表
    const tableKeys = checked.filter((key: React.Key) => 
      typeof key === 'string' && key.startsWith('table-')
    ) as string[];
    
    if (tableKeys.length > 0) {
      // 预览最后一个勾选的表
      const lastTableKey = tableKeys[tableKeys.length - 1];
      const parts = lastTableKey.replace('table-', '').split('-');
      const dbName = parts[0];
      const tableName = parts.slice(1).join('-');
      setSelectedDatabase(dbName);
      setSelectedTable(tableName);
      generatePreviewData(tableName);
    } else {
      // 如果没有勾选表，清除预览
      setSelectedTable('');
      setPreviewData([]);
      setPreviewColumns([]);
    }
  };

  // 生成预览数据
  const generatePreviewData = (tableName: string) => {
    let mockPreviewData: any[] = [];
    let mockColumns: any[] = [];
    
    if (tableName === 'revenue_data') {
      mockColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
        { title: '收入金额', dataIndex: 'amount', key: 'amount', width: 120 },
        { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
        { title: '备注', dataIndex: 'remark', key: 'remark' }
      ];
      mockPreviewData = [
        { id: 1, date: '2024-01-01', amount: '100000.00', department: '销售部', remark: 'Q1销售额' },
        { id: 2, date: '2024-01-02', amount: '85000.50', department: '销售部', remark: 'Q1销售额' },
        { id: 3, date: '2024-01-03', amount: '120000.00', department: '市场部', remark: 'Q1销售额' },
        { id: 4, date: '2024-01-04', amount: '95000.75', department: '销售部', remark: 'Q1销售额' },
        { id: 5, date: '2024-01-05', amount: '110000.00', department: '市场部', remark: 'Q1销售额' },
        { id: 6, date: '2024-01-06', amount: '88000.25', department: '销售部', remark: 'Q1销售额' },
        { id: 7, date: '2024-01-07', amount: '130000.00', department: '市场部', remark: 'Q1销售额' },
        { id: 8, date: '2024-01-08', amount: '92000.50', department: '销售部', remark: 'Q1销售额' },
        { id: 9, date: '2024-01-09', amount: '105000.00', department: '市场部', remark: 'Q1销售额' },
        { id: 10, date: '2024-01-10', amount: '98000.75', department: '销售部', remark: 'Q1销售额' }
      ];
    } else if (tableName === 'expense_data') {
      mockColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
        { title: '支出金额', dataIndex: 'amount', key: 'amount', width: 120 },
        { title: '类别', dataIndex: 'category', key: 'category', width: 120 },
        { title: '说明', dataIndex: 'description', key: 'description' }
      ];
      mockPreviewData = [
        { id: 1, date: '2024-01-01', amount: '5000.00', category: '办公用品', description: '采购办公用品' },
        { id: 2, date: '2024-01-02', amount: '3000.50', category: '差旅费', description: '员工出差费用' },
        { id: 3, date: '2024-01-03', amount: '8000.00', category: '设备维护', description: '设备维修费用' },
        { id: 4, date: '2024-01-04', amount: '2500.75', category: '办公用品', description: '采购办公用品' },
        { id: 5, date: '2024-01-05', amount: '4500.00', category: '差旅费', description: '员工出差费用' },
        { id: 6, date: '2024-01-06', amount: '6000.25', category: '设备维护', description: '设备维修费用' },
        { id: 7, date: '2024-01-07', amount: '3500.00', category: '办公用品', description: '采购办公用品' },
        { id: 8, date: '2024-01-08', amount: '2800.50', category: '差旅费', description: '员工出差费用' },
        { id: 9, date: '2024-01-09', amount: '7200.00', category: '设备维护', description: '设备维修费用' },
        { id: 10, date: '2024-01-10', amount: '4200.75', category: '办公用品', description: '采购办公用品' }
      ];
    } else if (tableName === 'budget_data') {
      mockColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '年度', dataIndex: 'year', key: 'year', width: 100 },
        { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
        { title: '预算金额', dataIndex: 'budget', key: 'budget', width: 120 },
        { title: '已使用', dataIndex: 'used', key: 'used', width: 120 },
        { title: '剩余', dataIndex: 'remaining', key: 'remaining', width: 120 }
      ];
      mockPreviewData = [
        { id: 1, year: '2024', department: '销售部', budget: '1000000.00', used: '350000.00', remaining: '650000.00' },
        { id: 2, year: '2024', department: '市场部', budget: '800000.00', used: '280000.00', remaining: '520000.00' },
        { id: 3, year: '2024', department: '研发部', budget: '1500000.00', used: '450000.00', remaining: '1050000.00' },
        { id: 4, year: '2024', department: '人事部', budget: '500000.00', used: '150000.00', remaining: '350000.00' },
        { id: 5, year: '2024', department: '财务部', budget: '600000.00', used: '200000.00', remaining: '400000.00' },
        { id: 6, year: '2024', department: '运营部', budget: '700000.00', used: '250000.00', remaining: '450000.00' },
        { id: 7, year: '2024', department: '客服部', budget: '400000.00', used: '120000.00', remaining: '280000.00' },
        { id: 8, year: '2024', department: '行政部', budget: '300000.00', used: '80000.00', remaining: '220000.00' },
        { id: 9, year: '2024', department: '法务部', budget: '350000.00', used: '100000.00', remaining: '250000.00' },
        { id: 10, year: '2024', department: 'IT部', budget: '900000.00', used: '320000.00', remaining: '580000.00' }
      ];
    } else {
      // 默认预览数据
      mockColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '列1', dataIndex: 'column1', key: 'column1' },
        { title: '列2', dataIndex: 'column2', key: 'column2' },
        { title: '列3', dataIndex: 'column3', key: 'column3' }
      ];
      mockPreviewData = [
        { id: 1, column1: 'value1', column2: 'value2', column3: 'value3' },
        { id: 2, column1: 'value4', column2: 'value5', column3: 'value6' },
        { id: 3, column1: 'value7', column2: 'value8', column3: 'value9' },
        { id: 4, column1: 'value10', column2: 'value11', column3: 'value12' },
        { id: 5, column1: 'value13', column2: 'value14', column3: 'value15' },
        { id: 6, column1: 'value16', column2: 'value17', column3: 'value18' },
        { id: 7, column1: 'value19', column2: 'value20', column3: 'value21' },
        { id: 8, column1: 'value22', column2: 'value23', column3: 'value24' },
        { id: 9, column1: 'value25', column2: 'value26', column3: 'value27' },
        { id: 10, column1: 'value28', column2: 'value29', column3: 'value30' }
      ];
    }
    
    setPreviewData(mockPreviewData);
    setPreviewColumns(mockColumns);
  };


  const handleCreateDatabaseConnection = () => {
    if (!connectionName.trim()) {
      message.warning('请输入连接名称');
      return;
    }
    if (!selectedConnectorId) {
      message.warning('请选择连接器');
      return;
    }
    if (!selectedDatabase) {
      message.warning('请选择数据库');
      return;
    }
    if (!selectedTable) {
      message.warning('请选择表');
      return;
    }
    
    const connector = mockDataSources.find(ds => ds.id === selectedConnectorId);
    const newConnection: DatabaseConnection = {
      id: `db-conn-${Date.now()}`,
      connectionName,
      connectorId: selectedConnectorId,
      connectorName: connector?.name || '',
      databaseName: selectedDatabase,
      tableName: selectedTable,
      createTime: new Date().toLocaleString('zh-CN')
    };
    
    setDatabaseConnections([...databaseConnections, newConnection]);
    message.success('数据库连接创建成功');
    setNewDatabaseConnectionModalVisible(false);
    setConnectionName('');
    setSelectedConnectorId('');
    setSelectedDatabase('');
    setSelectedTable('');
    setPreviewData([]);
    setPreviewColumns([]);
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
                      <Tooltip title="上传本地文件">
                        <Button 
                          type="primary" 
                          icon={<UploadOutlined />}
                          onClick={() => setUploadModalVisible(true)}
                        >
                          上传文件
                        </Button>
                      </Tooltip>
                      <Tooltip title="同步其他系统（数据库除外）中的文件">
                        <Button 
                          icon={<ReloadOutlined />}
                          onClick={() => setSyncModalVisible(true)}
                        >
                          同步数据
                        </Button>
                      </Tooltip>
                      <Tooltip title="同步数据库中的元数据">
                        <Button 
                          icon={<DatabaseOutlined />}
                          onClick={() => setNewDatabaseConnectionModalVisible(true)}
                        >
                          新建数据库连接
                        </Button>
                      </Tooltip>
                    </Space>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>数据库连接列表</h3>
                    <Table
                      columns={[
                        {
                          title: '连接名称',
                          dataIndex: 'connectionName',
                          key: 'connectionName'
                        },
                        {
                          title: '连接器名称',
                          dataIndex: 'connectorName',
                          key: 'connectorName'
                        },
                        {
                          title: '创建时间',
                          dataIndex: 'createTime',
                          key: 'createTime'
                        },
                        {
                          title: '操作',
                          key: 'action',
                          render: (_: any, record: DatabaseConnection) => (
                            <Space>
                              <Button type="link" size="small">查看详情</Button>
                              <Button type="link" size="small" danger onClick={() => {
                                setDatabaseConnections(databaseConnections.filter(c => c.id !== record.id));
                                message.success('删除成功');
                              }}>删除</Button>
                            </Space>
                          )
                        }
                      ]}
                      dataSource={databaseConnections}
                      rowKey="id"
                      pagination={false}
                    />
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '16px' }}>同步任务列表</h3>
                    <Table
                      columns={taskColumns}
                      dataSource={mockSyncTasks}
                      rowKey="id"
                      pagination={false}
                    />
                  </div>
                </div>
              )
            },
            {
              key: 'processing',
              label: '数据加工',
              children: (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <Button 
                      type="primary" 
                      icon={<BuildOutlined />}
                      onClick={() => setBuildKnowledgeModalVisible(true)}
                    >
                      新建任务
                    </Button>
                  </div>
                  <Table
                    columns={[
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
                                setDeleteTaskModalVisible(true);
                              }}
                            >
                              删除
                            </Button>
                          </Space>
                        )
                      }
                    ]}
                    dataSource={tasks}
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
        onCancel={() => {
          setSyncModalVisible(false);
          setSelectedSyncConnectorId('');
          setSelectedSourceDirectoryId('');
          setSelectedSourceFiles([]);
          setExpandedSourceDirs([]);
        }}
        footer={null}
        width={800}
      >
        <Form layout="vertical">
          <Form.Item label="选择连接器" name="connector" required>
            <Select 
              placeholder="请选择连接器"
              value={selectedSyncConnectorId}
              onChange={(value) => {
                setSelectedSyncConnectorId(value);
                setSelectedSourceDirectoryId('');
                setSelectedSourceFiles([]);
                setExpandedSourceDirs([]);
              }}
            >
              {mockDataSources
                .filter(ds => ds.status === 'connected' && ds.type !== 'database')
                .map(ds => (
                  <Select.Option key={ds.id} value={ds.id}>{ds.name}</Select.Option>
                ))}
            </Select>
          </Form.Item>
          
          {selectedSyncConnectorId && (
            <>
              <Form.Item label="源目录和文件" name="sourceDir" required>
                <div style={{ 
                  border: '1px solid #e8e8e8', 
                  borderRadius: '4px', 
                  padding: '12px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  backgroundColor: '#fafafa'
                }}>
                  <Tree
                    treeData={buildSourceDirectoryTree(selectedSyncConnectorId)}
                    checkable
                    checkedKeys={selectedSourceFiles}
                    selectedKeys={selectedSourceDirectoryId ? [selectedSourceDirectoryId] : []}
                    expandedKeys={expandedSourceDirs}
                    onSelect={(selectedKeys) => {
                      if (selectedKeys.length > 0) {
                        const key = selectedKeys[0] as string;
                        // 如果是目录节点，设置选中状态
                        const directories = getConnectorSourceDirectories(selectedSyncConnectorId);
                        const isDirectory = directories.some(d => d.id === key);
                        if (isDirectory) {
                          setSelectedSourceDirectoryId(key);
                        }
                      } else {
                        setSelectedSourceDirectoryId('');
                      }
                    }}
                    onCheck={(checkedKeysValue) => {
                      const checked = Array.isArray(checkedKeysValue) 
                        ? checkedKeysValue 
                        : checkedKeysValue.checked;
                      setSelectedSourceFiles(checked as string[]);
                    }}
                    onExpand={(expandedKeys) => {
                      setExpandedSourceDirs(expandedKeys as string[]);
                    }}
                    defaultExpandAll
                    showIcon
                    blockNode
                  />
                </div>
              </Form.Item>
              
              {selectedSourceFiles.length > 0 && (
                <Form.Item label="已选择的文件">
                  <div style={{ 
                    border: '1px solid #e8e8e8', 
                    borderRadius: '4px', 
                    padding: '12px',
                    maxHeight: '150px',
                    overflow: 'auto',
                    backgroundColor: '#fafafa'
                  }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {selectedSourceFiles.map(fileId => {
                        // 查找文件信息
                        const directories = getConnectorSourceDirectories(selectedSyncConnectorId);
                        let fileInfo: any = null;
                        let dirPath = '';
                        
                        for (const dir of directories) {
                          const file = dir.files?.find(f => f.id === fileId);
                          if (file) {
                            fileInfo = file;
                            dirPath = getSourceDirectoryPath(dir.id, selectedSyncConnectorId);
                            break;
                          }
                        }
                        
                        if (!fileInfo) return null;
                        
                        return (
                          <div key={fileId} style={{ 
                            padding: '8px', 
                            backgroundColor: '#fff', 
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid #e8e8e8'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileOutlined style={{ color: '#52c41a' }} />
                              <span>{fileInfo.name}</span>
                              <Tag>{fileInfo.fileType.toUpperCase()}</Tag>
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              {dirPath} / {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        );
                      })}
                    </Space>
                  </div>
                </Form.Item>
              )}
            </>
          )}
          
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
              <Button onClick={() => {
                setSyncModalVisible(false);
                setSelectedSyncConnectorId('');
                setSelectedSourceDirectoryId('');
              }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 构建知识模态框 */}
      <Modal
        title=""
        open={buildKnowledgeModalVisible}
        onOk={handleBuildKnowledge}
        onCancel={() => {
          setBuildKnowledgeModalVisible(false);
          setSelectedFilesForBuild([]);
          setTaskName('');
          setSelectedKnowledgeBaseDirectoryId('');
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
                treeData={directoryTreeData}
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
                当前目录：{getDirectoryPath(selectedFileDirectoryId)}
              </div>
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <Checkbox.Group
                  value={selectedFilesForBuild}
                  onChange={(values) => setSelectedFilesForBuild(values as string[])}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {getFilesInDirectory(selectedFileDirectoryId).map(file => (
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
                    {getFilesInDirectory(selectedFileDirectoryId).length === 0 && (
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
                        来自：{getDirectoryPath(file.directoryId)}
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

      {/* 删除任务确认模态框 */}
      <Modal
        title="确认删除"
        open={deleteTaskModalVisible}
        onOk={handleDeleteTask}
        onCancel={() => {
          setDeleteTaskModalVisible(false);
          setSelectedTask(null);
        }}
      >
        <p>确定要删除任务 "{selectedTask?.taskName}" 吗？</p>
        <p style={{ color: '#ff4d4f' }}>此操作不可恢复，请谨慎操作。</p>
      </Modal>

      {/* 新建数据库连接模态框 */}
      <Modal
        title="新建数据库连接"
        open={newDatabaseConnectionModalVisible}
        onOk={handleCreateDatabaseConnection}
        onCancel={() => {
          setNewDatabaseConnectionModalVisible(false);
          setConnectionName('');
          setSelectedConnectorId('');
          setSelectedDatabase('');
          setSelectedTable('');
          setCheckedKeys([]);
          setPreviewData([]);
          setPreviewColumns([]);
        }}
        width={1000}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>连接名称：</div>
          <Input
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            placeholder="请输入连接名称"
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>选择连接器：</div>
          <Select
            value={selectedConnectorId}
            onChange={(value) => {
              setSelectedConnectorId(value);
              setSelectedDatabase('');
              setSelectedTable('');
              setCheckedKeys([]);
              setPreviewData([]);
              setPreviewColumns([]);
            }}
            placeholder="请选择数据库类型的连接器"
            style={{ width: '100%' }}
          >
            {mockDataSources
              .filter(ds => ds.type === 'database' && ds.status === 'connected')
              .map(ds => (
                <Select.Option key={ds.id} value={ds.id}>
                  {ds.name}
                </Select.Option>
              ))}
          </Select>
        </div>
        {selectedConnectorId && (
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            border: '1px solid #e8e8e8', 
            borderRadius: '4px', 
            padding: '16px',
            minHeight: '500px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* 左侧：数据库和表的树结构 */}
            <div style={{ 
              width: '300px', 
              minWidth: '300px',
              flexShrink: 0,
              borderRight: '1px solid #e8e8e8', 
              paddingRight: '16px',
              overflow: 'auto',
              maxHeight: '500px'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                数据库和表
              </div>
              <Tree
                treeData={buildDatabaseTableTree()}
                checkable
                checkedKeys={checkedKeys}
                selectedKeys={
                  selectedTable 
                    ? [`table-${selectedDatabase}-${selectedTable}`]
                    : selectedDatabase 
                    ? [`db-${selectedDatabase}`]
                    : []
                }
                onSelect={handleTreeSelect}
                onCheck={handleTreeCheck}
                defaultExpandAll
                showIcon
                blockNode
              />
            </div>
            
            {/* 右侧：表数据预览 */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              minWidth: 0,
              overflow: 'hidden'
            }}>
              {selectedTable && previewData.length > 0 ? (
                <>
                  <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                    表数据预览（前10行）
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#999', 
                    marginBottom: '8px' 
                  }}>
                    {selectedDatabase}.{selectedTable}
                  </div>
                  {checkedKeys.filter((key: React.Key) => 
                    typeof key === 'string' && key.startsWith('table-')
                  ).length > 1 && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#1890ff', 
                      marginBottom: '8px' 
                    }}>
                      已勾选 {checkedKeys.filter((key: React.Key) => 
                        typeof key === 'string' && key.startsWith('table-')
                      ).length} 个表
                    </div>
                  )}
                  <div style={{ 
                    border: '1px solid #e8e8e8', 
                    borderRadius: '4px', 
                    padding: '12px',
                    flex: 1,
                    overflow: 'auto',
                    backgroundColor: '#fafafa',
                    minHeight: 0
                  }}>
                    <Table
                      columns={previewColumns}
                      dataSource={previewData}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      scroll={{ x: 'max-content', y: 400 }}
                      style={{ width: '100%' }}
                    />
                  </div>
                </>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  color: '#999',
                  fontSize: '14px'
                }}>
                  {selectedDatabase ? '请勾选一个表以预览数据' : '请先选择数据库和表'}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
      
      {/* 底部状态栏 */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #e8e8e8',
        backgroundColor: '#fafafa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: '#666'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>存储用量：</span>
          <span>
            已使用 <strong style={{ color: '#1890ff' }}>{formatStorageSize(storageUsage.used)}</strong>
          </span>
          <span>/</span>
          <span>
            总容量 <strong>{formatStorageSize(storageUsage.total)}</strong>
          </span>
          <span style={{ color: '#52c41a' }}>
            （剩余 {formatStorageSize(storageUsage.remaining)}）
          </span>
          <Progress 
            percent={Math.round((storageUsage.used / storageUsage.total) * 100)} 
            size="small" 
            style={{ width: '200px', marginLeft: '8px' }}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
