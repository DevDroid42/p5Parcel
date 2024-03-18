import { VideoPixelReader } from "./VideoUtils";

console.log("my code is running");

let video1: VideoPixelReader;
let setupDone = false;

function benchmark(reader: VideoPixelReader) {
    let seeks = 0;
    let avgSeekTime = 0;
    // Get pixel at coordinates (128, 128) and time 5 seconds into the video
    for (let i = 0; i < 4; i++) {
        for (let time = 0; time < 4; time += 0.1) {
            seeks += 1;
            let t0 = performance.now();
            const c = reader.getPixel(0.5, time);
            //console.log(`Pixel at (128, 128) at ${time} seconds: R=${c.r}, G=${c.g}, B=${c.b}`);
            avgSeekTime += performance.now() - t0;
        }
    }
    console.log(`avg seek time: ${avgSeekTime / seeks}`);
}

window["setup"] = async function setup() {
    console.log("Setup Running");
    createCanvas(100, 100);
    video1 = new VideoPixelReader("/assets/Melody.webm", 24, 256);
    //video2 = new VideoPixelReader("./assets/MelodyEncoded - Copy.webm", 24, 256);
    let t0 = performance.now();
    await Promise.all([video1.populateData()]);

    console.log(`Time to decode: ${performance.now() - t0}`);
    createCanvas(720, 400);
    stroke(255); // Set line drawing color to white
    frameRate(60);
    setupDone = true;
};

let time = 0;
window["draw"] = function draw() {
    if (!setupDone) {
        text("Loading", width / 2, height / 2);
        return;
    }
    background(0);
    stroke(0, 0);
    time += deltaTime / 1000;
    for (let i = 0; i < video1.resolution; i++) {
        const pos = i / video1.resolution;
        const col = video1.getPixel(pos, time % 4);
        fill(col.r, col.g, col.b);
        rect(
            (i / video1.resolution) * width,
            height,
            2,
            -(col.r + col.g + col.b)
        );
    }
};
