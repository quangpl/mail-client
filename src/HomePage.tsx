import React, { useEffect, useState } from 'react';
import { HomeOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import { Alert, Col, MenuProps, Popover, Progress, Row, Spin, Tag } from 'antd';
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
import { useInterval } from 'usehooks-ts';
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
  useInterval(() => {
    const inProgress = emails.find(
      (email: any) => email.progress < 100 && !email.error
    );
    if (inProgress) {
      console.log('reload');
      fetchMails();
    }
  }, 1000);
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
    return new Promise((resolve) => {
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
      render: (val: string[]) => {
        return (
          <Popover content={<span> {val.join(',')}</span>}>
            <Tag color='blue'>{val.length} email</Tag>
          </Popover>
        );
      },
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (val: number, col: any) => {
        return (
          <div>
            <Progress
              size={'small'}
              status={
                col.progress === 100 && !!col.error
                  ? 'exception'
                  : col.progress === 100 && !col.error
                  ? 'success'
                  : 'active'
              }
              showInfo
              type='circle'
              percent={val}
            />
          </div>
        );
      },
    },
    {
      title: 'Message',
      dataIndex: 'error',
      key: 'error',
      render: (val: string) => {
        return val ? (
          <Alert message={val} type='error' />
        ) : (
          <Alert message={'Sending'} type='info' />
        );
      },
    },
    {
      title: 'Time',
      dataIndex: 'time',
      render: (col: any) => {
        return <span>{new Date(col).toLocaleString()}</span>;
      },
    },
  ];
  const onFinish = async (values: any) => {
    try {
      setSending(true);
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
          {/* <Form.Item
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
          </Form.Item> */}

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
                  accept='.html'
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
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
            <div>{loading && <Spin />}</div>
          </div>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Table dataSource={emails} columns={columns as any} />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          XMailSystem ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};
