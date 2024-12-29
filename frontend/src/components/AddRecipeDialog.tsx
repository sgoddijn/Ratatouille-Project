import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface AddRecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (recipeData: { url?: string, file?: File }) => void;
}

const AddRecipeDialog = ({ open, onClose, onSubmit }: AddRecipeDialogProps) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (url || file) {
      onSubmit({ 
        url: url || undefined, 
        file: file || undefined 
      });
      setUrl('');
      setFile(null);
      onClose();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Recipe</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <TextField
            fullWidth
            label="Recipe URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/recipe"
            sx={{ mb: 3 }}
          />
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Or upload a PDF
          </Typography>
          
          <input
            accept="application/pdf"
            style={{ display: 'none' }}
            id="recipe-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="recipe-file">
            <Button variant="outlined" component="span">
              Choose PDF File
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {file.name}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!url && !file}
        >
          Add Recipe
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRecipeDialog; 