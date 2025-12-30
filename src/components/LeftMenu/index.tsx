import React from 'react';
import { Menu } from 'antd';
import {
  DatabaseOutlined,
  RobotOutlined,
  SearchOutlined,
  SafetyOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { MenuKey } from '../../types';

interface LeftMenuProps {
  currentMenu: MenuKey | null;
  onMenuClick: (key: MenuKey) => void;
}

const LeftMenu: React.FC<LeftMenuProps> = ({ currentMenu, onMenuClick }) => {
  const menuItems = [
    {
      key: 'data-management',
      icon: <DatabaseOutlined />,
      label: '数据管理'
    },
    {
      key: 'agent-management',
      icon: <RobotOutlined />,
      label: '智能体管理'
    },
    {
      key: 'data-exploration',
      icon: <SearchOutlined />,
      label: '数据探索'
    },
    {
      key: 'permission-management',
      icon: <SafetyOutlined />,
      label: '权限管理'
    },
    {
      key: 'logs',
      icon: <FileTextOutlined />,
      label: '日志'
    }
  ];

  return (
    <div style={{ height: '100%', backgroundColor: '#001529' }}>
      <div style={{ 
        padding: '16px', 
        color: '#fff', 
        fontSize: '18px', 
        fontWeight: 'bold',
        borderBottom: '1px solid #1f1f1f'
      }}>
        AI 数据探索平台
      </div>
      <Menu
        mode="inline"
        selectedKeys={currentMenu ? [currentMenu] : []}
        style={{ 
          height: 'calc(100% - 65px)', 
          borderRight: 0,
          backgroundColor: '#001529',
          color: '#fff'
        }}
        theme="dark"
        items={menuItems}
        onClick={({ key }) => onMenuClick(key as MenuKey)}
      />
    </div>
  );
};

export default LeftMenu;




