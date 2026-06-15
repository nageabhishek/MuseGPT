const { GoogleGenAI } =require("@google/genai")

const ai = new GoogleGenAI({});

async function generateResponce(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config:{
      temperature:0.7

    }
  })

   return response.text
}


async function generateVector(content){
  
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: content,
        config:{
          outputDimensionality:768
        }
    });

     return response.embeddings[0].values
}

module.exports={generateResponce,generateVector}