var book = ePub();
var rendition;
let chapters = []

var inputElement = document.getElementById("input");

inputElement.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (window.FileReader) {
        var reader = new FileReader();
        reader.onload = openBook;
        reader.readAsArrayBuffer(file);
    }
});

function _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function openBook(e) {
    var bookData = e.target.result;

    var title = document.getElementById("title");
    var next = document.getElementById("next");
    var prev = document.getElementById("prev");

    book.open(bookData).then(() => {
        book.spine.each((chapter) => {
            console.log(chapter);
            chapter.load(book.load.bind(book))
                .then((html) => {
                    var paragraphs = html.querySelectorAll("p");
                    chapters.push(paragraphs)
                })
                .catch((err) => {
                    console.log("Error when loading Section: " + err);
                });
        });
    });

    rendition = book.renderTo("viewer", {
        width: "100%",
        height: 600
    });




    var keyListener = function (e) {

        // Left Key
        if ((e.keyCode || e.which) == 37) {
            rendition.prev();
        }

        // Right Key
        if ((e.keyCode || e.which) == 39) {
            rendition.next();
        }

    };

    rendition.display();

    rendition.on("keyup", keyListener);
    rendition.on("relocated", function (location) {
        console.log({chapters});
        speechSynthesis.cancel()
        console.log(location.start.index);
        chapters[location.start.index].forEach((paragraph, index) => {
            speak(paragraph.textContent)
        })
    });

    next.addEventListener("click", function (e) {
        rendition.next();
        e.preventDefault();
    }, false);

    prev.addEventListener("click", function (e) {
        rendition.prev();
        e.preventDefault();
    }, false);




    document.addEventListener("keyup", keyListener, false);
}

let voices
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices()
    voices = voices.map((voice) => `<p>${voice.name}</p>`)
    document.getElementById("voices").innerHTML = voices.join(" ")
}

function speak(text) {
    // Create a SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.addEventListener("end",(end) => {console.log(end);})

    // Select a voice
    utterance.voice = voices[0]; // Choose a specific voice
    utterance.pitch = 1.3
    utterance.rate = 1.5
    speechSynthesis.speak(utterance);

    // Speak the text
}


