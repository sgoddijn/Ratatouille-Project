import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { processUrl } from './services/urlProcessor';
import { processPdf } from './services/pdfProcessor';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Process recipe from URL
app.post('/api/recipes/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const recipe = await processUrl(url);
    res.json(recipe);
  } catch (error) {
    console.error('Error processing URL:', error);
    res.status(500).json({ error: 'Failed to process recipe URL' });
  }
});

// Process recipe from PDF
app.post('/api/recipes/pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const recipe = await processPdf(req.file.path);
    res.json(recipe);
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: 'Failed to process recipe PDF' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 