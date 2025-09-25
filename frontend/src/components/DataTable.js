import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';
import {
  Download,
  Refresh,
  FilterList,
  Edit,
} from '@mui/icons-material';
import { downloadCSV, updateData, resetData } from '../api/csvApi';
import debounce from 'lodash.debounce';

const DataTable = ({
  data,
  originalData,
  sessionId,
  filename,
  onDataUpdate,
  onReset,
  showNotification,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [rows, setRows] = useState([]);
  const [modifiedRows, setModifiedRows] = useState(new Set());
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    yearFrom: '',
    yearTo: '',
    author: '',
  });
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(isMobile ? 25 : 100);

  // Initialize rows with unique IDs
  useEffect(() => {
    const rowsWithIds = data.map((row, index) => ({
      id: index,
      ...row,
      _isModified: false,
    }));
    setRows(rowsWithIds);
    setModifiedRows(new Set());
  }, [data]);

  // Get unique values for filter dropdowns
  const uniqueGenres = useMemo(() => {
    const genres = [...new Set(originalData.map(row => row.Genre))].filter(Boolean);
    return genres.sort();
  }, [originalData]);


  // Define columns
  const columns = useMemo(() => [
    {
      field: 'Title',
      headerName: 'Title',
      flex: isMobile ? 1 : 2,
      minWidth: 200,
      editable: true,
      cellClassName: (params) => modifiedRows.has(params.row.id) ? 'modified-cell' : '',
    },
    {
      field: 'Author',
      headerName: 'Author',
      flex: isMobile ? 1 : 1.5,
      minWidth: 150,
      editable: true,
      cellClassName: (params) => modifiedRows.has(params.row.id) ? 'modified-cell' : '',
    },
    {
      field: 'Genre',
      headerName: 'Genre',
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: uniqueGenres,
      cellClassName: (params) => modifiedRows.has(params.row.id) ? 'modified-cell' : '',
    },
    {
      field: 'PublishedYear',
      headerName: 'Year',
      type: 'number',
      width: 100,
      editable: true,
      cellClassName: (params) => modifiedRows.has(params.row.id) ? 'modified-cell' : '',
    },
    {
      field: 'ISBN',
      headerName: 'ISBN',
      width: isMobile ? 120 : 150,
      editable: true,
      cellClassName: (params) => modifiedRows.has(params.row.id) ? 'modified-cell' : '',
    },
  ], [uniqueGenres, modifiedRows, isMobile]);

  // Custom toolbar
  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <Box sx={{ flexGrow: 1 }} />
      <Button
        size="small"
        startIcon={<FilterList />}
        onClick={() => setFilterDialog(true)}
      >
        Filters
      </Button>
    </GridToolbarContainer>
  );

  // Handle cell edit commit
  const handleCellEditCommit = useCallback((params) => {
    const { id, field, value } = params;
    
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          
          // Check if this row is different from original
          const originalRow = originalData[id];
          const isModified = originalRow && (
            updatedRow.Title !== originalRow.Title ||
            updatedRow.Author !== originalRow.Author ||
            updatedRow.Genre !== originalRow.Genre ||
            updatedRow.PublishedYear !== originalRow.PublishedYear ||
            updatedRow.ISBN !== originalRow.ISBN
          );
          
          if (isModified) {
            setModifiedRows(prev => new Set([...prev, id]));
          } else {
            setModifiedRows(prev => {
              const newSet = new Set([...prev]);
              newSet.delete(id);
              return newSet;
            });
          }
          
          return updatedRow;
        }
        return row;
      })
    );
  }, [originalData]);

  // Save changes
  const handleSaveChanges = useCallback(() => {
    const debouncedSave = debounce(async () => {
      setLoading(true);
      try {
        const dataToSave = rows.map(({ id, _isModified, ...row }) => row);
        await updateData(sessionId, dataToSave);
        onDataUpdate(dataToSave);
        showNotification(`Saved changes for ${modifiedRows.size} records`, 'success');
      } catch (error) {
        showNotification('Failed to save changes', 'error');
      } finally {
        setLoading(false);
      }
    }, 1000);
    
    debouncedSave();
  }, [rows, sessionId, onDataUpdate, showNotification, modifiedRows.size]);

  // Auto-save when data changes
  useEffect(() => {
    if (modifiedRows.size > 0) {
      handleSaveChanges();
    }
  }, [modifiedRows.size, handleSaveChanges]);

  // Download CSV
  const handleDownload = useCallback(() => {
    try {
      downloadCSV(sessionId, `edited-${filename}`);
      showNotification('Download started', 'success');
    } catch (error) {
      showNotification('Failed to download file', 'error');
    }
  }, [sessionId, filename, showNotification]);

  // Reset all changes
  const handleReset = useCallback(async () => {
    setLoading(true);
    try {
      await resetData(sessionId);
      onReset();
      showNotification('All changes have been reset', 'info');
    } catch (error) {
      showNotification('Failed to reset data', 'error');
    } finally {
      setLoading(false);
    }
  }, [sessionId, onReset, showNotification]);

  // Apply filters
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      if (filters.genre && row.Genre !== filters.genre) return false;
      if (filters.author && !row.Author.toLowerCase().includes(filters.author.toLowerCase())) return false;
      if (filters.yearFrom && row.PublishedYear < parseInt(filters.yearFrom)) return false;
      if (filters.yearTo && row.PublishedYear > parseInt(filters.yearTo)) return false;
      return true;
    });
  }, [rows, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ genre: '', yearFrom: '', yearTo: '', author: '' });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Actions */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📊 {filename}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${filteredRows.length.toLocaleString()} / ${rows.length.toLocaleString()} records`}
              color="primary"
              variant="outlined"
            />
            
            {modifiedRows.size > 0 && (
              <Chip
                label={`${modifiedRows.size} modified`}
                color="warning"
                icon={<Edit />}
              />
            )}
          </Box>
        </Toolbar>
      </Paper>

      {/* Action Buttons */}
      <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
                disabled={loading}
              >
                Download CSV
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleReset}
                disabled={loading || modifiedRows.size === 0}
                color="warning"
              >
                Reset All
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilterDialog(true)}
                color={Object.values(filters).some(f => f) ? 'secondary' : 'inherit'}
              >
                Filter ({Object.values(filters).filter(f => f).length})
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            {modifiedRows.size > 0 && (
              <Alert severity="info" sx={{ py: 0.5 }}>
                Changes are auto-saved. Modified rows are highlighted in yellow.
              </Alert>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Data Grid */}
      <Paper elevation={2} sx={{ height: isMobile ? 400 : 600, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          rowsPerPageOptions={[25, 50, 100, 200]}
          components={{
            Toolbar: CustomToolbar,
          }}
          onCellEditCommit={handleCellEditCommit}
          loading={loading}
          disableSelectionOnClick
          density={isMobile ? 'compact' : 'standard'}
          sx={{
            '& .modified-cell': {
              backgroundColor: 'warning.light',
              '&:hover': {
                backgroundColor: 'warning.main',
              },
            },
          }}
        />
      </Paper>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialog}
        onClose={() => setFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Data</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  label="Genre"
                >
                  <MenuItem value="">All Genres</MenuItem>
                  {uniqueGenres.map(genre => (
                    <MenuItem key={genre} value={genre}>{genre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author (contains)"
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                placeholder="Search author name"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Year From"
                value={filters.yearFrom}
                onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                inputProps={{ min: 1900, max: 2030 }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Year To"
                value={filters.yearTo}
                onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                inputProps={{ min: 1900, max: 2030 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearFilters}>Clear All</Button>
          <Button onClick={() => setFilterDialog(false)} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataTable;
