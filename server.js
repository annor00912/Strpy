
const express = require('express');
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');
const util = require('util');
const cors = require('cors');

const app = express();
const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});


app.use(cors());
app.use(express.json());

app.post('/generate-audio', async (req, res) => {
  const { text } = req.body;
  const request = {
    input: { text },
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' }
  };
  try {
    const [response] = await client.synthesizeSpeech(request);
    const fileName = `output-${Date.now()}.mp3`;
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(`./audios/${fileName}`, response.audioContent, 'binary');
    res.json({ url: `https://YOUR_BACKEND_URL/audios/${fileName}` });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.use('/audios', express.static('audios'));

app.listen(3000, () => console.log('TTS server running on http://localhost:3000'));
