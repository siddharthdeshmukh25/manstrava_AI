const micBtn = document.getElementById("mic-btn");
const stopBtn = document.getElementById("stop-btn");
const aiCircle = document.getElementById("ai-circle");
const userTextEl = document.getElementById("user-text");
const aiTextEl = document.getElementById("ai-text");
const statusText = document.querySelector(".status-indicator");

let recognition;
let vibrationInterval;
let typeInterval;

// 1. Setup Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
} else {
    alert("Please use Google Chrome");
}
micBtn.onclick = () => {
    if (!recognition) return;
    try {
        window.speechSynthesis.cancel(); 
        stopVibration();
        
        recognition.start();
        micBtn.classList.add("listening");
        statusText.innerText = "LISTENING...";
        aiTextEl.innerText = ""; 
    } catch(e) { console.log("Mic busy"); }
};

recognition.onresult = async (event) => {
    micBtn.classList.remove("listening");
    statusText.innerText = "PROCESSING...";
    
    const command = event.results[0][0].transcript;
    userTextEl.innerText = `YOU: ${command}`;
    
    await getAIResponse(command);
};

stopBtn.onclick = () => {
    window.speechSynthesis.cancel(); 
    stopVibration(); 
    clearInterval(typeInterval); 
    statusText.innerText = "STOPPED";
};
async function getAIResponse(text) {
    try {
        // 👇 YAHAN CHANGE KIYA HAI (Localhost hata diya)
        const response = await fetch("/.netlify/functions/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        
        speakAndAnimate(data.reply);
        
    } catch (err) {
        aiTextEl.innerText = "Server Error.";
        statusText.innerText = "OFFLINE";
        console.error("Connection Error:", err);
    }
}

function speakAndAnimate(text) {
   
    stopBtn.classList.remove("hidden");
    micBtn.classList.add("hidden"); 

    const utterance = new SpeechSynthesisUtterance(text);
    let i = 0;
    aiTextEl.textContent = ""; 
    statusText.innerText = "SPEAKING";

    typeInterval = setInterval(() => {
        if (i < text.length) {
            aiTextEl.textContent += text.charAt(i);
            
            const chatArea = document.querySelector('.chat-area');
            chatArea.scrollTop = chatArea.scrollHeight;
            i++;
        } else {
            clearInterval(typeInterval);
        }
    }, 25); 
    vibrationInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
            const scale = 1 + Math.random() * 0.2; 
            aiCircle.style.transform = `scale(${scale})`;
            aiCircle.style.boxShadow = `0 0 ${20 * scale}px var(--cyan)`;
        } else {
            stopVibration();
        }
    }, 100);

    utterance.onend = () => {
        stopVibration();
    };

    window.speechSynthesis.speak(utterance);
}

function stopVibration() {
    clearInterval(vibrationInterval);
    clearInterval(typeInterval);
    aiCircle.style.transform = `scale(1)`;
    aiCircle.style.boxShadow = `0 0 20px var(--cyan)`;
    stopBtn.classList.add("hidden");
    micBtn.classList.remove("hidden");
    statusText.innerText = "SYSTEM READY";
}