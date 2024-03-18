const sketch = function(p: p5) {
  const CELL_COUNT = 4;

  const rect = (x: number, y: number, width: number, color: p5.Color) => {
    const cellWidth = width / CELL_COUNT; 

    for (let col=0; col<CELL_COUNT; col++) {
      for (let row=0; row<CELL_COUNT; row++) {
        const alpha = p.noise(row, col) * 255;
        color.setAlpha(alpha);
        p.fill(color);
        p.rect(x + cellWidth * row, y + cellWidth * col, cellWidth, cellWidth);
      }
    }
  }
  
  p.setup = function() {
    p.createCanvas(700, 410);
    p.noLoop();
    p.noStroke();
  };

  p.draw = function() {
    p.background(0);
    const color = p.color('red');
    rect(100, 100, 240, color);
  };
};

const myp5 = new p5(sketch);