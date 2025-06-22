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
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  CardActions
} from '@mui/material';
import { Search, Book, History } from '@mui/icons-material';
import { useStudent } from './context/StudentContext';
import { getApiUrl } from '../../../config/apiConfig';


const StudentLibrary = () => {
  const { currentUser } = useStudent();
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [bookDetails, setBookDetails] = useState(null);
  const [showBookDetails, setShowBookDetails] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchIssuedBooks();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, filter]); // Refetch when search or filter changes

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`/api/v1/admin/library/books?search=${searchQuery}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      if (data.success) {
        setBooks(data.data.books || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchIssuedBooks = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/library/issued-books'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch issued books');
      }

      const data = await response.json();
      if (data.success) {
        setIssuedBooks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching issued books:', error);
    }
  };

  const handleIssueBook = async (bookId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/library/issue-book'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookId,
          userId: currentUser?._id,
          issueDate: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to issue book');
      }

      if (data.success) {
        fetchIssuedBooks();
        fetchBooks(); // Refresh books list to update availability
      }
    } catch (error) {
      console.error('Error issuing book:', error);
    }
  };

  const handleReturnBook = async (issueId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`/api/v1/admin/library/return-book/${issueId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to return book');
      }

      if (data.success) {
        fetchIssuedBooks();
        fetchBooks(); // Refresh books list to update availability
      }
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    if (type === 'success') setSuccess(message);
    else setError(message);
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 3000);
  };

  const handleViewDetails = (book) => {
    setBookDetails(book);
    setShowBookDetails(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Add Book Details Dialog
  const BookDetailsDialog = () => (
    <Dialog open={showBookDetails} onClose={() => setShowBookDetails(false)} maxWidth="md" fullWidth>
      <DialogTitle>Book Details</DialogTitle>
      <DialogContent>
        {bookDetails && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <img 
                src={bookDetails.coverImage} 
                alt={bookDetails.title}
                style={{ width: '100%', height: 'auto' }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6">{bookDetails.title}</Typography>
              <Typography>Author: {bookDetails.author}</Typography>
              <Typography>ISBN: {bookDetails.isbn}</Typography>
              <Typography>Category: {bookDetails.category}</Typography>
              <Typography>Publisher: {bookDetails.publisher}</Typography>
              <Typography>Publication Year: {bookDetails.publishYear}</Typography>
              <Typography>Edition: {bookDetails.edition}</Typography>
              <Typography>Pages: {bookDetails.pages}</Typography>
              <Typography>Description: {bookDetails.description}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowBookDetails(false)}>Close</Button>
        {bookDetails?.available && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleIssueBook(bookDetails._id)}
          >
            Issue Book
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Library Management
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search books by title, author, or ISBN..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter</InputLabel>
              <Select value={filter} onChange={handleFilterChange}>
                <MenuItem value="all">All Books</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="issued">Issued</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {loading ? (
            <Grid item xs={12}>
              <CircularProgress />
            </Grid>
          ) : books.length > 0 ? (
            books.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book._id}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={book.coverImage || '/default-book-cover.jpg'}
                    alt={book.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {book.author}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        label={book.available ? 'Available' : 'Issued'}
                        color={book.available ? 'success' : 'error'}
                        size="small"
                      />
                      <Chip
                        label={book.category}
                        variant="outlined"
                        size="small"
                      />
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleViewDetails(book)}
                    >
                      View Details
                    </Button>
                    {book.available && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleIssueBook(book._id)}
                      >
                        Issue Book
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center">No books found</Typography>
            </Grid>
          )}
        </Grid>

        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Your Issued Books
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Fine</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issuedBooks.map((issue) => (
                <TableRow 
                  key={issue.id}
                  sx={{
                    bgcolor: issue.status === 'overdue' ? 'error.light' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img 
                        src={issue.book?.coverImage || '/default-book-cover.jpg'} 
                        alt={issue.bookTitle}
                        style={{ width: 50, marginRight: 10 }}
                      />
                      <Typography>{issue.bookTitle}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(issue.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(issue.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={issue.status}
                      color={
                        issue.status === 'overdue' ? 'error' : 
                        issue.status === 'returned' ? 'success' : 
                        'primary'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {issue.fine > 0 && `₹${issue.fine}`}
                  </TableCell>
                  <TableCell>
                    {issue.status !== 'returned' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleReturnBook(issue.id)}
                      >
                        Return
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <BookDetailsDialog />
      </Paper>
    </Box>
  );
};

export default StudentLibrary;
