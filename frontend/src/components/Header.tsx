import React from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 0, cursor: 'pointer', mr: 4 }}
          onClick={() => navigate('/')}
        >
          Ratatouille
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/recipes')}
          >
            Recipes
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/meal-plan')}
          >
            Meal Plan
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/shopping-list')}
          >
            Shopping List
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;