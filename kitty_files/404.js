function render(e) {
    var n = Math.floor(currentFrame / image.framesPerRow),
        t = currentFrame % image.framesPerRow,
        a = t * image.frameDimensions.x + image.offset.x,
        r = n * image.frameDimensions.y + image.offset.y;
    (e.style.left = -a + "px"),
        (e.style.top = -r + "px"),
        (currentFrame =
            currentFrame === image.totalFrames - 1 ? 0 : currentFrame + 1);
}
function updateFrame() {
    var e = getNextFramePosition();
    withinScreen(e) ||
        ((e = getNewSpawn()),
        (speed = {
            rot: speed.rot,
            x: -Math.sign(e.x) * speed.x,
            y: -Math.sign(e.y) * speed.y
        })),
        (currentRotation += speed.rot),
        (frameEl.style.left = e.x + "px"),
        (frameEl.style.top = e.y + "px"),
        (frameEl.style.transform = "rotate(" + currentRotation + "deg)");
}
function getNextFramePosition() {
    var e = {
        x: parseInt(frameEl.style.left, 10) || 0,
        y: parseInt(frameEl.style.top, 10) || 0
    };
    return { x: e.x + speed.x, y: e.y + speed.y };
}
function spawnBounds() {
    var e = Math.max(image.frameDimensions.x, image.frameDimensions.y),
        n = 40;
    return {
        min: { x: -e - n, y: -e - n },
        max: {
            x: document.body.getBoundingClientRect().width + n,
            y: document.body.getBoundingClientRect().height + n
        }
    };
}
function randBool() {
    return Math.random() < 0.5;
}
function withinScreen(e) {
    return (
        e.x < spawnBounds().max.x &&
        e.y < spawnBounds().max.y &&
        e.x > spawnBounds().min.x &&
        e.y > spawnBounds().min.y
    );
}
var image = {
        frameDimensions: { x: 384, y: 510 },
        framesPerRow: 6,
        totalFrames: 36,
        offset: { x: 0, y: 0 }
    },
    frameRate = 66,
    frameEl = void 0,
    currentRotation = 0,
    speed = { x: 2, y: 2, rot: 0.5 },
    currentFrame = 0,
    getNewSpawn = function() {
        return {
            x: randBool() ? spawnBounds().min.x : spawnBounds().max.x,
            y: randBool() ? spawnBounds().min.y : spawnBounds().max.y
        };
    };
window.onload = function() {
    (frameEl = document.getElementById("frame")),
        frameEl || console.warn("something went wrong"),
        (frameEl.style.width = image.frameDimensions.x + "px"),
        (frameEl.style.height = image.frameDimensions.y + "px"),
        setInterval(function() {
            return render(document.getElementById("image"));
        }, frameRate),
        setInterval(updateFrame, frameRate);
};
