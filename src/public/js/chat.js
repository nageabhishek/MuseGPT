const socket = io();

let currentChat = null;

const newChatBtn = document.getElementById("newChatBtn");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const chatHistory = document.getElementById("chatHistory");
const welcome = document.getElementById("welcome");


// New Chat

newChatBtn.addEventListener("click", async ()=>{

    const title = prompt("Enter Chat Name");

    if(!title){

        return;

    }

    const response = await fetch("/api/chat",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            title:title

        })

    });


    const data = await response.json();

    currentChat = data.chat._id;

    // // Save chat id in browser
    // localStorage.setItem("currentChat", currentChat);


    chatHistory.innerHTML += `

        <div class="chat-item"
        data-id="${data.chat._id}">

            ${data.chat.title}

        </div>

    `;


    messages.innerHTML="";

});




// Send Message

sendBtn.addEventListener("click",()=>{

    const text=messageInput.value.trim();

    if(!text){

        return;

    }

    if(!currentChat){

        alert("Please create chat first");

        return;

    }


    if(welcome){

        welcome.style.display="none";

    }


    sendBtn.disabled=true;


    messages.innerHTML += `

        <div class="user-message">

            ${text}

        </div>

    `;



    socket.emit("question",{

        chat:currentChat,

        content:text

    });

    

    messageInput.value="";


    messages.scrollTop=messages.scrollHeight;

});




// Receive Answer

socket.on("answer",(data)=>{


    messages.innerHTML += `

        <div class="ai-message">

            <pre>${data.content}</pre>

        </div>

    `;


    sendBtn.disabled=false;


    messages.scrollTop=messages.scrollHeight;


});




// Enter to Send

messageInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();

        sendBtn.click();

    }

});

// local storage
// window.addEventListener("DOMContentLoaded",()=>{

//     const savedChat = localStorage.getItem("currentChat");

//     if(savedChat){

//         currentChat = savedChat;

//         console.log("Restored Chat :", currentChat);

//     }

// });