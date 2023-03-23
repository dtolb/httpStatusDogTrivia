require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Set your OpenAI API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


app.post("/check-description", async (req, res) => {
  try {
    const { statusCode, description } = req.body;
    const userDescription = description.trim();

    const prompt = `
      Respond with a parseable JSON object with the keys "result", "furtherDetail", and "realWorld".

      For the "result" key, set the value to true if the description "${userDescription}" would adequately describe the HTTP status code ${statusCode}. Set the value to false if the description is not good enough.

      For the "furtherDetail", set the value to a paragraph recommendation of why their description was good, or why it was not.

      For the "realWorld" key, set the value to a paragraph of a real world scenario that would cause the server to respond with the status code
    `;

    const openAIResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      stop: null,
      temperature: 0.5,
      n: 1,
      max_tokens: 250,
    });
    // const openAIResponse = await openai.Completion.create({
    //   engine: "text-davinci-002",
    //   prompt: prompt,
    //   max_tokens: 100,
    //   n: 1,
    //   stop: null,
    //   temperature: 0.5,
    // });

    const responseText = openAIResponse.data.choices[0].text.trim();
    console.log(responseText);
    const resultJSON = JSON.parse(responseText);

    res.status(200).json(resultJSON);
  } catch (error) {
    console.error("Error processing description:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
