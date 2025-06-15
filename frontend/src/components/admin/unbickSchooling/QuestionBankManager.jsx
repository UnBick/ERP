import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import { generateQuestions } from '../../../services/aiService';

const QuestionBankManager = () => {
  const [loading, setLoading] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [parameters, setParameters] = useState({
    difficulty: 'medium',
    questionTypes: ['mcq', 'descriptive'],
    topicsToFocus: [],
    totalQuestions: 20
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verify API key on component mount
    const apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;
    if (!apiKey) {
      setError('Hugging Face API key is not configured. Please check your environment variables.');
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const questions = await generateQuestions(
        selectedSyllabus || 'General knowledge',
        selectedBooks?.join(' ') || '',
        parameters
      );
      
      setGeneratedQuestions(questions);
    } catch (error) {
      console.error('Generation Error:', error);
      setError(error.message || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (questionId, isApproved) => {
    // Implementation for reviewing questions
  };

  const handleEdit = async (questionId, updatedContent) => {
    // Implementation for editing questions
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          AI-Powered Question Bank Generator
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Configuration</Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    value={parameters.difficulty}
                    onChange={(e) => setParameters({
                      ...parameters,
                      difficulty: e.target.value
                    })}
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>

                {/* More configuration options */}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6">Generated Questions</Typography>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Box>
                    {generatedQuestions.map((question, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee' }}>
                        <Typography>{question.content}</Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={question.type} 
                            size="small" 
                            sx={{ mr: 1 }} 
                          />
                          <Chip 
                            label={question.difficulty} 
                            size="small" 
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            onClick={handleGenerate}
            disabled={loading}
          >
            Generate Questions
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuestionBankManager;
