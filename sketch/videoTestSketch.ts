import { VideoPixelReader } from "./VideoUtils";

let t  = 0;

window["setup"] = async function setup() {
    console.log("Setup Running");
    createCanvas(windowWidth, windowHeight);
};

function loadingAnimation(progress: number){
    background(255, 10);
    push()
    rectMode(CENTER);
    translate(width / 2, height / 2);
    rotate(progress * PI);
    square(0,0, width / 4);
    stroke(0,0,0);
    square(0,0, width / 4 * progress);
    pop()
    textAlign(CENTER, CENTER)
    textSize(70)
    text("Loading", width / 2, height / 2);
}

window["draw"] = function draw() {
    t += deltaTime / 1000;
    if (t < 5) {
        loadingAnimation(t / 5);
        return;
    }
    background(255,0,255);
    textAlign(CENTER, CENTER)
    textSize(70)
    text("Finished Loading", width / 2, height / 2);
};
