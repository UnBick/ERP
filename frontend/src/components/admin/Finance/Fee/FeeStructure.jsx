// src/components/admin/Finance/Fee/FeeManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  RemoveCircleOutline,
  Assessment,
  DirectionsBus,
} from '@mui/icons-material';

// Add API base URL constant
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Add helper for API calls
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const baseUrl = 'http://localhost:5000'; // Add explicit base URL

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('API Error Response:', text); // Add debug logging
      throw new Error(`HTTP error! status: ${response.status}. Details: ${text}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Server response was not JSON");
    }

    return response.json();
  } catch (error) {
    console.error('Fetch Error:', error); // Add debug logging
    throw error;
  }
};

// Helper: calculate effective fee based on adjustment type
const computeEffectiveFee = (total, adjustment) => {
  if (!adjustment) return total;
  if (adjustment.type === 'percentage') {
    return total * (1 - adjustment.value / 100);
  } else if (adjustment.type === 'amount') {
    return total - adjustment.value;
  }
  return total;
};

const API_ENDPOINTS = {
  classFeeStructures: '/api/v1/admin/fees/structures',
  feeAdjustments: '/api/v1/admin/fees/adjustments',
  transportFees: '/api/v1/admin/fees/transport',
  lateFeePenalties: '/api/v1/admin/fees/penalties', // Updated endpoint
  classes: '/api/v1/admin/academic/classes' // Updated path for classes
};

const FeeManagement = () => {
  // --- View Management ---
  // selectedView: null (menu view), "classFees", "feeAdjustments", or "transportFees"
  const [selectedView, setSelectedView] = useState(null);

  // --- Data State for Class Fee Structures ---
  // Each object: { id, class: (class id), baseFee, feeComponents: [{ id, name, amount }] }
  const [classFeeStructures, setClassFeeStructures] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // --- Data State for Fee Adjustments ---
  // Structure: { general: { type, value }, obc: {...}, sc: {...}, st: {...} }
  const [feeAdjustments, setFeeAdjustments] = useState({
    general: { type: 'percentage', value: 0 },
    obc: { type: 'percentage', value: 0 },
    sc: { type: 'percentage', value: 0 },
    st: { type: 'percentage', value: 0 }
  });
  const [loadingAdjustments, setLoadingAdjustments] = useState(false);

  // --- Data State for Late Fee Penalties ---
  // Each object: { id, minDuration, maxDuration, penalty }
  const [lateFeePenalties, setLateFeePenalties] = useState([]);
  const [loadingLateFeePenalties, setLoadingLateFeePenalties] = useState(false);

  // --- Data State for Available Classes (fetched from database) ---
  // Each object: { id, name }
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loadingAvailableClasses, setLoadingAvailableClasses] = useState(false);

  // --- Data State for Transport Fees ---
  // Each object: { id, minDistance, maxDistance, cost }
  const [transportFees, setTransportFees] = useState([]);
  const [loadingTransportFees, setLoadingTransportFees] = useState(false);

  // --- UI State for Editing a Class Fee Structure ---
  const [openClassDialog, setOpenClassDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  // Use key "class" to store the selected class id.
  const [classForm, setClassForm] = useState({
    class: '',
    baseFee: '',
    feeComponents: [],
  });

  // --- UI State for Transport Fee Editing ---
  const [openTransportFeeDialog, setOpenTransportFeeDialog] = useState(false);
  const [editingTransportFee, setEditingTransportFee] = useState(null);
  const [transportFeeForm, setTransportFeeForm] = useState({
    minDistance: '',
    maxDistance: '',
    cost: '',
  });

  // --- UI State for Late Fee Penalty Editing ---
  const [openLateFeeDialog, setOpenLateFeeDialog] = useState(false);
  const [editingLateFee, setEditingLateFee] = useState(null);
  const [lateFeeForm, setLateFeeForm] = useState({
    minDuration: '',
    maxDuration: '',
    penalty: '',
  });

  // --- Notification ---
  const [alertMsg, setAlertMsg] = useState(null);

  // --- Fetch Data from Backend on Mount ---
  useEffect(() => {
    fetchClassFeeStructures();
    fetchFeeAdjustments();
    fetchLateFeePenalties();
    fetchAvailableClasses();
    fetchTransportFees();
  }, []);

  // Update the fetch function with more robust error handling
  const fetchClassFeeStructures = async () => {
    setLoadingClasses(true);
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.classFeeStructures);
      setClassFeeStructures(data.data || []);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
      setAlertMsg({
        severity: 'error',
        message: error.message || 'Error fetching fee structures'
      });
      setClassFeeStructures([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Update other fetch functions with similar error handling
  const fetchFeeAdjustments = async () => {
    setLoadingAdjustments(true);
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.feeAdjustments);
      
      // Ensure each category has valid values
      const defaultValues = {
        type: 'percentage',
        value: 0
      };

      const adjustments = data?.data || {};
      
      setFeeAdjustments({
        general: { ...defaultValues, ...adjustments.general },
        obc: { ...defaultValues, ...adjustments.obc },
        sc: { ...defaultValues, ...adjustments.sc },
        st: { ...defaultValues, ...adjustments.st }
      });
    } catch (error) {
      console.error('Error fetching fee adjustments:', error);
      setAlertMsg({
        severity: 'error',
        message: `Failed to load fee adjustments: ${error.message}`
      });
    } finally {
      setLoadingAdjustments(false);
    }
  };

  // Fetch late fee penalties
  const fetchLateFeePenalties = async () => {
    setLoadingLateFeePenalties(true);
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.lateFeePenalties);
      setLateFeePenalties(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching late fee penalties:', error);
      setAlertMsg({
        severity: 'error',
        message: `Failed to load late fee penalties: ${error.message}`
      });
      setLateFeePenalties([]);
    } finally {
      setLoadingLateFeePenalties(false);
    }
  };

  const fetchAvailableClasses = async () => {
    setLoadingAvailableClasses(true);
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.classes);
      
      console.log("Full API Response:", data); // 🔍 Debug: Log the entire response
      console.log("Classes Fetched:", data.data); // 🔍 Debug: Log extracted class data
  
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid API response structure");
      }
  
      setAvailableClasses(data.data);
    } catch (error) {
      console.error("Error fetching available classes:", error);
      setAlertMsg({
        severity: "error",
        message: `Failed to load classes: ${error.message}`,
      });
      setAvailableClasses([]);
    } finally {
      setLoadingAvailableClasses(false);
    }
  };
  
  
  

  // Update the transport fees fetch function
  const fetchTransportFees = async () => {
    setLoadingTransportFees(true);
    try {
      const data = await fetchWithAuth(API_ENDPOINTS.transportFees);
      setTransportFees(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching transport fees:', error);
      setAlertMsg({
        severity: 'error',
        message: `Failed to load transport fees: ${error.message}`
      });
      setTransportFees([]);
    } finally {
      setLoadingTransportFees(false);
    }
  };

  // --- Save or Update a Class Fee Structure ---
  const handleSaveClassStructure = async () => {
    try {
      const payload = {
        class: classForm.class,
        baseFee: Number(classForm.baseFee),
        feeComponents: classForm.feeComponents.map(comp => ({
          name: comp.name,
          amount: Number(comp.amount),
        })),
      };

      const response = await fetchWithAuth(
        `${API_ENDPOINTS.classFeeStructures}${editingClass ? `/${editingClass.id}` : ''}`,
        {
          method: editingClass ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        }
      );

      if (response.success) {
        setAlertMsg({ 
          severity: 'success', 
          message: 'Class fee structure saved successfully' 
        });
        await fetchClassFeeStructures();
        setOpenClassDialog(false);
        setEditingClass(null);
        setClassForm({ class: '', baseFee: '', feeComponents: [] });
      } else {
        throw new Error(response.message || 'Failed to save class fee structure');
      }
    } catch (error) {
      console.error('Error saving class fee structure:', error);
      setAlertMsg({ 
        severity: 'error', 
        message: error.message || 'Error saving class fee structure' 
      });
    }
  };

  // --- Delete a Class Fee Structure ---
  const handleDeleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this structure?')) {
      try {
        const response = await fetch(`/api/v1/admin/classFeeStructures/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error deleting');
        fetchClassFeeStructures();
      } catch (error) {
        console.error(error);
        setAlertMsg('Error deleting class fee structure');
      }
    }
  };

  // --- Save Fee Adjustments ---
  const handleSaveAdjustments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/fees/adjustments', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feeAdjustments),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save fee adjustments');
      }
  
      const data = await response.json();
      if (data.success) {
        setAlertMsg({ 
          severity: 'success', 
          message: 'Fee adjustments saved successfully' 
        });
        await fetchClassFeeStructures(); // Refresh effective fee data
      } else {
        throw new Error(data.message || 'Failed to save fee adjustments');
      }
    } catch (error) {
      console.error('Error saving fee adjustments:', error);
      setAlertMsg({ 
        severity: 'error', 
        message: error.message || 'Error saving fee adjustments'
      });
    }
  };
  

  // --- Save or Update a Transport Fee ---
  const handleSaveTransportFee = async () => {
    try {
      // Validate form data
      if (!transportFeeForm.minDistance || !transportFeeForm.maxDistance || !transportFeeForm.cost) {
        throw new Error('All fields are required');
      }
  
      const minDistance = Number(transportFeeForm.minDistance);
      const maxDistance = Number(transportFeeForm.maxDistance);
      const cost = Number(transportFeeForm.cost);
  
      // Validate numbers
      if (isNaN(minDistance) || isNaN(maxDistance) || isNaN(cost)) {
        throw new Error('All values must be valid numbers');
      }
  
      // Validate ranges
      if (minDistance < 0 || maxDistance < 0 || cost < 0) {
        throw new Error('Values cannot be negative');
      }
  
      if (maxDistance <= minDistance) {
        throw new Error('Maximum distance must be greater than minimum distance');
      }
  
      const payload = {
        minDistance,
        maxDistance,
        cost
      };
  
      const response = await fetchWithAuth(
        `${API_ENDPOINTS.transportFees}${editingTransportFee ? `/${editingTransportFee.id}` : ''}`,
        {
          method: editingTransportFee ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        }
      );
  
      if (response.success) {
        setAlertMsg({
          severity: 'success',
          message: 'Transport fee saved successfully'
        });
        await fetchTransportFees();
        setOpenTransportFeeDialog(false);
        setEditingTransportFee(null);
        setTransportFeeForm({ minDistance: '', maxDistance: '', cost: '' });
      } else {
        throw new Error(response.message || 'Failed to save transport fee');
      }
    } catch (error) {
      console.error('Error saving transport fee:', error);
      setAlertMsg({
        severity: 'error',
        message: error.message || 'Error saving transport fee'
      });
    }
  };
  

  // --- Delete a Transport Fee ---
  const handleDeleteTransportFee = async (id) => {
    if (window.confirm('Are you sure you want to delete this transport fee rule?')) {
      try {
        const response = await fetch(`/api/v1/admin/transportFees/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error deleting');
        fetchTransportFees();
      } catch (error) {
        console.error(error);
        setAlertMsg('Error deleting transport fee');
      }
    }
  };

  // --- Save or Update a Late Fee Penalty ---
  const handleSaveLateFeePenalty = async () => {
    try {
      // Frontend validation
      const minDuration = Number(lateFeeForm.minDuration);
      const maxDuration = Number(lateFeeForm.maxDuration);
      const penalty = Number(lateFeeForm.penalty);

      // Check for required fields
      if (!lateFeeForm.minDuration || !lateFeeForm.maxDuration || !lateFeeForm.penalty) {
        throw new Error('All fields are required');
      }

      // Check for valid numbers
      if (isNaN(minDuration) || isNaN(maxDuration) || isNaN(penalty)) {
        throw new Error('All values must be valid numbers');
      }

      // Check for negative values
      if (minDuration < 0 || maxDuration < 0 || penalty < 0) {
        throw new Error('Values cannot be negative');
      }

      // Check duration logic
      if (maxDuration <= minDuration) {
        throw new Error('Maximum duration must be greater than minimum duration');
      }

      const payload = {
        minDuration,
        maxDuration,
        penalty
      };

      const response = await fetchWithAuth(
        `${API_ENDPOINTS.lateFeePenalties}${editingLateFee ? `/${editingLateFee.id}` : ''}`,
        {
          method: editingLateFee ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        }
      );

      if (response.success) {
        setAlertMsg({
          severity: 'success',
          message: 'Late fee penalty saved successfully'
        });
        await fetchLateFeePenalties();
        setOpenLateFeeDialog(false);
        setEditingLateFee(null);
        setLateFeeForm({ minDuration: '', maxDuration: '', penalty: '' });
      } else {
        throw new Error(response.message || 'Failed to save late fee penalty');
      }
    } catch (error) {
      console.error('Error saving late fee penalty:', error);
      setAlertMsg({
        severity: 'error',
        message: error.message || 'Error saving late fee penalty'
      });
    }
  };

  // --- Delete a Late Fee Penalty ---
  const handleDeleteLateFeePenalty = async (id) => {
    if (window.confirm('Are you sure you want to delete this late fee penalty rule?')) {
      try {
        const response = await fetch(`/api/v1/admin/lateFeePenalties/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error deleting');
        fetchLateFeePenalties();
      } catch (error) {
        console.error(error);
        setAlertMsg('Error deleting late fee penalty');
      }
    }
  };

  // --- Class Fee Component Handlers ---
  const addFeeComponent = () => {
    setClassForm(prev => ({
      ...prev,
      feeComponents: [...prev.feeComponents, { name: '', amount: '' }],
    }));
  };

  const updateFeeComponent = (index, field, value) => {
    setClassForm(prev => {
      const updated = [...prev.feeComponents];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, feeComponents: updated };
    });
  };

  const removeFeeComponent = (index) => {
    setClassForm(prev => {
      const updated = prev.feeComponents.filter((_, i) => i !== index);
      return { ...prev, feeComponents: updated };
    });
  };

  // --- Open Class Edit Dialog ---
  const openEditDialog = (classData) => {
    setEditingClass(classData);
    setClassForm({
      // Here we assume that classData.class holds the selected class's id
      class: classData.class,
      baseFee: classData.baseFee,
      feeComponents: classData.feeComponents || [],
    });
    setOpenClassDialog(true);
  };

  // --- Open Transport Fee Edit Dialog ---
  const openEditTransportFeeDialog = (tfData) => {
    setEditingTransportFee(tfData);
    setTransportFeeForm({
      minDistance: tfData.minDistance,
      maxDistance: tfData.maxDistance,
      cost: tfData.cost,
    });
    setOpenTransportFeeDialog(true);
  };

  // --- Open Late Fee Penalty Edit Dialog ---
  const openEditLateFeeDialog = (lfData) => {
    setEditingLateFee(lfData);
    setLateFeeForm({
      minDuration: lfData.minDuration,
      maxDuration: lfData.maxDuration,
      penalty: lfData.penalty,
    });
    setOpenLateFeeDialog(true);
  };

  // --- Compute Total Fee for a Class ---
  const computeTotalFee = (classData) => {
    const base = Number(classData.baseFee) || 0;
    const componentsTotal = (classData.feeComponents || []).reduce(
      (sum, comp) => sum + (Number(comp.amount) || 0),
      0
    );
    return base + componentsTotal;
  };

  // --- Menu Cards ---
  const menuCards = [
    {
      title: 'Manage Class Fees',
      description: 'Add and edit class fee structures, base fees, and fee components.',
      icon: <Edit sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      view: 'classFees',
    },
    {
      title: 'Fee Adjustments',
      description: 'Set fee deduction or percentage adjustments by student category, and manage late fee penalties.',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      view: 'feeAdjustments',
    },
    {
      title: 'Transport Fees',
      description: 'Set transport cost based on distance ranges.',
      icon: <DirectionsBus sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      view: 'transportFees',
    },
  ];

  // --- Render Detailed View based on selectedView ---
  const renderSelectedView = () => {
    if (selectedView === 'classFees') {
      return (
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingClass(null);
              setClassForm({ class: '', baseFee: '', feeComponents: [] });
              setOpenClassDialog(true);
            }}
            sx={{ mb: 2 }}
          >
            Add New Class Fee Structure
          </Button>
          {loadingClasses ? (
            <CircularProgress />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Class</TableCell>
                    <TableCell>Base Fee</TableCell>
                    <TableCell>Components</TableCell>
                    <TableCell>Total Fee</TableCell>
                    <TableCell>Effective Fees</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classFeeStructures.map((cls) => {
                    const total = computeTotalFee(cls);
                    // Look up the class name from availableClasses using the id (if available)
                    const classInfo = availableClasses.find((c) => c.id === cls.class);
                    const classLabel = classInfo ? classInfo.name : 'N/A';
                    return (
                      <TableRow key={cls._id || cls.id}>
                        <TableCell>{classLabel}</TableCell>
                        <TableCell>{cls.baseFee}</TableCell>
                        <TableCell>
                          {(cls.feeComponents || []).map((comp, i) => (
                            <div key={`${cls._id}-comp-${i}`}>
                              {comp.name}: {comp.amount}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>{total}</TableCell>
                        <TableCell>
                          {Object.entries(feeAdjustments).map(([cat, adj]) => (
                            <div key={`${cls._id}-${cat}`}>
                              <strong>{cat.toUpperCase()}:</strong>{' '}
                              {computeEffectiveFee(total, adj).toFixed(2)}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => openEditDialog(cls)}>
                            Edit
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDeleteClass(cls.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      );
    } else if (selectedView === 'feeAdjustments') {
      return (
        <Box>
          <Typography variant="h5" gutterBottom>
            Fee Adjustments
          </Typography>
          {loadingAdjustments ? (
            <CircularProgress />
          ) : (
            <>
              <Grid container spacing={3}>
                {Object.entries(feeAdjustments).map(([cat, adj]) => (
                  <Grid item xs={12} sm={6} md={3} key={cat}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 2,
                        backgroundColor: '#f5f5f5',
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {cat.toUpperCase()}
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 1 }} size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={adj.type || 'percentage'} // Provide fallback value
                          label="Type"
                          onChange={(e) =>
                            setFeeAdjustments(prev => ({
                              ...prev,
                              [cat]: { ...prev[cat], type: e.target.value },
                            }))
                          }
                        >
                          <MenuItem value="percentage">Percentage</MenuItem>
                          <MenuItem value="amount">Amount</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Value"
                        size="small"
                        type="number"
                        value={adj.value || 0} // Provide fallback value
                        onChange={(e) =>
                          setFeeAdjustments(prev => ({
                            ...prev,
                            [cat]: { ...prev[cat], value: Number(e.target.value) },
                          }))
                        }
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button variant="contained" onClick={handleSaveAdjustments}>
                  Save Adjustments
                </Button>
              </Stack>

              {/* New Section for Late Fee Penalties */}
              <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Late Fee Penalties
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingLateFee(null);
                  setLateFeeForm({ minDuration: '', maxDuration: '', penalty: '' });
                  setOpenLateFeeDialog(true);
                }}
                sx={{ mb: 2 }}
              >
                Add Late Fee Penalty
              </Button>
              {loadingLateFeePenalties ? (
                <CircularProgress />
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Duration (Days)</TableCell>
                        <TableCell>Penalty Amount</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lateFeePenalties.map((lf) => (
                        <TableRow key={lf._id || lf.id}>
                          <TableCell>
                            {lf.minDuration} - {lf.maxDuration}
                          </TableCell>
                          <TableCell>{lf.penalty}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => openEditLateFeeDialog(lf)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteLateFeePenalty(lf.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Box>
      );
    } else if (selectedView === 'transportFees') {
      return (
        <Box>
          <Typography variant="h5" gutterBottom>
            Transport Fees
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingTransportFee(null);
              setTransportFeeForm({ minDistance: '', maxDistance: '', cost: '' });
              setOpenTransportFeeDialog(true);
            }}
            sx={{ mb: 2 }}
          >
            Add New Transport Fee
          </Button>
          {loadingTransportFees ? (
            <CircularProgress />
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Distance Range</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transportFees.map((tf) => (
                    <TableRow key={tf._id || tf.id}>
                      <TableCell>
                        {tf.minDistance} km - {tf.maxDistance} km
                      </TableCell>
                      <TableCell>{tf.cost}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => openEditTransportFeeDialog(tf)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDeleteTransportFee(tf.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {!selectedView ? (
        // Menu view: display cards for each fee management area.
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Fee Management
            </Typography>
          </Grid>
          {menuCards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.view}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: card.color }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h5" align="center" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {card.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button variant="contained" onClick={() => setSelectedView(card.view)} sx={{ backgroundColor: card.color }}>
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Detailed view: show selected view with a back button.
        <Paper elevation={3} sx={{ p: 3 }}>
          <Button variant="outlined" onClick={() => setSelectedView(null)} sx={{ mb: 2 }}>
            Back to Menu
          </Button>
          {renderSelectedView()}
        </Paper>
      )}

      {/* Dialog for Adding/Editing a Class Fee Structure */}
      <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingClass ? 'Edit Class Fee Structure' : 'Add Class Fee Structure'}</DialogTitle>
        <DialogContent>
          {/* Dropdown to select a class from the available classes */}
          {loadingAvailableClasses ? (
            <CircularProgress size={24} />
          ) : (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Class</InputLabel>
              <Select
                label="Class"
                value={classForm.class}
                onChange={(e) => setClassForm({ ...classForm, class: e.target.value })}
              >
                {availableClasses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            fullWidth
            label="Base Fee"
            type="number"
            value={classForm.baseFee}
            onChange={(e) => setClassForm({ ...classForm, baseFee: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle1" gutterBottom>
            Fee Components
          </Typography>
          {classForm.feeComponents.map((comp, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <TextField
                label="Name"
                value={comp.name}
                onChange={(e) => updateFeeComponent(index, 'name', e.target.value)}
              />
              <TextField
                label="Amount"
                type="number"
                value={comp.amount}
                onChange={(e) => updateFeeComponent(index, 'amount', e.target.value)}
              />
              <IconButton color="error" onClick={() => removeFeeComponent(index)}>
                <RemoveCircleOutline />
              </IconButton>
            </Stack>
          ))}
          <Button variant="outlined" onClick={addFeeComponent} startIcon={<Add />}>
            Add Component
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClassDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveClassStructure}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Adding/Editing a Transport Fee */}
      <Dialog open={openTransportFeeDialog} onClose={() => setOpenTransportFeeDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingTransportFee ? 'Edit Transport Fee' : 'Add Transport Fee'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Min Distance (km)"
            type="number"
            value={transportFeeForm.minDistance}
            onChange={(e) => setTransportFeeForm({ ...transportFeeForm, minDistance: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Max Distance (km)"
            type="number"
            value={transportFeeForm.maxDistance}
            onChange={(e) => setTransportFeeForm({ ...transportFeeForm, maxDistance: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Cost"
            type="number"
            value={transportFeeForm.cost}
            onChange={(e) => setTransportFeeForm({ ...transportFeeForm, cost: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransportFeeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTransportFee}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Adding/Editing a Late Fee Penalty */}
      <Dialog open={openLateFeeDialog} onClose={() => setOpenLateFeeDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingLateFee ? 'Edit Late Fee Penalty' : 'Add Late Fee Penalty'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Min Duration (Days)"
            type="number"
            value={lateFeeForm.minDuration}
            onChange={(e) => setLateFeeForm({ ...lateFeeForm, minDuration: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Max Duration (Days)"
            type="number"
            value={lateFeeForm.maxDuration}
            onChange={(e) => setLateFeeForm({ ...lateFeeForm, maxDuration: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Penalty Amount"
            type="number"
            value={lateFeeForm.penalty}
            onChange={(e) => setLateFeeForm({ ...lateFeeForm, penalty: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLateFeeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLateFeePenalty}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for alerts */}
      {alertMsg && (
        <Snackbar 
          open={Boolean(alertMsg)} 
          autoHideDuration={6000} 
          onClose={() => setAlertMsg(null)}
        >
          <Alert 
            onClose={() => setAlertMsg(null)} 
            severity={typeof alertMsg === 'object' ? alertMsg.severity : 'error'}
          >
            {typeof alertMsg === 'object' ? alertMsg.message : alertMsg}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default FeeManagement;
