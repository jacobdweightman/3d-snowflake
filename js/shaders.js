/**
 * Loads the source of a vertex or fragment shader from the given URL, and compiles them
 * into a shader program.
 * 
 * @param {WebGLRenderingContext} gl the graphics context of the shader program
 * @param {string} vsPath the URL or relative path of the vertex shader
 * @param {string} fsPath the URL or relative path of the fragment shader
 */
export default function loadProgramFromURLs(gl, vsPath, fsPath) {
    const vsPromise = fetch(vsPath)
        .then((response) => { return response.text() })
        .catch(console.error);

    const fsPromise = fetch(fsPath)
        .then((response) => { return response.text() })
        .catch(console.error);

    return Promise.all([vsPromise, fsPromise]).then((values) => {
        return loadProgram(gl, values[0], values[1]);
    });
}

/**
 * Compiles and links a shader program from a vertex and fragment shader. Borrowed from
 * the MDN WebGL tutorial:
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial
 * 
 * @param {WebGLRenderingContext} gl the graphics context of the shader program
 * @param {string} vsSource the source for the vertex shader in this shader program
 * @param {string} fsSource the source for the fragment shader in this shader program
 */
export function loadProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

/**
 * Compile a shader of the given type from the given source. Borrowed from the MDN WebGL
 * tutorial: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial
 * 
 * @param {WebGLRenderingContext} gl the graphics context of the shader program
 * @param {*} type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {*} source the source code of the shader
 */
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}