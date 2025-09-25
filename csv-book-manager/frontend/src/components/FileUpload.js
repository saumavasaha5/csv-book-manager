import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  AutoAwesome,
} from '@mui/icons-material';

const FileUpload = ({ onFileUpload, onGenerateSample, loading }) => {
  const [sampleCount, setSampleCount] = useState(10000);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Validate file type
        if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
          alert('Please upload a CSV file only.');
          return;
        }
        
        // Validate file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          alert('File size should be less than 50MB.');
          return;
        }
        
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: loading,
  });

  const handleGenerateSample = () => {
    onGenerateSample(sampleCount);
  };

  const handleSampleCountChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value >= 1000 && value <= 50000) {
      setSampleCount(value);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Grid container spacing={4}>
        {/* File Upload Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
                Upload CSV File
              </Typography>
              
              <Paper
                {...getRootProps()}
                sx={{
                  p: 4,
                  mt: 2,
                  border: '2px dashed',
                  borderColor: isDragActive
                    ? 'primary.main'
                    : isDragReject
                    ? 'error.main'
                    : 'grey.300',
                  backgroundColor: isDragActive
                    ? 'primary.light'
                    : isDragReject
                    ? 'error.light'
                    : 'grey.50',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  textAlign: 'center',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                <input {...getInputProps()} />
                <Description sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                
                {loading ? (
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      Processing file...
                    </Typography>
                    <LinearProgress sx={{ mt: 2 }} />
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {isDragActive
                        ? 'Drop the CSV file here'
                        : 'Drag & drop CSV file here'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      or click to select file
                    </Typography>
                    <Button variant="contained" component="span">
                      Choose File
                    </Button>
                  </Box>
                )}
              </Paper>

              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'grey.600' }}>
                Supported: CSV files up to 50MB
                <br />
                Expected columns: Title, Author, Genre, PublishedYear, ISBN
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sample Data Generation Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="secondary">
                <AutoAwesome sx={{ mr: 1, verticalAlign: 'middle' }} />
                Generate Sample Data
              </Typography>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Create sample book data for testing and demonstration
              </Typography>

              <TextField
                label="Number of Records"
                type="number"
                value={sampleCount}
                onChange={handleSampleCountChange}
                inputProps={{ min: 1000, max: 50000, step: 1000 }}
                sx={{ mb: 3 }}
                fullWidth
                helperText="Choose between 1,000 and 50,000 records"
              />

              <Button
                variant="outlined"
                color="secondary"
                onClick={handleGenerateSample}
                disabled={loading}
                fullWidth
                size="large"
                sx={{ py: 1.5 }}
              >
                Generate {sampleCount.toLocaleString()} Sample Books
              </Button>

              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'grey.600' }}>
                Sample data includes realistic book titles, authors, genres, years (1954-2023), and ISBN numbers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Instructions */}
      <Paper sx={{ p: 3, backgroundColor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          📋 How to Use
        </Typography>
        <Typography variant="body2" component="div">
          <strong>1. Upload Your Data:</strong> Drag and drop a CSV file or use the file picker
          <br />
          <strong>2. Generate Sample:</strong> Create test data with thousands of book records
          <br />
          <strong>3. Edit & Filter:</strong> Modify data, apply filters, and sort columns
          <br />
          <strong>4. Download:</strong> Export your edited data as a new CSV file
        </Typography>
      </Paper>
    </Box>
  );
};

export default FileUpload;
