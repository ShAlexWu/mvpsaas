import React from 'react';
import { Table, DatePicker, Select, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { mockLogs } from '../../mock/data';

interface LogsProps {
  onBackToChat: () => void;
}

const Logs: React.FC<LogsProps> = ({ onBackToChat }) => {
  const columns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 180
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 120
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 150
    },
    {
      title: '操作对象',
      dataIndex: 'target',
      key: 'target'
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
        <h2 style={{ margin: 0 }}>操作日志</h2>
        <Button onClick={onBackToChat}>返回对话</Button>
      </div>
      <div style={{ padding: '16px', borderBottom: '1px solid #e8e8e8' }}>
        <Space>
          <DatePicker.RangePicker />
          <Select placeholder="选择用户组" style={{ width: 150 }} allowClear>
            <Select.Option value="group1">管理层</Select.Option>
            <Select.Option value="group2">IT部</Select.Option>
            <Select.Option value="group3">财务部</Select.Option>
          </Select>
          <Select placeholder="选择用户" style={{ width: 150 }} allowClear>
            <Select.Option value="user1">张三</Select.Option>
            <Select.Option value="user2">李四</Select.Option>
            <Select.Option value="user3">王五</Select.Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />}>查询</Button>
        </Space>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <Table
          columns={columns}
          dataSource={mockLogs}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </div>
    </div>
  );
};

export default Logs;

