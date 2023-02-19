import { getMetadata } from "../../data/data_9.js";
import { messageToCallStack } from "../../utils.js";
import { TextureLoader } from "../../vendor/three.js";
export const imageSelection = [
    162, 415, 189, 258, 875, 28, 34, 640, 193, 333, 769, 148, 278, 351, 372, 347,
    168, 658, 31, 470, 490, 328, 64, 886, 362, 485, 446, 820, 108, 306, 488, 392,
    588, 483, 821, 216, 332, 176, 99, 86, 687, 143, 849, 824, 793, 215, 210, 423,
    713, 641, 315, 376, 20, 211, 561, 228, 717, 734, 167, 249, 380, 844, 127, 373,
    675, 194, 94, 426, 191, 195, 587, 324, 264, 676, 202, 566, 331, 521, 481, 634,
    269, 181, 233, 265, 621, 395, 643, 290, 540, 823, 89, 817, 519, 26, 790, 723,
    17, 308, 316, 437, 650, 262, 346, 605, 770, 492, 577, 393, 121, 613, 656, 683,
    382, 450, 706, 756, 759, 800, 293, 147, 554, 177, 682, 41, 692, 152, 574, 73,
    40, 757, 170, 727, 609, 251, 311, 611, 227, 858, 454, 368, 59, 62, 863, 515,
    107, 764, 411, 218, 254, 11, 91, 872, 788, 575, 188, 341, 513, 812, 624, 381,
    190, 869, 358, 90, 867, 102, 84, 795, 449, 593, 629, 445, 112, 601, 422, 440,
    142, 245, 14, 247, 767, 460, 845, 840, 749, 240, 1, 733, 129, 2, 310, 895,
    259, 644, 704, 401, 851, 831, 646, 53, 620, 731, 651, 270, 545, 37, 205, 412,
    828, 571, 482, 378, 816, 883, 721, 207, 847, 118, 523, 154, 881, 725, 666,
    818, 743, 766, 225, 404, 737, 363, 529, 387, 672, 596, 289, 552, 768, 155,
    198, 92, 742, 705, 307, 631, 710, 517, 627, 369, 616, 364, 7, 44, 116, 230,
    772, 384,
];
const numImages = imageSelection.length;
const loadedTextures = Array(numImages);
const imageToTextureId = {};
export let numLoadedTextures = 0;
const tl = new TextureLoader();
const baseUrl = "https://sketchery-store.nyc3.cdn.digitaloceanspaces.com/";
const msg = `
I am trying to be bare and vulnerable with this art piece,
but sometimes my sketchbooks also serve as a journal,
and it is important for to be able to write things down,
just for me,
I usually just discard temporary journal pages,
but sometimes I have a good doodle in the margins,
or I just scan it in without realizing it is private,
Originally I just intended to redact names,
But to you the viewer is there really,
much a difference between a redacted name,
and a redacted page`;
function loadImage(i) {
    const u = `${baseUrl}/${i.new}`;
    return tl
        .loadAsync(u)
        .then((x) => {
        const idx = numLoadedTextures++;
        imageToTextureId[i.new] = idx;
        loadedTextures[idx] = x;
        return x;
    })
        .catch((error) => {
        if (getMetadata(u).flag?.includes("PRIVATE")) {
            messageToCallStack(msg, `Tried to access private file ${u}`);
        }
    });
}
async function loadImagesInBg() {
    const loadCalls = imageSelection
        .map((img) => getMetadata(`${img}.jpg`))
        .map(loadImage);
    const textures = await Promise.all(loadCalls);
    console.log(`textures loaded by ${performance.now()}`);
}
loadImagesInBg();
export async function getTexture(requestedTexture) {
    while (numLoadedTextures <= requestedTexture) {
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    return loadedTextures[requestedTexture];
}
export function getTextureByName(name) {
    const idx = imageToTextureId[name];
    if (imageToTextureId[name] === undefined) {
        console.error(name);
        return loadedTextures[0];
    }
    return loadedTextures[imageToTextureId[name]];
}
const spawnedImages = [];
export function getRandomImageName() {
    const loadedImages = Object.keys(imageToTextureId);
    let r = Math.floor(Math.random() * loadedImages.length);
    for (let i = 0; i < 100 && spawnedImages.includes(r); ++i) {
        r = Math.floor(Math.random() * loadedImages.length);
    }
    spawnedImages.push(r);
    return loadedImages[r];
}
export function getRandomTexture() {
    const i = Math.floor(Math.random() * numLoadedTextures);
    return loadedTextures[i];
}
export function getImageSourceURL(imageNum) {
    return `${baseUrl}${imageNum}`;
}
