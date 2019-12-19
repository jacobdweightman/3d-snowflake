import loadProgramFromURLs from './shaders.js';
import loadObjAtPath from './obj.js';
import Camera from './camera.js';
import Mesh from './mesh.js';

var canvas;
var gl;

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

    loadMesh(
        "../assets/snowflake.obj",
        "../glsl/basic.vert",
        "../glsl/basic.frag"
    ).then((loadedMesh) => {
        mesh = loadedMesh;
        mesh.setScale(0.01, 0.01, 0.01);
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

    mesh.rotate(0.01, [0, 1, 0]);
    mesh.draw(gl, camera);

    requestAnimationFrame(drawScene);
}

window.onkeydown = function(event) {
    switch(event.key) {
        case "ArrowLeft":
            camera.position[0] -= 1;
            camera.lookAt([0,0,0]);
            console.log(camera);
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
