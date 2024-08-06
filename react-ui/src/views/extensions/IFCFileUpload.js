import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { DropzoneComponent } from 'react-dropzone-component';
import { API_SERVER } from '../../config/constant';
import axios from 'axios';
import { useAuth } from '../../auth-context/auth.context';
import ModuleNotification from '../../components/Widgets/Statistic/Notification';

const IFCFileUpload = () => {
    let history = useHistory();
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await axios.get(`${API_SERVER}/dashboard`);
    //             console.log(response.data);
    //         } catch (error) {
    //             console.error('Error fetching data from /api/dashboard', error);
    //         }
    //     };
    //     fetchData();
    // }, []);
    
    const { user } = useAuth();

    const djsConfig = {
        addRemoveLinks: true,
        uploadMultiple: true,
        acceptedFiles: ".ifc",
        parallelUploads: 100,
        maxFiles: 100,
        maxFilesize: 8 * 1024, // In MB
        autoProcessQueue: false,
    };

    const componentConfig = {
        iconFiletypes: ['.ifc'],
        showFiletypeIcon: true,
        postUrl: 'NO_URL'
    };

    const eventHandlers = {
        addedfile: (file) => console.log('new file added', file),
        success: (file, response) => {
          const redirectUrl = response.url || '/estimate'; // Default to '/estimate' if url is not provided
          if (window.location.pathname === "/estimate") {
            window.location.reload();
          } else {
              history.push(redirectUrl);
          }
          history.push(redirectUrl);
          window.location.reload();
        },
        totaluploadprogress: (progress) => {
            setUploadProgress(progress);
        },
        init: (dropzone) => {
            window.dropzone = dropzone;
        },
    };

    const handleUploadClick = useCallback(() => {
        const files = window.dropzone.getAcceptedFiles();
        const formData = new FormData();
        files.forEach(file => {
            formData.append('file', file);
            console.log(`Appending file: ${file.name}`);
        });
  
        console.log(`Total files appended: ${files.length}`);
  
        if (files.length > 0) {
            axios.post(`${API_SERVER}/dashboard`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `${user.token}`
                },
                onUploadProgress: (progressEvent) => {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            })
            .then(response => {
              const redirectUrl = response.data.url || '/estimate'; // Default to '/estimate' if url is not provided
              history.push(redirectUrl);
              console.log('Upload successful:', response.data);
              if (window.location.pathname === "/estimate") {
                window.location.reload();
              } else {
                  history.push(redirectUrl);
              }
            })
            .catch(error => console.error('Error uploading files:', error));
        } else {
            console.error('No files to upload.');
        }
    }, [history, user.token]);

    return (
        <React.Fragment>
            <Row>
                <Col sm={12}>
                    <ModuleNotification message="Please upload IFC file here" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <Card.Title as="h5">File Upload</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <DropzoneComponent config={componentConfig} eventHandlers={eventHandlers} djsConfig={djsConfig} />
                            <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
                            <Row className="text-center m-t-10">
                                <Col>
                                    <Button onClick={handleUploadClick}>Upload Files</Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default IFCFileUpload;
