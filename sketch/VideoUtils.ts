class Color {
  public constructor(public r: number, public g: number, public b: number) {}
}

class ColorTable {
  public constructor(public colors: Color[], public time: number) {}

  public getColor(position: number): Color {
    position = position - Math.floor(position);
    const idx = Math.min(this.colors.length - 1, Math.round(position * this.colors.length));
    return this.colors[idx];
  }
}

class TableVideo {
  public constructor(public frames: ColorTable[]) {
    this.frames.sort((n1, n2) => n1.time - n2.time);
  }

  private binarySearch(frames: ColorTable[], target: number): ColorTable {
    let left: number = 0;
    let right: number = frames.length - 1;

    if (frames.length === 1) return frames[0];
    if (frames.length === 2) return frames[Math.round(target)];

    while (left <= right) {
      const mid: number = Math.floor((left + right) / 2);
      if (mid === 0) return frames[mid];
      if (mid === frames.length - 1) return frames[mid];
      if (frames[mid - 1].time <= target && frames[mid + 1].time >= target) return frames[mid];
      if (target < frames[mid].time) right = mid - 1;
      else left = mid + 1;
    }
    console.error('binary search failed');
    return new ColorTable([], 0);
  }

  public getFrame(time: number) {
    return this.binarySearch(this.frames, time);
  }
}

class VideoPixelReader {
  private frameRate: number;
  public resolution: number;
  private cachedVideo: TableVideo;
  private videoElement: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private videoDataLoaded: boolean;

  constructor(videoUrl: string, frameRate: number, resolution: number) {
    this.frameRate = frameRate;
    this.resolution = resolution;
    this.videoElement = document.createElement("video");
    this.videoElement.src = videoUrl;
    this.videoElement.crossOrigin = "anonymous";
    this.videoElement.preload = "auto";

    this.canvas = document.createElement("canvas", );
    this.canvas.width = resolution;
    this.canvas.height = 10;
    this.context = this.canvas.getContext("2d", {willReadFrequently: true});
    document.body.appendChild(this.canvas);
    this.videoDataLoaded = false;

    //This needs to be awaited somehow. perhaps in populate data
    this.videoElement.addEventListener("loadeddata", () => {
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;
      this.videoDataLoaded = true;
    });
  }

  public async populateData() {
    // Wait for the video frame to update
    await new Promise((resolve) => {
      this.videoElement.addEventListener("loadeddata", resolve, { once: true });
    });
    const delta = 1 / 24;
    let frames: ColorTable[] = [];
    for (let time = 0; time < this.videoElement.duration; time += delta) {
      let colors: Color[] = []
      const pixelData = await this.decodeGetPixels(this.resolution, time);
      for (let x = 0; x < this.resolution * 4; x+=4) {
        if (pixelData) {
          const r = pixelData[x];
          const g = pixelData[x+1];
          const b = pixelData[x+2];
          const a = pixelData[x+3];
          //console.log(`Pixel at (${x}, 128) at ${time} seconds: R=${r}, G=${g}, B=${b}, A=${a}`);
          colors.push(new Color(r,g,b));
        } else {
          console.log("Pixel data not available.");
        }
      }
      frames.push(new ColorTable(colors, time));
    }
    this.cachedVideo = new TableVideo(frames);
  }

  public getPixel(x: number, time: number): Color{
    return this.cachedVideo.getFrame(time).getColor(x);
  }

  // Asynchronous method to get pixel data
  private async decodeGetPixels(
    width: number,
    timeInSeconds: number
  ): Promise<Uint8ClampedArray | null> {
    if (!this.videoDataLoaded) {
      console.error("Video data not loaded. Call after video has loaded.");
      return null;
    }

    // Set the video time to the specified timestamp
    this.videoElement.currentTime = timeInSeconds;

    // Wait for the video frame to update
    await new Promise((resolve) => {
      this.videoElement.addEventListener("seeked", resolve, { once: true });
    });

    // Draw the video frame onto the canvas
    this.context.drawImage(this.videoElement, 0, 0);

    // Get pixel data at the specified coordinates
    const imageData = this.context.getImageData(0, this.videoElement.height/2, width, 1);
    return imageData.data;
  }
}
