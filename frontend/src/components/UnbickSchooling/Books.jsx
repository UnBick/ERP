import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './Books.css'; // Add your custom styles here
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Download, Preview, Search } from '@mui/icons-material';
import PDFViewer from '../common/PDFViewer';  // Change to default import
import { saveAs } from 'file-saver';
import { getApiUrl } from '../../config/apiConfig';

const Books = ({ role }) => {
  const [books, setBooks] = useState([]); // Initialize books as an empty array
  const [categories, setCategories] = useState([]); // Initialize categories as an empty array
  const [filters, setFilters] = useState({
    category: 'all',
    class: 'all',
    subject: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [pdfs, setPdfs] = useState([]); // Initialize pdfs as an empty array
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [eyeProtectMode, setEyeProtectMode] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedBookUrl, setSelectedBookUrl] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    subject: '',
    class: '',
    category: '',
    searchTerm: ''
  });
  const [readingProgress, setReadingProgress] = useState({});
  const [readingStats, setReadingStats] = useState({
    totalMinutes: 0,
    booksCompleted: 0,
    currentStreak: 0
  });
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/v1/books'));
        setBooks(response.data.books || []); // Ensure books is always an array
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/v1/categories'));
        setCategories(response.data.categories || []); // Ensure categories is always an array
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchPdfs = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/v1/pdfs'));
        setPdfs(response.data.pdfs || []); // Ensure PDFs is always an array
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      }
    };

    fetchBooks();
    fetchCategories();
    fetchPdfs();
  }, []);

  const handleViewPdf = (pdf) => {
    setSelectedPdf(pdf);
  };

  const toggleEyeProtectMode = () => {
    setEyeProtectMode(!eyeProtectMode);
  };

  const handleUploadBook = async (formData) => {
    try {
      const response = await fetch(getApiUrl('/api/v1/books/upload'), {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      fetchBooks();
      setAlert({ type: 'success', message: 'Book uploaded successfully' });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleBulkUpload = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('books', file);
    });
    // Implementation
  };

  const handlePreview = (bookUrl) => {
    setSelectedBookUrl(bookUrl);
    setViewerOpen(true);
  };

  // Add necessary state and functions for managing books
  const handleAddBook = () => {/* Implementation */};
  const handleEditBook = (book) => {/* Implementation */};
  const handleDeleteBook = (bookId) => {/* Implementation */};
  const handleDownload = (bookUrl) => {/* Implementation */};

  const handleTrackProgress = async (bookId, progress) => {
    try {
      await fetch('/api/books/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, progress })
      });
      fetchReadingStats();
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  };

  const handleCreateCollection = async (name, books) => {
    try {
      const response = await fetch(getApiUrl('/api/v1/books/collections'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, books })
      });
      const data = await response.json();
      setCollections([...collections, data]);
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <div className={`books-container ${eyeProtectMode ? 'eye-protect' : ''}`}>
          <h1>Books</h1>
          <button onClick={toggleEyeProtectMode}>
            {eyeProtectMode ? 'Disable' : 'Enable'} Eye Protect Mode
          </button>
          {role === 'admin' && (
            <div>
              <h2>Upload PDF</h2>
              <form action="/api/pdfs/upload" method="post" encType="multipart/form-data">
                <input type="text" name="class" placeholder="Class" required />
                <input type="text" name="subject" placeholder="Subject" required />
                <input type="text" name="title" placeholder="Title" required />
                <input type="file" name="pdf" accept="application/pdf" required />
                <button type="submit">Upload</button>
              </form>
            </div>
          )}
          <div className="pdf-list">
            {pdfs.map((pdf) => (
              <div key={pdf._id} className="pdf-item">
                <h3>{pdf.title}</h3>
                <p>Class: {pdf.class}</p>
                <p>Subject: {pdf.subject}</p>
                <button onClick={() => handleViewPdf(pdf)}>View PDF</button>
              </div>
            ))}
          </div>
          {selectedPdf && (
            <div className="pdf-viewer">
              <h2>{selectedPdf.title}</h2>
              <Document file={`/api/pdfs/view/${selectedPdf._id}`}>
                <Page pageNumber={1} />
              </Document>
            </div>
          )}
        </div>
        {/* Search and Filter Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Add filter components */}
        </Grid>

        {/* Book Grid */}
        <Grid container spacing={2}>
          {books && books.length > 0 ? (
            books.map(book => (
              <Grid item xs={12} sm={6} md={4} key={book.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={book.coverImage}
                    alt={book.title}
                  />
                  <CardContent>
                    <Typography variant="h6">{book.title}</Typography>
                    <Typography variant="body2">{book.description}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button onClick={() => handlePreview(book.url)}>Preview</Button>
                    <Button onClick={() => handleDownload(book)}>Download</Button>
                    {role === 'admin' && (
                      <>
                        <Button onClick={() => handleEditBook(book)}>Edit</Button>
                        <Button onClick={() => handleDeleteBook(book.id)}>Delete</Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1">No books available</Typography>
          )}
        </Grid>

        {/* PDF Viewer Dialog */}
        <PDFViewer
          open={viewerOpen}
          url={selectedBookUrl}
          onClose={() => setViewerOpen(false)}
        />

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          {/* Dialog content */}
        </Dialog>

        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            {/* Existing book grid */}
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Reading Stats</Typography>
                <Box sx={{ mt: 2 }}>
                  {/* Reading statistics */}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Books;
