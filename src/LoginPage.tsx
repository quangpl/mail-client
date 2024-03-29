import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { getAuth, login } from './core';
import { useHistory } from 'react-router';

export const LoginPage = () => {
  // State variables to hold the username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useHistory();
  useEffect(() => {
    (async () => {
      const auth = await getAuth();
      if (auth) {
        navigate.push('/');
      }
    })();
  }, []);
  // Function to handle form submission
  const handleSubmit = async (values: any) => {
    try {
      // You can add your authentication logic here
      console.log('Received values:', values);
      const token = await login(username, password);
      if (token) {
        console.log(token);
        localStorage.setItem('token', token);
        message.success('Login successful');
        navigate.push('/');
      } else {
        message.error('Login failed. Wrong username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '300px', margin: 'auto', marginTop: '100px' }}>
      <h2>Login to system</h2>
      <Form
        name='loginForm'
        initialValues={{ remember: true }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name='username'
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          name='password'
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>

        <Form.Item name='remember' valuePropName='checked'>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            loading={loading}
            type='primary'
            htmlType='submit'
            style={{ width: '100%' }}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
