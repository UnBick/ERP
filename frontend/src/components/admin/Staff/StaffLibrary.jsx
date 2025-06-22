// frontend/src/components/admin/Staff/StaffLibrary.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
} from '@mui/material';
import { Search, Book, History, QrCodeScanner } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';  // Update import
import { getApiUrl } from '../../../config/apiConfig';

const API_BASE_URL = getApiUrl('/api/v1/admin/library');
const StaffLibrary = () => {
  const { user } = useAuth();  // Use Auth context instead of Student context
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    availability: 'all'
  });
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [fineDetails, setFineDetails] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchIssuedBooks();
    fetchRecommendations();
  }, [searchQuery, filters]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        category: filters.category,
        availability: filters.availability
      });

      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/v1/admin/library/books?${queryParams}`), {

      const response = await fetch(`${API_BASE_URL}/books?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      
      if (data.success) {
        setBooks(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching books'
      });
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuedBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
<<<<<<< HEAD
      const response = await fetch(getApiUrl('/api/v1/admin/library/issued-books'), {
=======
      const response = await fetch(`${API_BASE_URL}/issued-books`, {
>>>>>>> d9fcda63fb6e63fb1102e4fd66513292be4372f9
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch issued books');
      const data = await response.json();
      
      if (data.success) {
        setIssuedBooks(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching issued books'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookAction = async (bookId, action = 'issue') => {
    if (!user) {
      setAlert({
        type: 'error',
        message: 'Please login to continue'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = `${API_BASE_URL}/${action}-book`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookId,
          userId: user._id,
          userModel: user.role || 'Staff'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} book`);
      }

      const data = await response.json();
      setAlert({
        type: 'success',
        message: data.message || `Book ${action}ed successfully`
      });
      
      // Refresh the lists
      await Promise.all([fetchBooks(), fetchIssuedBooks()]);
    } catch (error) {
      console.error(`Book ${action} error:`, error);
      setAlert({
        type: 'error',
        message: error.message || `Failed to ${action} book`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      
      const QrScanner = require('qr-scanner');
      const scanner = new QrScanner(videoElement, result => {
        setQrResult(result);
        handleBookAction(result.data);
        scanner.destroy();
        stream.getTracks().forEach(track => track.stop());
      });

      scanner.start();
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to initialize camera'
      });
    }
  };

  const calculateFine = (issueDate, returnDate = new Date()) => {
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 14);

    if (returnDate > dueDate) {
      const days = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      return days * 5;
    }
    return 0;
  };

  const renderFineDialog = () => (
    <Dialog open={!!fineDetails} onClose={() => setFineDetails(null)}>
      <DialogTitle>Fine Payment</DialogTitle>
      <DialogContent>
        <Typography>Amount Due: ₹{fineDetails?.amount}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setFineDetails(null)}>Close</Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handlePayFine}
        >
          Pay Fine
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handlePayFine = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/v1/library/pay-fine'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issueId: fineDetails.issueId,
          amount: fineDetails.amount
        })
      });

      if (!response.ok) throw new Error('Payment failed');
      const data = await response.json();

      if (data.success) {
        setAlert({
          type: 'success',
          message: 'Fine paid successfully'
        });
        setFineDetails(null);
        fetchIssuedBooks();
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Failed to process payment'
      });
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/v1/admin/library/recommendations'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Recommendations error:', error);
      setAlert({
        type: 'error',
        message: 'Failed to fetch recommendations'
      });
      setRecommendations([]);
    }
  };

  const renderBookCard = (book, isRecommendation = false) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
            component="img"
            height="200"
            image={book.coverImage}
            alt={book.title}
            sx={{ objectFit: 'contain', p: 1 }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap title={book.title}>
                {book.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {book.author}
            </Typography>
            {!isRecommendation && (
                <>
                    <Typography variant="body2" color="text.secondary">
                        Category: {book.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Available: {book.availableCopies}/{book.totalCopies}
                    </Typography>
                </>
            )}
            <Box sx={{ mt: 1 }}>
                <Chip
                    label={book.available ? 'Available' : 'Issued'}
                    color={book.available ? 'success' : 'error'}
                    size="small"
                />
            </Box>
            <Button
                variant="contained"
                fullWidth
                disabled={!book.available}
                onClick={() => handleBookAction(book.id)}
                sx={{ mt: 2 }}
            >
                {book.available ? 'Issue Book' : 'Not Available'}
            </Button>
        </CardContent>
    </Card>
);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Library Management
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search />
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<QrCodeScanner />}
              onClick={handleQRScan}
            >
              Scan QR Code
            </Button>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="fiction">Fiction</MenuItem>
                <MenuItem value="non-fiction">Non-Fiction</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Availability"
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
              >
                <MenuItem value="all">All Books</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="issued">Issued</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Available Books
            </Typography>
            <Grid container spacing={2}>
              {Array.isArray(books) && books.length > 0 ? (
                books.map((book) => (
                  <Grid item xs={12} sm={6} md={3} key={book.id || book._id}>
                    {renderBookCard(book)}
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Typography textAlign="center" color="text.secondary">
                    {loading ? 'Loading books...' : 'No books found'}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Recommended for You
            </Typography>
            <Grid container spacing={2}>
              {recommendations.map(book => (
                <Grid item xs={12} sm={6} md={3} key={book.id}>
                  {renderBookCard(book, true)}
                </Grid>
              ))}
              {recommendations.length === 0 && !loading && (
                <Grid item xs={12}>
                    <Typography textAlign="center" color="text.secondary">
                        No recommendations available
                    </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Issued Books
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book Title</TableCell>
                    <TableCell>Issue Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {issuedBooks.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>{issue.bookTitle}</TableCell>
                      <TableCell>
                        {new Date(issue.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={issue.status}
                          color={issue.status === 'overdue' ? 'error' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={() => handleBookAction(issue.id, 'return')}
                        >
                          Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Your Reservations
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Book Title</TableCell>
                    <TableCell>Reserved Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map(reservation => (
                    <TableRow key={reservation.id}>
                      {/* Reservation row content */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {alert && (
          <Snackbar
            open={!!alert}
            autoHideDuration={6000}
            onClose={() => setAlert(null)}
          >
            <Alert 
              onClose={() => setAlert(null)} 
              severity={alert.type || 'info'}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>

      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)}>
        <DialogTitle>Scan Book QR Code</DialogTitle>
        <DialogContent>
          <Box id="qr-reader" sx={{ width: '100%', height: 300 }} />
        </DialogContent>
      </Dialog>

      {renderFineDialog()}
    </Box>
  );
};

export default StaffLibrary;
