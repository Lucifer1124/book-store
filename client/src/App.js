import React, { useState } from 'react';
import { DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import { Button, message, Upload, Input, Row, Col } from 'antd';
import './App.css'
import Header from './component/Header.js';

const { Dragger } = Upload;

const App = () => {
  const [files, setFiles] = useState([]);
  const [authorName, setAuthorName] = useState('');
  const [bookName, setBookName] = useState('');

  const handleChange = ({ fileList }) => {
    setFiles(fileList.map(file => file.originFileObj));
  };

  const uploadProps = {
    onChange: handleChange,
    multiple: false,
    beforeUpload: () => false,
    showUploadList: false,
  };

  const handleClick = async () => {
    if (files.length === 0 || !authorName || !bookName) {
      message.error('Please fill all fields and select at least one file.');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file)); //append all the daata
    formData.append('authorName', authorName);
    formData.append('bookName', bookName);

    try {
      const response = await fetch('http://localhost:9050/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message);
        console.log('Uploaded file details:', data.files);
      } else {
        message.error(data.message || 'Upload failed');
      }
    } catch (error) {
      message.error('Upload failed');
      console.error('Upload error:', error);
    }
  };

  console.log('file', files)
  return (
    <>
      <Header />
      <div className='padding-20'>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <label>Author Name</label>
            <Input
              placeholder="Author Name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              style={{ marginTop: '10px' }}
            />
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <label>Book Name</label>
            <Input
              placeholder="Book Name"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              style={{ marginTop: '10px' }}
            />
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag files to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for multiple uploads. Strictly prohibited from uploading
                company data or other banned files.
              </p>
            </Dragger>
            {/* {files.length > 0 && <div className='padding-top-20'>
            <span>{files[0].name}</span>
          </div>} */}
          </Col>
          {files.length > 0 && <Col xs={24} sm={24} md={24} lg={24} >
            <Row className='padding-20 box-shadow'>
              <Col xs={22} sm={22} md={22} lg={22}>
                <span>{files[0].name}</span>
              </Col>
              <Col xs={2} sm={2} md={2} lg={2} className='text-right cursor-pointer'>
                <DeleteOutlined onClick={() => setFiles([])} />
              </Col>

            </Row>

          </Col>}
          <Col xs={24} sm={24} md={24} lg={24}>
            <Button type="primary" onClick={handleClick}>
              Upload
            </Button>
          </Col>

        </Row>



        {/* <Input
        placeholder="Book Name"
        value={bookName}
        onChange={(e) => setBookName(e.target.value)}
        style={{ marginTop: '10px' }} />

      <div style={{ paddingTop: '10px' }}> */}

      </div>
    </>
  );
};

export default App;
