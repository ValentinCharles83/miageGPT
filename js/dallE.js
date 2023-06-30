import { API_KEY,API_KEYStableDiffusion } from './config.js';
//import {updateHistory} from './testRequestGPT3-5.js';

export async function getImageFromDallE(prompt, size, count) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            size: size, 
            n: count 
        })
    }

    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', options);
        console.log('Response:', response);
        const data = await response.json();
        console.log('Data:', data);
        return data;
    } catch (error) {
        console.log('Error in getImageFromDallE:', error);
    }

    updateHistory(prompt, response);
}


export async function getImageFromStableDiffusion(prompt, size, count) {
    const API_KEYStableDiffusion = "sk-4V60JycvCaU6ZIT3euD8PRU7fIDom2RANWGGQueAwBEcjNIE"; // assurez-vous d'avoir défini cette variable d'environnement

    if (!API_KEYStableDiffusion) throw new Error('Missing Stability API key.');

    const apiHost = 'https://api.stability.ai'; // remplacez ceci par votre hôte d'API si différent
    const engineId = 'stable-diffusion-v1-5';
    const url = `${apiHost}/v1/generation/${engineId}/text-to-image`;

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${API_KEYStableDiffusion}`
        },
        body: JSON.stringify({
            text_prompts: [
                {
                    text: prompt
                },
            ],
            cfg_scale: 7,
            clip_guidance_preset: 'FAST_BLUE',
            height: 512,
            width: 512,
            samples: count,
            steps: 30,
        })
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Non-200 response: ${await response.text()}`);
        }

        const data = await response.json();
        return data.artifacts.map(artifact => ({ url: `data:image/png;base64,${artifact.base64}` })); // Vous pourriez avoir besoin de modifier cette ligne en fonction de la façon dont vous souhaitez traiter les images
    } catch (error) {
        console.log(error);
    }

    updateHistory(prompt, response);
}

