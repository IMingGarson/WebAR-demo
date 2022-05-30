let worker = null;

const voice = {
    // (A) INIT VOICE COMMAND
    wrap : null, // HTML DEMO <DIV> WRAPPER
    btn : null, // HTML DEMO BUTTON
    recog : null, // SPEECH RECOGNITION OBJECT
    init : () => {
        // (A1) GET HTML ELEMENTS
        voice.wrap = document.getElementById("vwrap");
        voice.btn = document.getElementById("vbtn");
    
        // (A2) GET MIC ACCESS PERMISSION
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                // (A3) SPEECH RECOGNITION OBJECT & SETTINGS
                let SpeechRecognition = null;
                if ('webkitSpeechRecognition' in window && typeof webkitSpeechRecognition === 'function') {
                    SpeechRecognition = window.webkitSpeechRecognition;
                    alert('support webkitSpeechRecognition');
                } else if ('SpeechRecognition' in window && typeof SpeechRecognition === 'function') {
                    SpeechRecognition = window.SpeechRecognition;
                    alert('support SpeechRecognition');
                } else {
                    alert('not support');
                }
                
                voice.recog = new SpeechRecognition();
                voice.recog.lang = "zh-TW";
                voice.recog.continuous = false;
                voice.recog.interimResults = false;

                // (A4) ON SPEECH RECOGNITION - RUN CORRESPONDING COMMAND
                voice.recog.onresult = (evt) => {
                    let said = evt.results[0][0].transcript;
                    if (worker) {
                        alert(said);
                        if (cmd[said]) { 
                            cmd[said](); 
                        } else { 
                            said += " (command not found)"; 
                        }
                    }
                    voice.wrap.innerHTML = said;
                    voice.stop();
                };
            
                // (A5) ON SPEECH RECOGNITION ERROR
                voice.recog.onerror = (err) => { console.error(evt); };
            
                // (A6) READY!
                voice.btn.disabled = false;
                voice.stop();
            })
        .catch((err) => {
            console.error(err);
            voice.wrap.innerHTML = "Please enable access and attach a microphone.";
        });
    },
    
    // (B) START SPEECH RECOGNITION
    start : () => {
        voice.recog.start();
        voice.btn.onclick = voice.stop;
        voice.btn.value = "Speak Now Or Click Again To Cancel";
        // worker = new Worker('../workers/ThreeJSWorker.js');
    },
    
    // (C) STOP/CANCEL SPEECH RECOGNITION
    stop : () => {
        voice.recog.stop();
        voice.btn.onclick = voice.start;
        voice.btn.value = "Press To Speak";
        // worker.terminate();
    }
};

const speechCommand = {
    "坐下" : () => {
        worker.postMessage('sit');
    },
    "起來" : () => {
        worker.postMessage('up');
    },
    "棉花糖" : () => {
        worker.postMessage('marshmellow');
    }
};

function send()
{
    worker = new Worker('../workers/ThreeJSWorker.js');
    worker.postMessage('sit');
}