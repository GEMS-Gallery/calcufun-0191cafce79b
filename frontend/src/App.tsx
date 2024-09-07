import React, { useState } from 'react';
import { Button, Grid, Paper, TextField, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { backend } from 'declarations/backend';

const CalculatorPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 300,
}));

const DisplayTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    textAlign: 'right',
    fontSize: '1.5rem',
    fontFamily: 'monospace',
  },
}));

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [operation, setOperation] = useState('');
  const [firstNumber, setFirstNumber] = useState<number | null>(null);
  const [waitingForSecondNumber, setWaitingForSecondNumber] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const handleNumberClick = (num: string) => {
    if (waitingForSecondNumber) {
      setDisplay(num);
      setWaitingForSecondNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperationClick = (op: string) => {
    setOperation(op);
    setFirstNumber(parseFloat(display));
    setWaitingForSecondNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setOperation('');
    setFirstNumber(null);
    setWaitingForSecondNumber(false);
  };

  const handleCalculate = async () => {
    if (firstNumber !== null && operation) {
      setCalculating(true);
      try {
        const result = await backend.calculate(operation, firstNumber, parseFloat(display));
        setDisplay(result.toString());
      } catch (error) {
        setDisplay('Error');
      } finally {
        setCalculating(false);
      }
      setOperation('');
      setFirstNumber(null);
    }
  };

  return (
    <CalculatorPaper elevation={3}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <DisplayTextField
            fullWidth
            variant="outlined"
            value={display}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'].map((num) => (
          <Grid item xs={3} key={num}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleNumberClick(num)}
            >
              {num}
            </Button>
          </Grid>
        ))}
        {['+', '-', '*', '/'].map((op) => (
          <Grid item xs={3} key={op}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={() => handleOperationClick(op)}
            >
              {op}
            </Button>
          </Grid>
        ))}
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleCalculate}
            disabled={calculating}
          >
            {calculating ? <CircularProgress size={24} /> : '='}
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleClear}
          >
            C
          </Button>
        </Grid>
      </Grid>
    </CalculatorPaper>
  );
};

export default App;