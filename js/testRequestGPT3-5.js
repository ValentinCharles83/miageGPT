import { API_KEY, API_KEYStableDiffusion } from './config.js';
import { getImageFromDallE, getImageFromStableDiffusion } from './dallE.js';


const endpointURL = 'https://api.openai.com/v1/chat/completions';

let outputElement, submitButton, inputElement, historyElement, butonElement;
let imageSizeElement, imageCountElement; // nouvel élément pour définir la taille et le nombre d'images


window.onload = init;

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    butonElement = document.querySelector('button');
    butonElement.onclick = clearInput;

    imageSizeElement = document.querySelector('#image-size'); // sélectionne l'élément de taille d'image
    imageCountElement = document.querySelector('#image-count'); // sélectionne l'élément de compte d'image

    let newChatButton = document.querySelector('.new-chat-button');
    newChatButton.onclick = newChat;
}

function clearInput() {
    inputElement.value = '';
}

function showLoading() {
    document.getElementById('image-loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('image-loading').style.display = 'none';
}

function updateHistory(prompt, response) {
    const historyItem = document.createElement('button');
    historyItem.textContent = prompt.slice(0, 15) + '...'; // Utilisez les premiers caractères du prompt comme titre du bouton
    historyItem.onclick = () => displayHistory(prompt, response);
    historyItem.classList.add('history-item');

    historyElement.prepend(historyItem); // Ajoute le bouton en haut de la liste d'historique
}

function displayHistory(prompt, response) {
    outputElement.innerHTML = ''; // Efface le contenu actuel

    const promptElement = document.createElement('p');
    const responseElement = document.createElement('p');

    promptElement.textContent = `Prompt: ${prompt}`;
    responseElement.textContent = `Response: ${response}`;

    outputElement.appendChild(promptElement);
    outputElement.appendChild(responseElement);
}


// Fonction pour obtenir la réponse du modèle GPT et afficher le texte dans l'interface.
async function handleTextResponse(prompt) {
    const response = await getResponseFromGPT(prompt);
    const pElementChat = document.createElement('p');
    pElementChat.textContent = response;
    outputElement.append(pElementChat);

    updateHistory(prompt, response);
}

// Fonction pour obtenir la réponse du modèle GPT et la vocaliser.
async function handleSpeechResponse(prompt) {
    const response = await getResponseFromGPT(prompt);
    const promptText = prompt.substring('/speech '.length);
    const fullResponse = `${promptText}\n${response}`;
    textToSpeech(fullResponse);

    updateHistory(prompt, response);
}


async function getMessage() {
    let prompt = inputElement.value;
    prompt = prompt.toLowerCase();

    if (prompt.startsWith('/speech ')) {
        handleSpeechResponse(prompt);
    }

    else if (prompt.startsWith('/image ')) {
        const size = imageSizeElement.value; 
        const count = parseInt(imageCountElement.value); 

        showLoading();  // Affiche la barre de chargement
        const images = await getImageFromDallE(prompt, size, count); 
        hideLoading();  // Cache la barre de chargement après la fin de la requête
        console.log(images);

        images.data.forEach(imageObj => {
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');

            const imgElement = document.createElement('img');
            imgElement.src = imageObj.url;

            imageContainer.append(imgElement);

            outputElement.append(imageContainer);
        });
    } else if (prompt.startsWith('/stable-diffusion ')) {
        const size = imageSizeElement.value; 
        const count = parseInt(imageCountElement.value);

        showLoading();  // Affiche la barre de chargement
        const images = await getImageFromStableDiffusion(prompt, size, count); 
        hideLoading();  // Cache la barre de chargement après la fin de la requête
        console.log(images);

        images.forEach(imageObj => {
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-container');

            const imgElement = document.createElement('img');
            imgElement.src = imageObj.url;

            imageContainer.append(imgElement);

            outputElement.append(imageContainer);
            if (data.artifacts) {
                return data.artifacts.map(artifact => ({ url: `data:image/png;base64,${artifact.base64}` }));
            } else {
                console.log('No artifacts in response:', data);
                return [];
            }

        });
    } else {
        handleTextResponse(prompt);
    }

    inputElement.value = '';
}

async function getResponseFromGPT(prompt) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+ API_KEY
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: prompt
            }],
            max_tokens: 100
        })
    };
    try {
        const response = await fetch(endpointURL, options);
        const data = await response.json();
        const chatGptReponseTxt = data.choices[0].message.content;
        return chatGptReponseTxt;
    } catch (error) {

        console.log(error);
    }
}


function textToSpeech(text) {
    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.lang = 'fr-FR';
    window.speechSynthesis.speak(msg);
}

function newChat() {
    // Réinitialise la zone de sortie
    outputElement.innerHTML = '';
}



