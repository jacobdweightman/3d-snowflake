import loadProgramFromURLs from './shaders.js';
import loadObjAtPath from './obj.js';
import Camera from './camera.js';
import Mesh from './mesh.js';

var canvas;
var gl;
var program;

// TODO: encapsulate this better
var camera;
var mesh;

function main() {
    canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl");

    if(gl === null) {
        alert("Unable to initialize WebGL. Your browser might not support it.");
        return;
    }

    const loadProgram = loadProgramFromURLs(
        gl,
        "../glsl/basic.vert",
        "../glsl/basic.frag"
    ).then((prog) => {
        program = prog;
        gl.useProgram(prog);
    });

    const loadMesh = loadObjAtPath("../assets/cube.obj").then((obj) => {
        const [vertices, normals, faces] = obj;
        mesh = new Mesh(gl, [0,0,0], [1,0,0], vertices, normals, faces);
    });

    Promise.all([loadProgram, loadMesh]).then((values) => {
        initializeScene();
        requestAnimationFrame(drawScene);
    });
}

window.onload = main;

function initializeScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    camera = new Camera([0,0,5], Math.PI/2, 0.1, 10);
    camera.updateGPUProjectionMatrix(gl, program);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.updateGPUViewMatrix(gl, program);
    mesh.rotate(0.01, [0, 1, 0]);
    mesh.draw(gl, program);

    requestAnimationFrame(drawScene);
}
