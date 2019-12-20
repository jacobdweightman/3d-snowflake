import loadProgramFromURLs from './shaders.js';
import loadObjAtPath from './obj.js';
import Camera from './camera.js';
import Mesh from './mesh.js';
import Skybox from './skybox.js';

var canvas;
var gl;

// TODO: encapsulate this better
var camera;
var mesh;
var skybox;

function main() {
    canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl");

    if(gl === null) {
        alert("Unable to initialize WebGL. Your browser might not support it.");
        return;
    }

    const lm = loadMesh(
        "../assets/snowflake.obj",
        "../glsl/basic.vert",
        "../glsl/basic.frag"
    ).then((loadedMesh) => {
        mesh = loadedMesh;
        mesh.setScale(0.01, 0.01, 0.01);
    });

    const sb = Skybox.load(
        gl,
        "../assets/shaw_north.jpg",
        "../assets/shaw_east.jpg",
        "../assets/shaw_south.jpg",
        "../assets/shaw_west.jpg",
        "../assets/shaw_up.jpg",
        "../assets/shaw_down.jpg"
    ).then((sb) => {
        skybox = sb;
    });

    Promise.all([lm, sb]).then(() => {
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

    camera = new Camera([0,0,5], Math.PI/2, 0.1, 20);
}

function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    skybox.draw(gl, camera);
    mesh.rotate(0.01, [0, 1, 0]);
    mesh.draw(gl, camera);

    requestAnimationFrame(drawScene);
}

window.onkeydown = function(event) {
    switch(event.key) {
        case "ArrowLeft":
            camera.position[0] -= 1;
            camera.lookAt([0,0,0]);
            break;
        case "ArrowRight":
            camera.position[0] += 1;
            camera.lookAt([0,0,0]);
            break;
    }
}

function loadMesh(objPath, vertPath, fragPath) {
    const loadProgram = loadProgramFromURLs(
        gl,
        vertPath,
        fragPath
    );

    const loadMesh = loadObjAtPath(objPath);

    return Promise.all([loadProgram, loadMesh]).then((values) => {
        const [prog, [vertices, normals, faces]] = values;
        return new Mesh(gl, prog, [0,0,0], [1,0,0], vertices, normals, faces);
    });
}
