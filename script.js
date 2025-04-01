$(document).on("click", "#chatbotButton", function () {
    $("#chatbotUI").toggle(); // Toggles the visibility of the chatbotUI div
});

$(document).on("click", "#langButton", function () {
    $("#langUI").toggle(); // Toggles the visibility of the langUI div
});

$(document).on("click", "#speak", init);

let recognition;

// Initialize the lang variable
let lang = "English"; // Default language

// Set the lang variable when a language button is clicked
$(document).on("click", "#english", function () {
    lang = "English";
    console.log("Language set to English");
});
$(document).on("click", "#french", function () {
    lang = "French";
    console.log("Language set to French");
});
$(document).on("click", "#spanish", function () {
    lang = "Spanish";
    console.log("Language set to Spanish");
});

// Request microphone permissions when the page finishes loading
$(document).ready(function () {
    // Check if the browser supports getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
                console.log("Microphone access granted.");
                // Stop the stream immediately after permission is granted
                stream.getTracks().forEach(track => track.stop());
            })
            .catch(function (error) {
                console.error("Microphone access denied:", error);
                alert("Microphone access is required for speech recognition to work.");
            });
    } else {
        console.error("getUserMedia is not supported in this browser.");
        alert("Your browser does not support microphone access. Please use a compatible browser.");
    }
});

function init() {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
        alert("Speech recognition is not supported on this browser. Please use Chrome on Android or a compatible browser.");
        return;
    }

    $("#speak").prop("disabled", true);
    $("#speak").text("Speaking ...");
    $("#speak").addClass("btn-outline-danger");
    $("#speak").removeClass("btn-outline-primary");

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        $("#query").val(transcript);
        $("#submit").click();
        console.log(`Confidence: ${event.results[0][0].confidence}`);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        resetSpeakButton();
    };

    recognition.onend = () => {
        console.log("Speech recognition ended.");
        resetSpeakButton();
    };
}

function resetSpeakButton() {
    if (recognition) {
        recognition.stop();
    }
    $("#speak").prop("disabled", false);
    $("#speak").text("Speak");
    $("#speak").removeClass("btn-outline-danger");
    $("#speak").addClass("btn-outline-primary");
}

// Use jQuery for "click" event
$(document).on("click", "#submit", function (event) {
    handleSubmit(event);
});

// Use plain JavaScript for "touchstart" to set passive: false
document.getElementById("submit").addEventListener("touchstart", function (event) {
    handleSubmit(event);
}, { passive: false }); // Explicitly set passive to false

function handleSubmit(event) {
    event.preventDefault(); // Prevent default form submission behavior

    var text = $("#query").val().trim(); // Ensure the text is properly trimmed

    if (text === "") {
        alert("Write something!");
    } else {
        $("#output").prepend("<br />");
        $("#output").prepend("[🙂] " + text);
        $("#query").val("");

        $("#submit").prop("disabled", true);
        $("#submit").text("Loading ...");

        console.log("Sending AJAX request with text:", text);

        $.ajax({
            url: 'https://code.schoolofdesign.ca/api/openai/v1/chat/completions',
            crossDomain: true,
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({
                'model': 'gpt-4o-mini',
                'messages': [
                    {
                        'role': 'system',
                        'content': `You are my expert advisor specialized in the George Brown College School of Design. Respond only in ${lang}. If the language is unclear, respond in English. Keep the response to one or two sentences max.`},
                    {
                        'role': 'user',
                        'content': text
                    },
                    {
                        'role': 'assistant',
                        'content': 'Refer to the following conversation. ' + $("#output").text()
                    }
                ]
            })
        }).done(function (response) {
            console.log("AJAX request successful. Response:", response);

            $("#submit").prop("disabled", false);
            $("#submit").text("Submit");

            if (response && response.choices && response.choices[0] && response.choices[0].message) {
                var reply = response.choices[0].message.content;

                $("#output").prepend("<br />");
                $("#output").prepend("[🪙] " + reply);

                const apiKey = document.getElementById('api-key-input').value;
                const voiceId = document.getElementById('voice-id-input').value;

                getElevenLabsSpeech(reply, apiKey, voiceId, function(audioUrl) {
                    playAudio(audioUrl);
                });

                resetSpeakButton(); // Reset the speak button after processing the response
            } else {
                console.error("Unexpected response format:", response);
                alert("Failed to process the response. Please try again.");
            }
        }).fail(function (xhr, status, error) {
            console.error("AJAX request failed:", status, error);
            console.error("Response text:", xhr.responseText);

            alert("Failed to get a response. Please try again.");
            $("#submit").prop("disabled", false);
            $("#submit").text("Submit");
        });
    }
}

function languageSet() {
    var lang = document.getElementById("lang").value;
}

javascript:document.querySelectorAll("*").forEach(e=>{e.style["touch-action"]="manipulation"}),new MutationObserver(e=>{e.forEach(function(e){for(var o=0;o<e.addedNodes.length;o++)e.addedNodes[o].style["touch-action"]="manipulation"})}).observe(document.body,{childList:!0,subtree:!0});