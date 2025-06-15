import React, { useState, useEffect } from 'react';
import Books from '../../UnbickSchooling/Books';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Rating,
  Card,
  CardContent,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const ParentBooks = () => {
  const [readingHistory, setReadingHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState({});
  const [filters, setFilters] = useState({
    category: 'all',
    readingLevel: 'all',
  });

  useEffect(() => {
    fetchReadingHistory();
    fetchRecommendations();
    fetchAnalytics();
  }, []);

  const fetchReadingHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/parent/reading-history');
      const data = await response.json();
      setReadingHistory(data);
    } catch (error) {
      setError('Failed to fetch reading history');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/parent/book-recommendations');
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/parent/reading-analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const viewReadingHistory = () => {
    setHistoryDialog(true);
  };

  return (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Books role="parent" onTrackProgress={(bookId) => {/* Track reading progress */}} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Reading Analytics</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Books Read: {analytics.totalBooksRead}</Typography>
                <Typography>Reading Time: {analytics.totalReadingTime} hours</Typography>
                <Typography>Average Rating: 
                  <Rating value={analytics.averageRating} readOnly />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {recommendations.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Recommended Books</Typography>
              <List>
                {recommendations.map((book) => (
                  <ListItem key={book.id}>
                    <ListItemText 
                      primary={book.title}
                      secondary={book.description}
                    />
                    <Chip label={`${book.rating}★`} color="primary" />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Reading History</DialogTitle>
            <DialogContent>
              <List>
                {readingHistory.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText 
                      primary={item.bookName}
                      secondary={`Last read: ${item.lastRead}`}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ParentBooks;