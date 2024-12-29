import { Container, Typography, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const DayCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const MealPlan = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Next Week's Meal Plan
      </Typography>
      
      {days.map((day) => (
        <DayCard key={day} elevation={2}>
          <Typography variant="h6" component="h2">
            {day}
          </Typography>
          <Typography color="text.secondary">
            Drop a recipe here
          </Typography>
        </DayCard>
      ))}
    </Container>
  );
};

export default MealPlan; 