
const express = require('express');
const fs = require('fs');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('.'));

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return await auth.getClient();
}

app.post('/save', async (req, res) => {
  const { plate, duration, timestamp } = req.body;
  if (!plate || !duration || !timestamp) return res.status(400).send('Missing data');

  try {
    const authClient = await authorize();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const spreadsheetId = 'YOUR_SHEET_ID_HERE';
    const range = 'Sheet1!A:D';

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[plate, duration, timestamp, new Date().toLocaleTimeString()]]
      }
    });

    res.status(200).send('Saved!');
  } catch (error) {
    console.error('Error writing to sheet:', error);
    res.status(500).send('Failed to write to Google Sheets');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
