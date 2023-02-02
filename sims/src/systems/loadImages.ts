import { data } from "../data/data_9.js";
import { Texture, TextureLoader } from "../vendor/three.js";

const numImages = 5;
const loadedTextures: Texture[] = Array(numImages);
export let numLoadedTextures = 0;

const tl = new TextureLoader();

const baseUrl = "https://sketchery-store.nyc3.cdn.digitaloceanspaces.com/";
async function loadImagesInBg() {
  const loadCalls = data.images
    .slice(0, numImages)
    .map((img) => `${baseUrl}${img.new}`)
    .map((u) =>
      tl.loadAsync(u).then((x) => {
        loadedTextures[numLoadedTextures++] = x;
        return x;
      })
    );
  const textures = await Promise.all(loadCalls);
  console.log(textures);
}

loadImagesInBg();
export async function getTexture(requestedTexture: number): Promise<Texture> {
  while (numLoadedTextures <= requestedTexture) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return loadedTextures[requestedTexture];
}
