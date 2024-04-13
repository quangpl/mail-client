import React, { useEffect, useState } from 'react';
import { HomeOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import { Col, MenuProps, Popover, Row, Tag } from 'antd';
import {
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
import { getAuth, getMails, sendMail } from './core';
import { useHistory } from 'react-router';
import * as XLSX from 'xlsx';
import MailIcon from './mail.png';
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
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [toValue, setTovalue] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState({} as any);
  const [html, setHtml] = useState('');
  const [form] = Form.useForm(); // Create a form instance

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const fetchMails = async () => {
    setLoading(true);
    try {
      const res = await getMails();
      setEmails(res);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    (async () => {
      const auth = await getAuth();
      if (!auth) {
        navigate.push('/login');
      }
      setUser(auth);
      await fetchMails();
    })();
  }, []);

  const handleFileRead = async (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        resolve(event.target?.result);
      };
      reader.readAsText(file);
    });
  };

  const columns = [
    {
      title: 'To',
      dataIndex: 'to',
      key: 'to',
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
    },
    {
      title: 'Sender',
      dataIndex: 'sender',
      key: 'sender',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      render: (col: any, val: number) => {
        return <span>{new Date(col).toLocaleString()}</span>;
      },
    },
  ];
  const onFinish = async (values: any) => {
    try {
      setSending(true);
      values.to_files = undefined;
      const res = {
        ...values,
        files: values.files?.fileList?.map((file: any) => file.originFileObj),
        html,
      };
      if (toValue?.length) {
        res.to = toValue.split(',\n');
      }
      await sendMail(res);
      await fetchMails();
      form?.resetFields();
      setShowEmail(false);
    } finally {
      setSending(false);
    }
  };
  const handleUpload = (file: any) => {
    var reader = new FileReader();
    reader.onload = function (e: any) {
      var data = e.target.result;
      let readedData = XLSX.read(data, { type: 'binary' });
      const wsname = readedData.SheetNames[0];
      const ws = readedData.Sheets[wsname];
      const dataParse = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const values = dataParse.map((row: any) => {
        return row[0];
      });
      setTovalue(values.join(',\n'));
    };
    reader.readAsBinaryString(file);
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Modal
        title='Send new email'
        width={'70%'}
        footer={null}
        open={showEmail}
        onCancel={() => {
          setShowEmail(false);
        }}
      >
        <Form
          form={form}
          name='emailForm'
          labelCol={{
            span: 24,
          }}
          wrapperCol={{
            span: 24,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name='to'
            label='To'
            rules={[
              {
                message: 'Please input recipient email!',
              },
            ]}
          >
            <Row gutter={[10, 10]} align={'middle'}>
              <Col span={22}>
                <TextArea
                  value={toValue}
                  onChange={(e) => {
                    setTovalue(e.target.value);
                  }}
                  allowClear
                  rows={10}
                />
              </Col>
              <Col span={1}>
                <Upload
                  onRemove={() => {
                    setTovalue('');
                  }}
                  multiple={false}
                  onChange={(e) => {
                    handleUpload(e.file.originFileObj);
                  }}
                >
                  <Button icon={<UploadOutlined />}></Button>
                </Upload>
              </Col>
            </Row>
          </Form.Item>
          {/* <Form.Item
            name='to_files'
            label='To(Files)'
            rules={[
              {
                required: false,
              },
            ]}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                alignContent: 'center',
                flexDirection: 'row',
                marginTop: 20,
              }}
            >
              <input type='file' onChange={handleUpload}></input>
              {toValue?.length ? (
                <Button
                  onClick={() => {
                    setTovalue([]);
                  }}
                >
                  Remove file
                </Button>
              ) : (
                ''
              )}
            </div>
          </Form.Item> */}
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
          {/* <Form.Item
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
          </Form.Item> */}
          <Form.Item name='text' label='Text'>
            <TextArea rows={4} allowClear />
          </Form.Item>
          <Form.Item
            name='html'
            label='HTML'
            valuePropName='fileList'
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Row gutter={[10, 10]} align={'middle'}>
              <Col span={22}>
                {' '}
                <TextArea
                  allowClear
                  value={html}
                  rows={9}
                  onChange={(e) => {
                    setHtml(e.target.value);
                  }}
                />
              </Col>
              <Col span={1}>
                {' '}
                <Upload
                  onRemove={() => {
                    setHtml('');
                  }}
                  multiple={false}
                  onChange={async (e) => {
                    const res: any = await handleFileRead(e.file.originFileObj);
                    setHtml(res);
                  }}
                >
                  <Button icon={<UploadOutlined />}></Button>
                </Upload>
              </Col>
            </Row>
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
            <Button loading={sending} type='primary' htmlType='submit'>
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
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignContent: 'center',
          }}
        >
          <img src={MailIcon} style={{ width: 40, height: 40, margin: 10 }} />
          <Popover
            content={
              <Button
                onClick={() => {
                  localStorage.clear();
                  navigate.push('/login');
                }}
              >
                Logout
              </Button>
            }
          >
            <b
              style={{
                margin: 10,
              }}
            >
              {' '}
              {user.username ? user.username : ''}
            </b>
          </Popover>
        </Header>
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
            <Table
              loading={loading}
              dataSource={emails}
              columns={columns as any}
            />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          XMailSystem ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};
