import React, { useState, useEffect } from 'react';
import PredefineSyllabus from '../../UnbickSchooling/PredefineSyllabus';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { getApiUrl } from '../../../config/apiConfig';

const StudentPredefineSyllabus = () => {
  const [progressStats, setProgressStats] = useState({
    completedTopics: 0,
    totalTopics: 0,
    nextMilestone: '',
    estimatedCompletion: ''
  });

  const [learningPath, setLearningPath] = useState({
    currentTopic: null,
    nextTopics: [],
    completedTopics: [],
    assessmentScores: {},
    skillProgress: {}
  });

  useEffect(() => {
    // Fetch progress stats from an API or calculate based on syllabus data
    const fetchProgressStats = async () => {
      // Example data fetching logic
      const response = await fetch(getApiUrl('/api/v1/student/progress'));
      const data = await response.json();
      setProgressStats(data);
    };

    fetchProgressStats();
  }, []);

  useEffect(() => {
    const fetchLearningProgress = async () => {
      try {
        const response = await fetch(getApiUrl('/api/v1/student/learning-progress'));
        const data = await response.json();
        setLearningPath(data);
      } catch (error) {
        console.error('Error fetching learning progress:', error);
      }
    };

    fetchLearningProgress();
  }, []);

  const renderSkillProgress = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Skill Development</Typography>
      {Object.entries(learningPath.skillProgress).map(([skill, progress]) => (
        <Box key={skill}>
          <Typography>{skill}</Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      ))}
    </Box>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <PredefineSyllabus role="student" />
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Progress Overview</Typography>
              <Timeline>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>Completed: {progressStats.completedTopics}/{progressStats.totalTopics}</Typography>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="secondary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>Next Milestone: {progressStats.nextMilestone}</Typography>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="secondary" />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>Estimated Completion: {progressStats.estimatedCompletion}</Typography>
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          {renderSkillProgress()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentPredefineSyllabus;