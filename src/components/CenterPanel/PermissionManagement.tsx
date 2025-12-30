import React, { useState, useMemo } from 'react';
import { Tabs, Table, Button, Space, Tag, Tree, Select, Modal, Checkbox, message, Card, Divider } from 'antd';
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

interface RowPermission {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  values: string[];
}

const PermissionManagement: React.FC<PermissionManagementProps> = ({ onBackToChat }) => {
  const [selectedKnowledgeBaseDirectory, setSelectedKnowledgeBaseDirectory] = useState<string>('');
  const [assignPermissionModalVisible, setAssignPermissionModalVisible] = useState(false);
  const [selectedUsersAndGroups, setSelectedUsersAndGroups] = useState<string[]>([]);
  const [showRowColumnPermission, setShowRowColumnPermission] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [rowPermissions, setRowPermissions] = useState<RowPermission[]>([]);

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

  // Mock用户组和用户数据
  const mockUserGroups: UserGroup[] = [
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
  ];

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

  // 销售区域选项
  const regionOptions = ['南区', '北区', '东区', '西区'];

  // 构建用户组/用户树数据
  const buildUserTreeData = (groups: UserGroup[]): any[] => {
    return groups.map(group => ({
      title: group.name,
      key: `group-${group.id}`,
      children: group.users?.map(user => ({
        title: user.name,
        key: `user-${user.id}`
      }))
    }));
  };

  const userTreeData = buildUserTreeData(mockUserGroups);

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
        { title: '王五', key: 'user3' }
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

  const handleAssignPermission = () => {
    if (!selectedKnowledgeBaseDirectory) {
      message.warning('请先选择知识库目录');
      return;
    }
    setAssignPermissionModalVisible(true);
    // 如果是营收相关知识库（kb1-dir2），显示行列级权限设置
    if (selectedKnowledgeBaseDirectory === 'kb1-dir2') {
      setShowRowColumnPermission(true);
      // 初始化字段选择（默认全选）
      setSelectedFields(financialTableFields.map(f => f.id));
    } else {
      setShowRowColumnPermission(false);
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
    setSelectedFields([]);
    setRowPermissions([]);
  };

  const handleAddRowPermission = () => {
    setRowPermissions([
      ...rowPermissions,
      { field: 'region', operator: 'not_in', values: [] }
    ]);
  };

  const handleRemoveRowPermission = (index: number) => {
    setRowPermissions(rowPermissions.filter((_, i) => i !== index));
  };

  const handleFieldVisibilityChange = (fieldId: string, visible: boolean) => {
    if (visible) {
      setSelectedFields([...selectedFields, fieldId]);
    } else {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    }
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
        <Button onClick={onBackToChat}>返回对话</Button>
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
                    <Button type="primary">新建用户组</Button>
                  </div>
                  <Tree
                    treeData={mockUserGroupsTree}
                    defaultExpandAll
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
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
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
          setSelectedFields([]);
          setRowPermissions([]);
          setShowRowColumnPermission(false);
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
        {isRevenueKnowledgeBase && showRowColumnPermission && (
          <>
            <Divider />
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
                行列级权限设置（营收信息表）
              </div>
              
              {/* 列级权限 */}
              <Card 
                title="列级权限 - 控制字段可见性" 
                size="small"
                style={{ marginBottom: '16px' }}
              >
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  选择用户可以查看的字段，未选中的字段将不可见：
                </div>
                <Checkbox.Group
                  value={selectedFields}
                  onChange={(values) => {
                    setSelectedFields(values as string[]);
                  }}
                  style={{ width: '100%' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {financialTableFields.map(field => (
                      <Checkbox key={field.id} value={field.id}>
                        <span>{field.name}</span>
                        <Tag style={{ marginLeft: '8px', fontSize: '11px' }}>
                          {field.type === 'date' ? '日期' : field.type === 'number' ? '数值' : '文本'}
                        </Tag>
                      </Checkbox>
                    ))}
                  </div>
                </Checkbox.Group>
              </Card>

              {/* 行级权限 */}
              <Card 
                title="行级权限 - 控制数据行可见性" 
                size="small"
              >
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  设置数据过滤条件，符合条件的行将不可见：
                </div>
                {rowPermissions.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#999',
                    border: '1px dashed #e8e8e8',
                    borderRadius: '4px'
                  }}>
                    暂无行级权限设置
                  </div>
                ) : (
                  <div style={{ marginBottom: '12px' }}>
                    {rowPermissions.map((permission, index) => (
                      <div 
                        key={index}
                        style={{ 
                          padding: '12px', 
                          border: '1px solid #e8e8e8', 
                          borderRadius: '4px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
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
                            updated[index].operator = value;
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
                            updated[index].values = values;
                            setRowPermissions(updated);
                          }}
                          style={{ flex: 1 }}
                          placeholder="选择值"
                        >
                          {permission.field === 'region' && regionOptions.map(region => (
                            <Select.Option key={region} value={region}>{region}</Select.Option>
                          ))}
                          {permission.field === 'product' && ['产品A', '产品B', '产品C'].map(product => (
                            <Select.Option key={product} value={product}>{product}</Select.Option>
                          ))}
                          {permission.field === 'customer' && ['客户1', '客户2', '客户3'].map(customer => (
                            <Select.Option key={customer} value={customer}>{customer}</Select.Option>
                          ))}
                          {permission.field === 'salesperson' && ['销售1', '销售2', '销售3'].map(salesperson => (
                            <Select.Option key={salesperson} value={salesperson}>{salesperson}</Select.Option>
                          ))}
                        </Select>
                        <Button
                          type="link"
                          danger
                          onClick={() => handleRemoveRowPermission(index)}
                        >
                          删除
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
    </div>
  );
};

export default PermissionManagement;
