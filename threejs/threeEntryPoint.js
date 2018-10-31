import SceneManager from "./ScreenManager";
import Stats from "stats-js";

export default (container, packages) => {
  const canvas = createCanvas(document, container);
  const sceneManager = new SceneManager(canvas, packages);
  let stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.left = "0px";
  stats.domElement.style.top = "0px";
  document.body.appendChild(stats.domElement);

  let canvasHalfWidth;
  let canvasHalfHeight;

  bindEventListeners();
  render();

  function createCanvas(document, container) {
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    return canvas;
  }

  function bindEventListeners() {
    window.onresize = resizeCanvas;
    window.onmousemove = mouseMove;
    window.onmouseup = mouseUp;
    resizeCanvas();
  }

  function resizeCanvas() {
    canvas.style.width = window.innerWidth; //"100%";
    canvas.style.height = window.innerHeight; //"100%";

    canvas.width = window.innerWidth; //canvas.offsetWidth;
    canvas.height = window.innerHeight; // canvas.offsetHeight;

    canvasHalfWidth = Math.round(canvas.offsetWidth / 2);
    canvasHalfHeight = Math.round(canvas.offsetHeight / 2);

    sceneManager.onWindowResize();
  }

  function mouseMove({ clientX, clientY }) {
    sceneManager.onMouseMove(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );
  }

  function mouseUp(e) {
    sceneManager.onMouseUp();
  }

  function render(time) {
    stats.begin();

    requestAnimationFrame(render);
    sceneManager.update();
    stats.end();
  }

  function update(data) {
    sceneManager.updateData(data);
  }

  return { update };
};
