import loadProgramFromURLs from './shaders.js';
import loadImage from './texture.js';

export default class Skybox {
    program;

    /**
     * Asynchronously loads the shader program and texture for a skybox, and constructs
     * a Skybox object. Use this instead of directly invoking the constructor.
     * 
     * @param {WebGLRenderingContext} gl The graphics context associated with this skybox's buffers.
     * @param {string} texturePath The path of the texture to be applied to this skybox.
     * @returns {Promise<Skybox>} A promise of the Skybox.
     */
    static load(gl, northTexPath, eastTexPath, southTexPath, westTexPath, upTexPath, downTexPath) {
        let loadProg = loadProgramFromURLs(
            gl,
            "../glsl/skybox.vert",
            "../glsl/skybox.frag"
        );

        let loadTex = [
            northTexPath,
            eastTexPath,
            southTexPath,
            westTexPath,
            upTexPath, 
            downTexPath
        ].map(loadImage);

        return Promise.all([loadProg, ...loadTex]).then((values) => {
            const [program, ...texture] = values;
            return new Skybox(gl, program, ...texture);
        });
    }

    /**
     * It is recommended to use `Skybox.load` instead of directly invoking the constructor.
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {WebGLProgram} program 
     * @param {HTMLImageElement} northTex 
     * @param {HTMLImageElement} eastTex 
     * @param {HTMLImageElement} southTex 
     * @param {HTMLImageElement} westTex 
     * @param {HTMLImageElement} upTex 
     * @param {HTMLImageElement} downTex 
     */
    constructor(gl, program, northTex, eastTex, southTex, westTex, upTex, downTex) {
        this.program = program;

        const vertices = new Float32Array([
            1, 1, 1,
            -1, 1, 1,
            1, 1, -1,
            -1, 1, -1,
            -1, -1, -1,
            -1, 1, 1,
            -1, -1, 1,
            1, 1, 1,
            1, -1, 1,
            1, 1, -1,
            1, -1, -1,
            -1, -1, -1,
            1, -1, 1,
            -1, -1, 1,

            /*-1, 1, -1,
            -1, -1, -1,
            1, 1, -1,
            1, -1, -1,
            1, 1, 1,
            1, -1, 1,
            -1, 1, 1,
            -1, -1, 1,
            -1, 1, -1,
            -1, -1, -1,*/
        ])
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        this.vertexCount = vertices.length / 3;

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, northTex);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, eastTex);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, southTex);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, westTex);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, upTex);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, downTex);
        
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    draw(gl, camera) {
        gl.useProgram(this.program);

        camera.updateGPUProjectionMatrix(gl, this.program);
        camera.updateGPUViewMatrix(gl, this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(
            gl.getAttribLocation(this.program, 'vertexMeshPos'),
            3,
            gl.FLOAT,
            true,
            0,
            0
        );
        gl.enableVertexAttribArray(gl.getAttribLocation(this.program, 'vertexMeshPos'));

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        gl.uniform1i(gl.getUniformLocation(this.program, 'texSampler'), 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexCount);
    }
}
