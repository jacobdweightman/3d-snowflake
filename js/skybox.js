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
    static load(gl, texturePath) {
        let loadProg = loadProgramFromURLs(
            gl,
            "../glsl/skybox.vert",
            "../glsl/skybox.frag"
        );

        let loadTex = loadImage(texturePath);

        return Promise.all([loadProg, loadTex]).then((values) => {
            const [program, texture] = values;
            return new Skybox(gl, program, texture);
        });
    }

    /**
     * It is recommended to use `Skybox.load` instead of directly invoking the constructor.
     * 
     * @param {WebGLRenderingContext} gl 
     * @param {WebGLProgram} program 
     * @param {HTMLImageElement} texture 
     */
    constructor(gl, program, texture) {
        this.program = program;

        const vertices = new Float32Array([
            -1, 1, -1,
            -1, -1, -1,
            1, 1, -1,
            1, -1, -1,
            1, 1, 1,
            1, -1, 1,
            -1, 1, 1,
            -1, -1, 1,
            -1, 1, -1,
            -1, -1, -1,
        ])
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        this.vertexCount = vertices.length / 3;

        const texCoords = new Float32Array([
            0, 0,
            0, 1,
            0.25, 0,
            0.25, 1,
            0.5, 0,
            0.5, 1,
            0.75, 0,
            0.75, 1,
            1, 0,
            1, 1,
        ]);
        this.textureCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            texture
        );
        
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordsBuffer);
        gl.vertexAttribPointer(
            gl.getAttribLocation(this.program, 'vertexTexCoord'),
            2,
            gl.FLOAT,
            true,
            0,
            0
        );
        gl.enableVertexAttribArray(gl.getAttribLocation(this.program, 'vertexTexCoord'));

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(gl.getUniformLocation(this.program, 'texSampler'), 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexCount);
    }
}
