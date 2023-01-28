import { data } from "../data/data_9.js";

const numImages = 5;
export const imageDataArray: HTMLImageElement[] = new Array(numImages);
export let loadedImages = 0;

const failedImages: string[] = [];

const baseUrl = "https://sketchery-store.nyc3.cdn.digitaloceanspaces.com/";
async function loadImagesInBg() {
  const urls = data.images
    .slice(0, numImages)
    .map((img) => `${baseUrl}${img.new}`);
  const responses = await Promise.all(
    urls.map(async (u, i) => ({
      response: await fetch(u),
      i,
    }))
  );
  await Promise.all(
    responses.map(async (response) => {
      if (!response.response.ok) {
        failedImages.push(data.images[response.i].new);
        return;
      }
      const b = await response.response.blob();
      const url = URL.createObjectURL(b);

      const img = new Image();
      img.src = url;
      while (!img.complete) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      loadedImages++;
      imageDataArray[response.i] = img;
    })
  );

  console.log(
    `Texture loading complete. ${failedImages.length} images failed to load. ${loadedImages} succeeded`
  );
  console.log(failedImages);
}

await loadImagesInBg();
export async function getImage(
  requestedImage: number
): Promise<HTMLImageElement> {
  while (loadedImages <= requestedImage) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return imageDataArray[requestedImage];
}
