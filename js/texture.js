/**
 * Loads an image from a url, and returns it as a promise.
 * 
 * Borrowed from Gugol's Stack Overflow answer: https://stackoverflow.com/a/39415783/1953971
 * 
 * @param {string} path The url from which to load the image.
 * @returns {Promise<Image>} A promise of the image.
 */
export default function loadImage(path) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = function() {
            resolve(img);
        }
        img.onerror = function() {
            reject(path);
        }
        img.src = path;
    });
}