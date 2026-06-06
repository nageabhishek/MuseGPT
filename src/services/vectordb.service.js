// Import the Pinecone library
const{ Pinecone } =require( '@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({apiKey:process.env.PINECONE_KEY});
const gptIndex=pc.index('muse-gpt')

async function createMemory({vectors,metadata,messageaid}) {

    await gptIndex.upsert({
        records:[{
            id:messageaid,
            values:vectors,
            metadata

        }]
    })
    
}

async function queryMemory({queryVector,limit=5,metadata}){
    const data=await gptIndex.query({
        vector:queryVector,
        topK:limit,
        filter:metadata?metadata:undefined,
        includeMetadata:true
    })
    return data.matches
}

module.exports={
    createMemory,
    queryMemory
}