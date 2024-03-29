import React, { useEffect, useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  MailOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Table,
  Upload,
  theme,
} from 'antd';
import { getAuth, sendMail } from './core';
import { useHistory } from 'react-router';

const { Header, Content, Footer, Sider } = Layout;
const { TextArea } = Input;
const { Dragger } = Upload;
type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [getItem('Home', 'home', <HomeOutlined />)];

export const HomePage: React.FC = () => {
  const navigate = useHistory();
  const [showEmail, setShowEmail] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    (async () => {
      const auth = await getAuth();
      if (!auth) {
        navigate.push('/');
      }
    })();
  }, []);
  const dataSource = [
    {
      key: '1',
      name: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      name: 'John',
      age: 42,
      address: '10 Downing Street',
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ];
  const onFinish = (values: any) => {
    const res = {
      ...values,
      files: values.files.fileList?.map((file: any) => file.originFileObj),
    };
    console.log(values);
    console.log(res);
    // console.log(res);
    sendMail(res);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Modal
        open={showEmail}
        onCancel={() => {
          setShowEmail(false);
        }}
      >
        <Form
          name='emailForm'
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 23,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name='to'
            label='To'
            rules={[
              {
                required: true,
                message: 'Please input recipient email!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='from'
            label='From'
            rules={[
              {
                required: true,
                message: 'Please input sender email!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='subject'
            label='Subject'
            rules={[
              {
                required: true,
                message: 'Please input subject!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name='sender'
            label='Sender'
            rules={[
              {
                required: true,
                message: 'Please input sender name!',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name='text' label='Text'>
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item name='files' label='Files'>
            <Dragger name='files' multiple={true}>
              <p className='ant-upload-text'>
                Click or drag file to this area to upload
              </p>
            </Dragger>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              offset: 4,
              span: 14,
            }}
          >
            <Button type='primary' htmlType='submit'>
              Send
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className='demo-logo-vertical' />
        <Menu
          theme='dark'
          defaultSelectedKeys={['1']}
          mode='inline'
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
          <Button
            style={{
              margin: 15,
            }}
            onClick={() => {
              setShowEmail(true);
            }}
            icon={<MailOutlined />}
          >
            New Email
          </Button>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Table dataSource={dataSource} columns={columns} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          XMailSystem ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};
