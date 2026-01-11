const micBtn = document.getElementById("mic-btn");
const stopBtn = document.getElementById("stop-btn");
// 👇 Purana circle hata diya, naya Robot Container liya
const robotContainer = document.getElementById("robot-container");
const mouthGlow = document.querySelector(".mouth-glow"); 
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
        stopVibration(); // Reset Robot Position
        
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

// 👇 MAIN LOGIC CHANGE YAHAN HAI 👇
function speakAndAnimate(text) {
    stopBtn.classList.remove("hidden");
    micBtn.classList.add("hidden"); 

    // 1. Robot ko Center me laao (Full Body)
    robotContainer.classList.remove("idle-mode");
    robotContainer.classList.add("speaking-mode");

    const utterance = new SpeechSynthesisUtterance(text);
    let i = 0;
    aiTextEl.textContent = ""; 
    statusText.innerText = "SPEAKING";

    // Typing Effect
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

    // Vibration / Talking Animation
    vibrationInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
            // Random scaling for "Talking" effect
            const scale = 0.8 + Math.random() * 0.4; 
            if(mouthGlow) {
                mouthGlow.style.opacity = Math.random(); // Muh chamkega
                mouthGlow.style.transform = `translateX(-50%) scale(${scale})`;
            }
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

    // 2. Robot ko wapis Corner me bhejo (Mini Head)
    robotContainer.classList.remove("speaking-mode");
    robotContainer.classList.add("idle-mode");
    
    if(mouthGlow) mouthGlow.style.opacity = 0;

    stopBtn.classList.add("hidden");
    micBtn.classList.remove("hidden");
    statusText.innerText = "SYSTEM READY";
}