const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const client = new textToSpeech.TextToSpeechClient();

async function generateAudio(ssmlContent, outputFile) {
    const request = {
        input: { ssml: ssmlContent },
        voice: { languageCode: 'en-US', name: 'en-US-Wavenet-F' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFile, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${outputFile}`);
}

module.exports = { generateAudio };
