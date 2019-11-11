var canvas;
var gl;
var program;

// TODO: encapsulate this better
var camera;
var triangle;
var positionBuffer;

function main() {
    canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl");

    if(gl === null) {
        alert("Unable to initialize WebGL. Your browser might not support it.");
        return;
    }

    loadProgramFromURLs(
        "../glsl/basic.vert",
        "../glsl/basic.frag"
    ).then((prog) => {
        program = prog;
        gl.useProgram(prog);
        initializeScene();
        drawScene();
    });
}

window.onload = main;

function initializeScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    camera = new Camera([0,0,5], Math.PI/2, 0.1, 10);
    camera.updateGPUProjectionMatrix();

    triangle = new Mesh(
        [0.25, 0, 0],
        [1, 0, 1],
        new Float32Array([
            -1,  1, 0,
            1,  1, 0,
            -1, -1, 0,
        ])
    );
    console.log(triangle);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.updateGPUCamera();
    triangle.draw();
}
