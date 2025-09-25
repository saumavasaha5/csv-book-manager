import React, { useState, useCallback } from 'react';
import './App.css';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import { uploadFile, generateSampleData } from './api/csvApi';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    setLoading(true);
    try {
      const response = await uploadFile(file);
      setSessionId(response.sessionId);
      setData(response.data);
      setOriginalData(response.data);
      setFilename(response.data.length > 0 ? file.name : '');
      showNotification(response.message, 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to upload file', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const handleGenerateSample = useCallback(async (count = 10000) => {
    setLoading(true);
    try {
      const response = await generateSampleData(count);
      setSessionId(response.sessionId);
      setData(response.data);
      setOriginalData(response.data);
      setFilename('sample-data.csv');
      showNotification(response.message, 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to generate sample data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const handleDataUpdate = useCallback((newData) => {
    setData(newData);
  }, []);

  const handleReset = useCallback(() => {
    setData([...originalData]);
    showNotification('Data has been reset to original', 'info');
  }, [originalData, showNotification]);

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📚 CSV Book Manager
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {data.length > 0 && `${data.length.toLocaleString()} records`}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {!sessionId ? (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Welcome to CSV Book Manager
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 4 }}>
              Upload your CSV file or generate sample book data to get started
            </Typography>
            <FileUpload
              onFileUpload={handleFileUpload}
              onGenerateSample={handleGenerateSample}
              loading={loading}
            />
          </Paper>
        ) : (
          <DataTable
            data={data}
            originalData={originalData}
            sessionId={sessionId}
            filename={filename}
            onDataUpdate={handleDataUpdate}
            onReset={handleReset}
            showNotification={showNotification}
          />
        )}
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
