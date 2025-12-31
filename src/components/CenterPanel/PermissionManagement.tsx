import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, Table, Button, Space, Tag, Tree, Select, Modal, message, Card, Divider, Input, Popconfirm } from 'antd';
import { EditOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { mockKnowledgeBases } from '../../mock/data';
import type { KnowledgeBaseNode } from '../../mock/data';

interface PermissionManagementProps {
  onBackToChat: () => void;
}

interface UserGroup {
  id: string;
  name: string;
  children?: UserGroup[];
  users?: User[];
}

interface User {
  id: string;
  name: string;
}

interface TableField {
  id: string;
  name: string;
  type: string;
  visible: boolean;
}

interface TableInfo {
  id: string;
  name: string;
  fields: TableField[];
}

interface ColumnPermission {
  tableId: string;
  fieldId: string;
  visibleUsersAndGroups: string[]; // 不可见此字段的用户组/用户
}

interface RowPermission {
  tableId: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  values: string[];
  targetUsersAndGroups: string[]; // 应用此权限的用户组/用户
}

const PermissionManagement: React.FC<PermissionManagementProps> = ({ onBackToChat }) => {
  const [selectedKnowledgeBaseDirectory, setSelectedKnowledgeBaseDirectory] = useState<string>('');
  const [assignPermissionModalVisible, setAssignPermissionModalVisible] = useState(false);
  const [selectedUsersAndGroups, setSelectedUsersAndGroups] = useState<string[]>([]);
  const [showRowColumnPermission, setShowRowColumnPermission] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>(''); // 当前选中的表
  const [columnPermissions, setColumnPermissions] = useState<ColumnPermission[]>([]); // 列级权限：每个字段关联的用户组/用户
  const [rowPermissions, setRowPermissions] = useState<RowPermission[]>([]); // 行级权限
  
  // 用户组管理相关状态
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
  const [manageUsersModalVisible, setManageUsersModalVisible] = useState(false);
  const [currentEditingGroup, setCurrentEditingGroup] = useState<UserGroup | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // 提取所有知识库目录（包括知识库下的目录）
  const getAllDirectories = useMemo(() => {
    const directories: Array<{ id: string; name: string; fullPath: string; kbName: string }> = [];
    
    const extractDirectories = (nodes: KnowledgeBaseNode[], kbName: string, parentPath: string = '') => {
      nodes.forEach(node => {
        if (node.type === 'directory') {
          const fullPath = parentPath ? `${parentPath} / ${node.name}` : `${kbName} / ${node.name}`;
          directories.push({
            id: node.id,
            name: node.name,
            fullPath,
            kbName
          });
          if (node.children) {
            extractDirectories(node.children, kbName, fullPath);
          }
        }
      });
    };

    mockKnowledgeBases.forEach(kb => {
      if (kb.children) {
        extractDirectories(kb.children, kb.name);
      }
    });

    return directories;
  }, []);

  // Mock所有用户数据（用于添加到用户组）
  const allUsers: User[] = [
    { id: 'user1', name: '张三' },
    { id: 'user2', name: '李四' },
    { id: 'user3', name: '王五' },
    { id: 'user4', name: '赵六' },
    { id: 'user5', name: '孙七' },
    { id: 'user6', name: '周八' },
    { id: 'user7', name: '吴九' }
  ];

  // 初始化用户组数据
  useEffect(() => {
    setUserGroups([
      {
        id: 'group1',
        name: '管理层',
        users: [
          { id: 'user1', name: '张三' }
        ]
      },
      {
        id: 'group2',
        name: 'IT部',
        users: [
          { id: 'user2', name: '李四' }
        ]
      },
      {
        id: 'group3',
        name: '财务部',
        users: [
          { id: 'user3', name: '王五' },
          { id: 'user5', name: '孙七' }
        ]
      },
      {
        id: 'group4',
        name: '产品部',
        users: [
          { id: 'user4', name: '赵六' }
        ]
      }
    ]);
  }, []);

  // Mock用户组和用户数据（用于权限分配等）
  const mockUserGroups: UserGroup[] = userGroups;

  // 财务信息表字段
  const financialTableFields: TableField[] = [
    { id: 'date', name: '日期', type: 'date', visible: true },
    { id: 'sales', name: '销售额', type: 'number', visible: true },
    { id: 'cost', name: '成本', type: 'number', visible: true },
    { id: 'profit', name: '利润', type: 'number', visible: true },
    { id: 'region', name: '销售区域', type: 'string', visible: true },
    { id: 'product', name: '产品类别', type: 'string', visible: true },
    { id: 'customer', name: '客户名称', type: 'string', visible: true },
    { id: 'orderNo', name: '订单号', type: 'string', visible: true },
    { id: 'salesperson', name: '销售人员', type: 'string', visible: true },
    { id: 'payment', name: '付款方式', type: 'string', visible: true }
  ];

  // Mock表数据
  const mockTables: TableInfo[] = [
    {
      id: 'table1',
      name: '营收明细表',
      fields: financialTableFields
    },
    {
      id: 'table2',
      name: '成本明细表',
      fields: [
        { id: 'date', name: '日期', type: 'date', visible: true },
        { id: 'costType', name: '成本类型', type: 'string', visible: true },
        { id: 'amount', name: '金额', type: 'number', visible: true },
        { id: 'department', name: '部门', type: 'string', visible: true },
        { id: 'project', name: '项目', type: 'string', visible: true }
      ]
    },
    {
      id: 'table3',
      name: '客户信息表',
      fields: [
        { id: 'customerName', name: '客户名称', type: 'string', visible: true },
        { id: 'contact', name: '联系人', type: 'string', visible: true },
        { id: 'phone', name: '电话', type: 'string', visible: true },
        { id: 'address', name: '地址', type: 'string', visible: true },
        { id: 'credit', name: '信用额度', type: 'number', visible: true }
      ]
    }
  ];


  // 构建用户组/用户树数据（用于权限分配模态框）
  const userTreeData = useMemo(() => {
    return userGroups.map(group => ({
      title: group.name,
      key: `group-${group.id}`,
      children: group.users?.map(user => ({
        title: user.name,
        key: `user-${user.id}`
      }))
    }));
  }, [userGroups]);

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap: Record<string, { color: string; text: string }> = {
          admin: { color: 'red', text: '系统管理员' },
          agentAdmin: { color: 'blue', text: '智能体管理员' },
          user: { color: 'default', text: '普通用户' }
        };
        const r = roleMap[role] || { color: 'default', text: role };
        return <Tag color={r.color}>{r.text}</Tag>;
      }
    },
    {
      title: '用户组',
      dataIndex: 'group',
      key: 'group'
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

  const mockUsers = [
    { id: '1', name: '张三', role: 'admin', group: '管理层' },
    { id: '2', name: '李四', role: 'agentAdmin', group: 'IT部' },
    { id: '3', name: '王五', role: 'user', group: '财务部' },
    { id: '4', name: '赵六', role: 'user', group: '产品部' }
  ];

  // 处理编辑用户组名称
  const handleEditGroupName = (group: UserGroup) => {
    setCurrentEditingGroup(group);
    setEditingGroupName(group.name);
    setEditGroupModalVisible(true);
  };

  // 保存用户组名称
  const handleSaveGroupName = () => {
    if (!editingGroupName.trim()) {
      message.warning('用户组名称不能为空');
      return;
    }
    if (currentEditingGroup) {
      setUserGroups(userGroups.map(group => 
        group.id === currentEditingGroup.id 
          ? { ...group, name: editingGroupName.trim() }
          : group
      ));
      message.success('用户组名称已更新');
      setEditGroupModalVisible(false);
      setCurrentEditingGroup(null);
      setEditingGroupName('');
    }
  };

  // 处理管理用户组用户
  const handleManageUsers = (group: UserGroup) => {
    setCurrentEditingGroup(group);
    setSelectedUserIds(group.users?.map(u => u.id) || []);
    setManageUsersModalVisible(true);
  };

  // 保存用户组用户
  const handleSaveGroupUsers = () => {
    if (!currentEditingGroup) return;
    
    const selectedUsers = allUsers.filter(u => selectedUserIds.includes(u.id));
    setUserGroups(userGroups.map(group => 
      group.id === currentEditingGroup.id 
        ? { ...group, users: selectedUsers }
        : group
    ));
    message.success('用户组成员已更新');
    setManageUsersModalVisible(false);
    setCurrentEditingGroup(null);
    setSelectedUserIds([]);
  };

  // 处理删除用户组
  const handleDeleteGroup = (groupId: string) => {
    setUserGroups(userGroups.filter(group => group.id !== groupId));
    message.success('用户组已删除');
  };

  // 处理新建用户组
  const handleCreateGroup = () => {
    const newGroup: UserGroup = {
      id: `group${Date.now()}`,
      name: '新用户组',
      users: []
    };
    setUserGroups([...userGroups, newGroup]);
    setCurrentEditingGroup(newGroup);
    setEditingGroupName('新用户组');
    setEditGroupModalVisible(true);
  };

  // 用户组列表表格列定义
  const groupColumns = [
    {
      title: '用户组名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '成员',
      key: 'users',
      render: (_: any, record: UserGroup) => (
        <div>
          {record.users && record.users.length > 0 ? (
            <Space wrap>
              {record.users.map(user => (
                <Tag key={user.id}>{user.name}</Tag>
              ))}
            </Space>
          ) : (
            <span style={{ color: '#999' }}>暂无成员</span>
          )}
        </div>
      )
    },
    {
      title: '成员数量',
      key: 'userCount',
      width: 100,
      render: (_: any, record: UserGroup) => record.users?.length || 0
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: UserGroup) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEditGroupName(record)}
          >
            编辑名称
          </Button>
          <Button 
            type="link" 
            icon={<UserAddOutlined />}
            onClick={() => handleManageUsers(record)}
          >
            管理用户
          </Button>
          <Popconfirm
            title="确定要删除这个用户组吗？"
            onConfirm={() => handleDeleteGroup(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleAssignPermission = () => {
    if (!selectedKnowledgeBaseDirectory) {
      message.warning('请先选择知识库目录');
      return;
    }
    setAssignPermissionModalVisible(true);
    // 如果是营收相关知识库（kb1-dir2），显示行列级权限设置
    if (selectedKnowledgeBaseDirectory === 'kb1-dir2') {
      setShowRowColumnPermission(true);
      // 初始化：默认选择第一个表
      if (mockTables.length > 0) {
        setSelectedTableId(mockTables[0].id);
      }
      setColumnPermissions([]);
      setRowPermissions([]);
    } else {
      setShowRowColumnPermission(false);
      setSelectedTableId('');
    }
  };

  const handleSavePermission = () => {
    if (selectedUsersAndGroups.length === 0) {
      message.warning('请至少选择一个用户组或用户');
      return;
    }
    message.success('权限分配成功');
    setAssignPermissionModalVisible(false);
    setSelectedUsersAndGroups([]);
    setColumnPermissions([]);
    setRowPermissions([]);
    setSelectedTableId('');
  };

  const handleAddRowPermission = () => {
    if (!selectedTableId) {
      message.warning('请先选择要配置的表');
      return;
    }
    const currentTable = mockTables.find(t => t.id === selectedTableId);
    const defaultField = currentTable?.fields.find(f => f.type === 'string')?.id || 
                         (currentTable?.fields[0]?.id || '');
    
    setRowPermissions([
      ...rowPermissions,
      { 
        tableId: selectedTableId,
        field: defaultField, 
        operator: 'not_in', 
        values: [], 
        targetUsersAndGroups: [] 
      }
    ]);
  };

  // 获取已选中的用户组/用户列表（用于行列级权限选择）
  const getSelectedUsersAndGroupsList = (): Array<{ key: string; label: string; type: 'group' | 'user' }> => {
    const result: Array<{ key: string; label: string; type: 'group' | 'user' }> = [];
    
    selectedUsersAndGroups.forEach(key => {
      if (key.startsWith('group-')) {
        const groupId = key.replace('group-', '');
        const group = mockUserGroups.find(g => g.id === groupId);
        if (group) {
          result.push({ key, label: group.name, type: 'group' });
        }
      } else if (key.startsWith('user-')) {
        const userId = key.replace('user-', '');
        // 查找用户
        for (const group of mockUserGroups) {
          const user = group.users?.find(u => u.id === userId);
          if (user) {
            result.push({ key, label: `${user.name} (${group.name})`, type: 'user' });
            break;
          }
        }
      }
    });
    
    return result;
  };

  const handleRemoveRowPermission = (index: number) => {
    setRowPermissions(rowPermissions.filter((_, i) => i !== index));
  };

  const isRevenueKnowledgeBase = selectedKnowledgeBaseDirectory === 'kb1-dir2';
  
  // 获取选中的目录信息
  const selectedDirectoryInfo = useMemo(() => {
    return getAllDirectories.find(dir => dir.id === selectedKnowledgeBaseDirectory);
  }, [selectedKnowledgeBaseDirectory, getAllDirectories]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0 }}>权限管理</h2>
        <Button onClick={onBackToChat}>返回系统对话</Button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <Tabs
          items={[
            {
              key: 'users',
              label: '用户管理',
              children: (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <Button type="primary">新建用户</Button>
                  </div>
                  <Table
                    columns={userColumns}
                    dataSource={mockUsers}
                    rowKey="id"
                    pagination={false}
                  />
                </div>
              )
            },
            {
              key: 'groups',
              label: '用户组管理',
              children: (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <Button type="primary" onClick={handleCreateGroup}>新建用户组</Button>
                  </div>
                  <Table
                    columns={groupColumns}
                    dataSource={userGroups}
                    rowKey="id"
                    pagination={false}
                  />
                </div>
              )
            },
            {
              key: 'permissions',
              label: '知识库权限',
              children: (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <Space>
                      <Select 
                        placeholder="选择知识库目录" 
                        style={{ width: 300 }}
                        value={selectedKnowledgeBaseDirectory}
                        onChange={setSelectedKnowledgeBaseDirectory}
                        showSearch
                        filterOption={(input, option) => {
                          const label = option?.label;
                          if (typeof label === 'string') {
                            return label.toLowerCase().includes(input.toLowerCase());
                          }
                          return false;
                        }}
                      >
                        {getAllDirectories.map(dir => (
                          <Select.Option key={dir.id} value={dir.id} label={dir.fullPath}>
                            {dir.fullPath}
                          </Select.Option>
                        ))}
                      </Select>
                      <Button 
                        type="primary"
                        onClick={handleAssignPermission}
                        disabled={!selectedKnowledgeBaseDirectory}
                      >
                        分配权限
                      </Button>
                    </Space>
                  </div>
                  {selectedDirectoryInfo && (
                    <div style={{ 
                      marginBottom: '16px', 
                      padding: '12px', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>已选择：{selectedDirectoryInfo.fullPath}</div>
                      {isRevenueKnowledgeBase && (
                        <div style={{ color: '#1890ff' }}>
                          该目录包含结构化数据，可配置行列级权限
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ color: '#999', fontSize: '14px' }}>
                    选择知识库目录后，可以为用户组/用户分配权限，支持行列级权限控制。
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>

      {/* 分配权限模态框 */}
      <Modal
        title="分配权限"
        open={assignPermissionModalVisible}
        onOk={handleSavePermission}
        onCancel={() => {
          setAssignPermissionModalVisible(false);
          setSelectedUsersAndGroups([]);
          setColumnPermissions([]);
          setRowPermissions([]);
          setShowRowColumnPermission(false);
          setSelectedTableId('');
        }}
        width={900}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>选择用户组/用户：</div>
          <div style={{ 
            border: '1px solid #e8e8e8', 
            borderRadius: '4px', 
            padding: '12px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            <Tree
              checkable
              treeData={userTreeData}
              checkedKeys={selectedUsersAndGroups}
              onCheck={(checkedKeys) => {
                setSelectedUsersAndGroups(checkedKeys as string[]);
              }}
              defaultExpandAll
            />
          </div>
        </div>

        {/* 行列级权限设置（仅营收相关知识库显示） */}
        {isRevenueKnowledgeBase && showRowColumnPermission && selectedUsersAndGroups.length > 0 && (
          <>
            <Divider />
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
                （可选）行列级权限设置
              </div>
              
              {/* 表选择 */}
              <Card 
                title="选择表" 
                size="small"
                style={{ marginBottom: '16px' }}
              >
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  选择需要设置行列级权限的表：
                </div>
                <Select
                  placeholder="请选择表"
                  value={selectedTableId}
                  onChange={(value) => {
                    setSelectedTableId(value);
                    // 切换表时清空该表的权限配置（可选，也可以保留）
                    // setColumnPermissions([]);
                    // setRowPermissions([]);
                  }}
                  style={{ width: '100%' }}
                >
                  {mockTables.map(table => (
                    <Select.Option key={table.id} value={table.id}>
                      {table.name}
                    </Select.Option>
                  ))}
                </Select>
              </Card>

              {/* 列级权限和行级权限（基于当前选中的表） */}
              {selectedTableId && (
                <>
                  {/* 列级权限 */}
              <Card 
                title="列级权限 - 控制字段可见性" 
                size="small"
                style={{ marginBottom: '16px' }}
              >
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  为每个字段设置不可见的用户组/用户：
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(() => {
                    const currentTable = mockTables.find(t => t.id === selectedTableId);
                    if (!currentTable) return null;
                    
                    return currentTable.fields.map(field => {
                      const columnPermission = columnPermissions.find(
                        cp => cp.tableId === selectedTableId && cp.fieldId === field.id
                      ) || {
                        tableId: selectedTableId,
                        fieldId: field.id,
                        visibleUsersAndGroups: []
                      };
                    
                    return (
                      <div 
                        key={field.id}
                        style={{ 
                          padding: '12px', 
                          border: '1px solid #e8e8e8', 
                          borderRadius: '4px',
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold' }}>{field.name}</span>
                            <Tag style={{ fontSize: '11px' }}>
                              {field.type === 'date' ? '日期' : field.type === 'number' ? '数值' : '文本'}
                            </Tag>
                          </div>
                        </div>
                        <Select
                          mode="multiple"
                          placeholder="选择用户组/用户"
                          value={columnPermission.visibleUsersAndGroups}
                          onChange={(values) => {
                            const updated = [...columnPermissions];
                            const index = updated.findIndex(
                              cp => cp.tableId === selectedTableId && cp.fieldId === field.id
                            );
                            if (index >= 0) {
                              updated[index].visibleUsersAndGroups = values;
                            } else {
                              updated.push({
                                tableId: selectedTableId,
                                fieldId: field.id,
                                visibleUsersAndGroups: values
                              });
                            }
                            setColumnPermissions(updated);
                          }}
                          style={{ width: '100%' }}
                          size="small"
                        >
                          {getSelectedUsersAndGroupsList().map(item => (
                            <Select.Option key={item.key} value={item.key}>
                              {item.type === 'group' ? '👥 ' : '👤 '}{item.label}
                            </Select.Option>
                          ))}
                        </Select>
                        
                      </div>
                    );
                  });
                  })()}
                </div>
              </Card>
              </>
              )}

              {/* 行级权限 */}
              <Card 
                title="行级权限 - 控制数据行可见性" 
                size="small"
              >
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                为用户组/用户设置数据过滤条件，符合条件的行将不可见：
                </div>
                {(() => {
                  const currentTablePermissions = rowPermissions.filter(
                    p => p.tableId === selectedTableId
                  );
                  
                  if (currentTablePermissions.length === 0) {
                    return (
                      <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: '#999',
                        border: '1px dashed #e8e8e8',
                        borderRadius: '4px'
                      }}>
                        暂无行级权限设置
                      </div>
                    );
                  }
                  
                  const currentTable = mockTables.find(t => t.id === selectedTableId);
                  if (!currentTable) return null;
                  
                  return (
                    <div style={{ marginBottom: '12px' }}>
                      {currentTablePermissions.map((permission, index) => {
                        const globalIndex = rowPermissions.findIndex(
                          p => p.tableId === permission.tableId && 
                               p.field === permission.field &&
                               p.operator === permission.operator
                        );
                        return (
                      <div 
                        key={index}
                        style={{ 
                          padding: '12px', 
                          border: '1px solid #e8e8e8', 
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <Select
                            value={permission.field}
                            onChange={(value) => {
                              const updated = [...rowPermissions];
                              updated[index].field = value;
                              setRowPermissions(updated);
                            }}
                            style={{ width: '150px' }}
                          >
                            <Select.Option value="region">销售区域</Select.Option>
                            <Select.Option value="product">产品类别</Select.Option>
                            <Select.Option value="customer">客户名称</Select.Option>
                            <Select.Option value="salesperson">销售人员</Select.Option>
                          </Select>
                          <Select
                            value={permission.operator}
                            onChange={(value) => {
                              const updated = [...rowPermissions];
                              updated[globalIndex].operator = value;
                              setRowPermissions(updated);
                            }}
                            style={{ width: '120px' }}
                          >
                            <Select.Option value="equals">等于</Select.Option>
                            <Select.Option value="not_equals">不等于</Select.Option>
                            <Select.Option value="in">包含</Select.Option>
                            <Select.Option value="not_in">不包含</Select.Option>
                          </Select>
                          <Select
                            mode="multiple"
                            value={permission.values}
                            onChange={(values) => {
                              const updated = [...rowPermissions];
                              updated[globalIndex].values = values;
                              setRowPermissions(updated);
                            }}
                            style={{ flex: 1 }}
                            placeholder="选择值"
                          >
                            {/* 根据字段类型显示不同的选项 */}
                            {(() => {
                              const field = currentTable.fields.find(f => f.id === permission.field);
                              if (!field) return null;
                              
                              // 这里可以根据实际需求添加更多选项
                              // 目前使用简单的mock数据
                              if (field.type === 'string') {
                                return ['选项1', '选项2', '选项3'].map(opt => (
                                  <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                                ));
                              } else if (field.type === 'number') {
                                return ['100', '200', '300'].map(opt => (
                                  <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                                ));
                              }
                              return null;
                            })()}
                          </Select>
                          <Button
                            type="link"
                            danger
                            onClick={() => handleRemoveRowPermission(globalIndex)}
                          >
                            删除
                          </Button>
                        </div>
                        {/* 为每个行级权限条件选择应用的用户组/用户 */}
                        <div style={{ 
                          marginTop: '8px', 
                          padding: '8px', 
                          backgroundColor: '#fafafa', 
                          borderRadius: '4px'
                        }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                            应用此条件到：
                          </div>
                          <Select
                            mode="multiple"
                            placeholder="选择用户组/用户"
                            value={permission.targetUsersAndGroups}
                            onChange={(values) => {
                              const updated = [...rowPermissions];
                              updated[globalIndex].targetUsersAndGroups = values;
                              setRowPermissions(updated);
                            }}
                            style={{ width: '100%' }}
                            size="small"
                          >
                            {getSelectedUsersAndGroupsList().map(item => (
                              <Select.Option key={item.key} value={item.key}>
                                {item.type === 'group' ? '👥 ' : '👤 '}{item.label}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <Button 
                  type="dashed" 
                  onClick={handleAddRowPermission}
                  style={{ width: '100%' }}
                >
                  + 添加行级权限条件
                </Button>
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <div>示例：</div>
                  <div>• 销售区域 不包含 [南区, 北区] - 表示不能查看南区和北区的数据</div>
                  <div>• 产品类别 等于 [产品A] - 表示只能查看产品A的数据</div>
                </div>
              </Card>
            </div>
          </>
        )}
      </Modal>

      {/* 编辑用户组名称模态框 */}
      <Modal
        title="编辑用户组名称"
        open={editGroupModalVisible}
        onOk={handleSaveGroupName}
        onCancel={() => {
          setEditGroupModalVisible(false);
          setCurrentEditingGroup(null);
          setEditingGroupName('');
        }}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>用户组名称：</label>
          <Input
            value={editingGroupName}
            onChange={(e) => setEditingGroupName(e.target.value)}
            placeholder="请输入用户组名称"
            onPressEnter={handleSaveGroupName}
          />
        </div>
      </Modal>

      {/* 管理用户组用户模态框 */}
      <Modal
        title={`管理用户组成员 - ${currentEditingGroup?.name || ''}`}
        open={manageUsersModalVisible}
        onOk={handleSaveGroupUsers}
        onCancel={() => {
          setManageUsersModalVisible(false);
          setCurrentEditingGroup(null);
          setSelectedUserIds([]);
        }}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>选择用户：</label>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="请选择要添加到用户组的用户"
            value={selectedUserIds}
            onChange={setSelectedUserIds}
            showSearch
            filterOption={(input, option) => {
              const user = allUsers.find(u => u.id === option?.value);
              return user?.name.toLowerCase().includes(input.toLowerCase()) || false;
            }}
          >
            {allUsers.map(user => (
              <Select.Option key={user.id} value={user.id}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        {selectedUserIds.length > 0 && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px' 
          }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>已选用户：</div>
            <Space wrap>
              {selectedUserIds.map(userId => {
                const user = allUsers.find(u => u.id === userId);
                return user ? <Tag key={userId}>{user.name}</Tag> : null;
              })}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PermissionManagement;
