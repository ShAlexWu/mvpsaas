// Mock数据

export interface KnowledgeBaseNode {
  id: string;
  name: string;
  type: 'knowledgeBase' | 'directory' | 'file';
  children?: KnowledgeBaseNode[];
  status?: 'available' | 'building' | 'failed';
  fileType?: string;
  fileCount?: number; // 目录下的文件数量
  databaseConnections?: string[]; // 关联的数据库连接ID列表
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'offline';
  knowledgeBases: string[];
  type: 'unstructured' | 'structured' | 'composite';
  owner?: string; // 所有者用户ID，如果为空则表示是模板
  isShared?: boolean; // 是否被共享
  isTemplate?: boolean; // 是否为模板
}

export interface DataSource {
  id: string;
  name: string;
  type: 's3' | 'oss' | 'baidu' | 'feishu' | 'database';
  status: 'connected' | 'disconnected';
}

export interface SyncTask {
  id: string;
  name: string;
  connect_type?: string;
  status: 'running' | 'success' | 'failed';
  progress: number;
  startTime: string;
}

export interface Log {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export interface FileDirectory {
  id: string;
  name: string;
  parentId: string | null;
  level: number; // 1, 2, 3 (最多三级)
  files?: FileItem[];
}

export interface FileItem {
  id: string;
  name: string;
  directoryId: string;
  size: number;
  fileType: string;
  uploadTime: string;
  source: 'connector' | 'manual'; // 来源：连接器或手动上传
  connectorId?: string; // 如果来自连接器，记录连接器ID
}

export interface KnowledgeBuildTask {
  id: string;
  taskName: string;
  status: 'running' | 'paused' | 'success' | 'failed';
  createTime: string;
  endTime?: string;
  fileSource: string[]; // 文件ID列表
  knowledgeBaseDirectoryId: string; // 知识库目录ID
  processingType: 'structured' | 'unstructured' | 'both';
}

export interface DatabaseConnection {
  id: string;
  connectionName: string;
  connectorId: string;
  connectorName: string;
  databaseName: string;
  tableName: string;
  createTime: string;
}

export interface ConnectorSourceDirectory {
  connectorId: string;
  directories: {
    id: string;
    name: string;
    parentId: string | null;
    level: number;
    files?: {
      id: string;
      name: string;
      size: number;
      fileType: string;
    }[];
  }[];
}

// Mock知识库数据
export const mockKnowledgeBases: KnowledgeBaseNode[] = [
  {
    id: 'kb1',
    name: '财务部知识库',
    type: 'knowledgeBase',
    status: 'available',
    children: [
      {
        id: 'kb1-dir1',
        name: '财务通用知识库',
        type: 'directory',
        fileCount: 2,
        databaseConnections: ['db-conn-1'], // 关联财务数据库连接
        children: [
          { id: 'kb1-dir1-file1', name: '财务管理制度.pdf', type: 'file', fileType: 'pdf' },
          { id: 'kb1-dir1-file2', name: '报销流程说明.docx', type: 'file', fileType: 'docx' }
        ]
      },
      {
        id: 'kb1-dir2',
        name: '营收相关知识库',
        type: 'directory',
        fileCount: 2,
        children: [
          { id: 'kb1-dir2-file1', name: '2023年营收明细.xlsx', type: 'file', fileType: 'xlsx' },
          { id: 'kb1-dir2-file2', name: '2024年营收明细.xlsx', type: 'file', fileType: 'xlsx' }
        ]
      }
    ]
  },
  {
    id: 'kb2',
    name: '产品知识库',
    type: 'knowledgeBase',
    status: 'available',
    children: [
      {
        id: 'kb2-dir1',
        name: '产品文档知识库',
        type: 'directory',
        fileCount: 2,
        children: [
          { id: 'kb2-dir1-file1', name: '产品使用手册.pdf', type: 'file', fileType: 'pdf' },
          { id: 'kb2-dir1-file2', name: '常见问题解答.docx', type: 'file', fileType: 'docx' }
        ]
      }
    ]
  },
  {
    id: 'kb3',
    name: '测试知识库',
    type: 'knowledgeBase',
    status: 'building',
    children: [
      {
        id: 'kb3-dir1',
        name: '缺陷知识库',
        type: 'directory',
        fileCount: 1,
        children: [
          { id: 'kb3-dir1-file1', name: '缺陷记录.csv', type: 'file', fileType: 'csv' }
        ]
      },
      {
        id: 'kb3-dir2',
        name: '缺陷方法论知识库',
        type: 'directory',
        fileCount: 1,
        children: [
          { id: 'kb3-dir1-file2', name: '自动化测试指引.pdf', type: 'file', fileType: 'pdf' }
        ]
      }
    ]
  }
];

// Mock智能体数据
export const mockAgents: Agent[] = [
  {
    id: 'agent1',
    name: '财务助手',
    description: '帮助解答财务相关问题和数据分析',
    status: 'online',
    knowledgeBases: ['kb1'],
    type: 'composite',
    owner: 'current-user', // 当前用户的智能体
    isShared: false
  },
  {
    id: 'agent2',
    name: '产品客服',
    description: '回答产品使用和故障排查问题',
    status: 'online',
    knowledgeBases: ['kb2'],
    type: 'unstructured',
    owner: 'current-user', // 当前用户的智能体
    isShared: false
  },
  {
    id: 'agent3',
    name: '缺陷分析助手',
    description: '分析测试缺陷数据',
    status: 'offline',
    knowledgeBases: ['kb3'],
    type: 'structured',
    owner: 'current-user', // 当前用户的智能体
    isShared: false
  },
  {
    id: 'agent4',
    name: '财务小助手',
    description: '解答财务政策类问题、协助员工进行报销等财务相关操作',
    status: 'online',
    knowledgeBases: ['kb1'],
    type: 'composite',
    owner: 'user1',
    isShared: true
  },
  {
    id: 'agent5',
    name: '采购分析助手',
    description: '分析采购数据、协助员工进行采购相关操作',
    status: 'online',
    knowledgeBases: ['kb2'],
    type: 'structured',
    owner: 'user2',
    isShared: true
  },
  {
    id: 'agent-template1',
    name: '知识问答模板',
    description: '通用的知识问答智能体模板',
    status: 'online',
    knowledgeBases: [],
    type: 'unstructured',
    isTemplate: true
  },
  {
    id: 'agent-template2',
    name: '数据分析模板',
    description: '通用的数据分析智能体模板',
    status: 'online',
    knowledgeBases: [],
    type: 'structured',
    isTemplate: true
  }
];

// Mock数据源
export const mockDataSources: DataSource[] = [
  { id: 'ds1', name: '飞书文档库', type: 'feishu', status: 'connected' },
  { id: 'ds2', name: 'OSS存储', type: 'oss', status: 'connected' },
  { id: 'ds3', name: 'MySQL数据库', type: 'database', status: 'connected' }
];

// Mock同步任务
export const mockSyncTasks: SyncTask[] = [
  {
    id: 'task1',
    name: '2002949666209021952',
    connect_type: '本地上传',
    status: 'success',
    progress: 100,
    startTime: '2024-01-15 10:30:00'
  },
  {
    id: 'task2',
    name: '2002949666209021952',
    connect_type: '连接器',
    status: 'running',
    progress: 65,
    startTime: '2024-01-15 14:20:00'
  }
];

// Mock日志
export const mockLogs: Log[] = [
  { id: 'log1', user: '张三', action: '上传文件', target: '财务管理制度.pdf', time: '2024-01-15 10:30:00' },
  { id: 'log2', user: '李四', action: '创建智能体', target: '财务助手', time: '2024-01-15 11:15:00' },
  { id: 'log3', user: '王五', action: '提问', target: '怎么报销公司的商业医疗险', time: '2024-01-15 12:00:00' },
  { id: 'log4', user: '张三', action: '创建知识库', target: '产品知识库', time: '2024-01-15 13:20:00' }
];

// Mock知识构建任务
export const mockKnowledgeBuildTasks: KnowledgeBuildTask[] = [
  {
    id: 'task1',
    taskName: '财务政策知识构建',
    status: 'success',
    createTime: '2024-01-15 10:00:00',
    endTime: '2024-01-15 10:30:00',
    fileSource: ['file1', 'file2'],
    knowledgeBaseDirectoryId: 'kb1-dir1',
    processingType: 'unstructured'
  },
  {
    id: 'task2',
    taskName: '营收数据分析构建',
    status: 'running',
    createTime: '2024-01-15 14:00:00',
    fileSource: ['file3', 'file4'],
    knowledgeBaseDirectoryId: 'kb1-dir2',
    processingType: 'structured'
  },
  {
    id: 'task3',
    taskName: '产品文档知识构建',
    status: 'paused',
    createTime: '2024-01-15 15:00:00',
    fileSource: ['file5', 'file6'],
    knowledgeBaseDirectoryId: 'kb2-dir1',
    processingType: 'both'
  }
];

// Mock文件目录数据
export const mockFileDirectories: FileDirectory[] = [
  {
    id: 'dir-root',
    name: 'root',
    parentId: null,
    level: 0,
    files: []
  },
  {
    id: 'dir1',
    name: '财务文档',
    parentId: 'dir-root',
    level: 1,
    files: [
      { id: 'file1', name: '财务管理制度.pdf', directoryId: 'dir1', size: 2048000, fileType: 'pdf', uploadTime: '2024-01-15 10:30:00', source: 'manual' },
      { id: 'file2', name: '报销流程说明.docx', directoryId: 'dir1', size: 512000, fileType: 'docx', uploadTime: '2024-01-15 10:35:00', source: 'manual' }
    ]
  },
  {
    id: 'dir2',
    name: '营收数据',
    parentId: 'dir-root',
    level: 1,
    files: [
      { id: 'file3', name: '2023年营收明细.xlsx', directoryId: 'dir2', size: 1024000, fileType: 'xlsx', uploadTime: '2024-01-15 11:00:00', source: 'connector', connectorId: 'ds1' },
      { id: 'file4', name: '2024年营收明细.xlsx', directoryId: 'dir2', size: 1536000, fileType: 'xlsx', uploadTime: '2024-01-15 11:05:00', source: 'connector', connectorId: 'ds1' }
    ]
  },
  {
    id: 'dir3',
    name: '产品文档',
    parentId: 'dir-root',
    level: 1,
    files: [
      { id: 'file5', name: '产品使用手册.pdf', directoryId: 'dir3', size: 5120000, fileType: 'pdf', uploadTime: '2024-01-15 13:20:00', source: 'manual' },
      { id: 'file6', name: '常见问题解答.docx', directoryId: 'dir3', size: 256000, fileType: 'docx', uploadTime: '2024-01-15 13:25:00', source: 'manual' }
    ]
  },
  {
    id: 'dir1-1',
    name: '政策文件',
    parentId: 'dir1',
    level: 2,
    files: []
  },
  {
    id: 'dir1-1-1',
    name: '2024年政策',
    parentId: 'dir1-1',
    level: 3,
    files: [
      { id: 'file7', name: '2024年财务政策.pdf', directoryId: 'dir1-1-1', size: 1024000, fileType: 'pdf', uploadTime: '2024-01-15 14:00:00', source: 'manual' }
    ]
  }
];

// Mock数据库连接数据
export const mockDatabaseConnections: DatabaseConnection[] = [
  {
    id: 'db-conn-1',
    connectionName: '财务数据库连接',
    connectorId: 'ds3',
    connectorName: 'MySQL数据库',
    databaseName: 'finance_db',
    tableName: 'revenue_data',
    createTime: '2024-01-15 10:00:00'
  }
];

// Mock连接器源目录数据
export const mockConnectorSourceDirectories: ConnectorSourceDirectory[] = [
  {
    connectorId: 'ds1', // 飞书文档库
    directories: [
      { id: 'source-root-ds1', name: 'root', parentId: null, level: 0 },
      { 
        id: 'source-dir-ds1-1', 
        name: '产品文档', 
        parentId: 'source-root-ds1', 
        level: 1,
        files: [
          { id: 'source-file-ds1-1-1', name: '产品介绍.pdf', size: 2048000, fileType: 'pdf' },
          { id: 'source-file-ds1-1-2', name: '功能说明.docx', size: 512000, fileType: 'docx' }
        ]
      },
      { 
        id: 'source-dir-ds1-2', 
        name: '技术文档', 
        parentId: 'source-root-ds1', 
        level: 1,
        files: [
          { id: 'source-file-ds1-2-1', name: '技术架构图.png', size: 1024000, fileType: 'png' }
        ]
      },
      { 
        id: 'source-dir-ds1-3', 
        name: '会议纪要', 
        parentId: 'source-root-ds1', 
        level: 1,
        files: [
          { id: 'source-file-ds1-3-1', name: '2024年1月会议记录.docx', size: 256000, fileType: 'docx' }
        ]
      },
      { 
        id: 'source-dir-ds1-1-1', 
        name: '用户手册', 
        parentId: 'source-dir-ds1-1', 
        level: 2,
        files: [
          { id: 'source-file-ds1-1-1-1', name: '用户操作手册.pdf', size: 3072000, fileType: 'pdf' },
          { id: 'source-file-ds1-1-1-2', name: '常见问题解答.docx', size: 384000, fileType: 'docx' }
        ]
      },
      { 
        id: 'source-dir-ds1-1-2', 
        name: 'API文档', 
        parentId: 'source-dir-ds1-1', 
        level: 2,
        files: [
          { id: 'source-file-ds1-1-2-1', name: 'API接口文档.pdf', size: 1536000, fileType: 'pdf' }
        ]
      },
      { 
        id: 'source-dir-ds1-2-1', 
        name: '架构设计', 
        parentId: 'source-dir-ds1-2', 
        level: 2,
        files: [
          { id: 'source-file-ds1-2-1-1', name: '系统架构设计.docx', size: 768000, fileType: 'docx' }
        ]
      },
      { 
        id: 'source-dir-ds1-2-2', 
        name: '开发规范', 
        parentId: 'source-dir-ds1-2', 
        level: 2,
        files: [
          { id: 'source-file-ds1-2-2-1', name: '代码规范.pdf', size: 512000, fileType: 'pdf' }
        ]
      }
    ]
  },
  {
    connectorId: 'ds2', // OSS存储
    directories: [
      { id: 'source-root-ds2', name: 'root', parentId: null, level: 0 },
      { 
        id: 'source-dir-ds2-1', 
        name: '备份数据', 
        parentId: 'source-root-ds2', 
        level: 1,
        files: [
          { id: 'source-file-ds2-1-1', name: '数据库备份_20240115.sql', size: 52428800, fileType: 'sql' }
        ]
      },
      { 
        id: 'source-dir-ds2-2', 
        name: '日志文件', 
        parentId: 'source-root-ds2', 
        level: 1,
        files: [
          { id: 'source-file-ds2-2-1', name: 'app.log', size: 10485760, fileType: 'log' },
          { id: 'source-file-ds2-2-2', name: 'error.log', size: 2097152, fileType: 'log' }
        ]
      },
      { 
        id: 'source-dir-ds2-3', 
        name: '静态资源', 
        parentId: 'source-root-ds2', 
        level: 1
      },
      { 
        id: 'source-dir-ds2-1-1', 
        name: '数据库备份', 
        parentId: 'source-dir-ds2-1', 
        level: 2,
        files: [
          { id: 'source-file-ds2-1-1-1', name: 'mysql_backup_20240115.sql', size: 104857600, fileType: 'sql' }
        ]
      },
      { 
        id: 'source-dir-ds2-1-2', 
        name: '文件备份', 
        parentId: 'source-dir-ds2-1', 
        level: 2,
        files: [
          { id: 'source-file-ds2-1-2-1', name: 'files_backup_20240115.zip', size: 52428800, fileType: 'zip' }
        ]
      },
      { 
        id: 'source-dir-ds2-3-1', 
        name: '图片资源', 
        parentId: 'source-dir-ds2-3', 
        level: 2,
        files: [
          { id: 'source-file-ds2-3-1-1', name: 'banner.jpg', size: 2048000, fileType: 'jpg' },
          { id: 'source-file-ds2-3-1-2', name: 'logo.png', size: 512000, fileType: 'png' }
        ]
      },
      { 
        id: 'source-dir-ds2-3-2', 
        name: '视频资源', 
        parentId: 'source-dir-ds2-3', 
        level: 2,
        files: [
          { id: 'source-file-ds2-3-2-1', name: 'intro_video.mp4', size: 52428800, fileType: 'mp4' }
        ]
      }
    ]
  }
];

