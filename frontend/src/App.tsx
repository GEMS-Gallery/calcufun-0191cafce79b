import React, { useState, useEffect } from 'react';
import { Button, Grid, Paper, Typography, LinearProgress, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import OpacityIcon from '@mui/icons-material/Opacity';
import { backend } from 'declarations/backend';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GOAL_OUNCES = 64;

const TrackerPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 600,
  margin: 'auto',
}));

const App: React.FC = () => {
  const [waterIntake, setWaterIntake] = useState<number[]>(DAYS_OF_WEEK.map(() => 0));

  useEffect(() => {
    const fetchWaterIntake = async () => {
      const intake = await backend.getWaterIntake();
      setWaterIntake(intake);
    };
    fetchWaterIntake();
  }, []);

  const handleIncrement = async (index: number) => {
    const newIntake = [...waterIntake];
    newIntake[index] = Math.min(newIntake[index] + 8, GOAL_OUNCES);
    const updatedIntake = await backend.updateWaterIntake(index, newIntake[index]);
    setWaterIntake(updatedIntake);
  };

  const handleDecrement = async (index: number) => {
    const newIntake = [...waterIntake];
    newIntake[index] = Math.max(newIntake[index] - 8, 0);
    const updatedIntake = await backend.updateWaterIntake(index, newIntake[index]);
    setWaterIntake(updatedIntake);
  };

  return (
    <TrackerPaper elevation={3}>
      <Typography variant="h4" gutterBottom color="primary">
        Weekly Water Tracker
      </Typography>
      <Grid container spacing={2}>
        {DAYS_OF_WEEK.map((day, index) => (
          <Grid item xs={12} key={day}>
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" style={{ width: 40 }}>{day}</Typography>
              <Box flexGrow={1} mr={2}>
                <LinearProgress
                  variant="determinate"
                  value={(waterIntake[index] / GOAL_OUNCES) * 100}
                  style={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              <Button
                onClick={() => handleDecrement(index)}
                variant="contained"
                color="secondary"
                size="small"
              >
                -
              </Button>
              <Typography variant="body2" style={{ margin: '0 8px', width: 40, textAlign: 'center' }}>
                {waterIntake[index]} oz
              </Typography>
              <Button
                onClick={() => handleIncrement(index)}
                variant="contained"
                color="primary"
                size="small"
              >
                +
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center">
          <OpacityIcon color="primary" style={{ marginRight: 8 }} />
          <Typography variant="h6" color="primary">
            {waterIntake.reduce((a, b) => a + b, 0)} / {GOAL_OUNCES * 7} oz
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="textSecondary">
          Weekly Goal
        </Typography>
      </Box>
    </TrackerPaper>
  );
};

export default App;