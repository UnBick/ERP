import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from '@mui/material';
import { Close, NavigateNext, NavigateBefore, Zoom, Brightness4, Bookmark, TextFields } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const BookViewer = ({ open, onClose, bookUrl, bookType }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [fontSize, setFontSize] = useState('medium');
  const [annotations, setAnnotations] = useState([]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleAddBookmark = () => {
    const newBookmark = { page: pageNumber, note: '', timestamp: new Date() };
    setBookmarks([...bookmarks, newBookmark]);
  };

  const handleAnnotation = (event) => {
    const newAnnotation = {
      page: pageNumber,
      position: { x: event.pageX, y: event.pageY },
      text: ''
    };
    setAnnotations([...annotations, newAnnotation]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Book Preview
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ 
        backgroundColor: darkMode ? '#303030' : '#ffffff',
        transition: 'background-color 0.3s'
      }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <IconButton onClick={() => setZoom(prev => prev + 10)}>
            <Zoom />
          </IconButton>
          <IconButton onClick={() => setDarkMode(!darkMode)}>
            <Brightness4 />
          </IconButton>
          <IconButton onClick={handleAddBookmark}>
            <Bookmark />
          </IconButton>
          <IconButton onClick={handleAnnotation}>
            <TextFields />
          </IconButton>
        </Box>
        {bookType === 'pdf' ? (
          <Document
            file={bookUrl}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={pageNumber} />
          </Document>
        ) : (
          <iframe
            src={bookUrl}
            style={{ width: '100%', height: '80vh' }}
            title="Book Preview"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookViewer;
