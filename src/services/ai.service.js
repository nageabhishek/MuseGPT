const { GoogleGenAI } =require("@google/genai")

const ai = new GoogleGenAI({});

async function generateResponce(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

   return response.text
}

module.exports=generateResponce