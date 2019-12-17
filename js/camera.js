import { Mat, Vec } from './linalg.js';

export default class Camera {
    /**
     * Represents a camera!
     * 
     * @param {number[]} position the position of the camera in world coordinates
     * @param {number} fieldOfView the angle (in radians) that this camera is able to see
     * @param {number} near the minimum distance that this camara can see
     * @param {number} far the maximum distance that this camara can see
     */
    constructor(position, fieldOfView, near, far) {
        this.position = new Float32Array(4);
        this.position.set(position);

        let f = 1.0 / Math.tan(0.5*fieldOfView);
        let r = 1 / (near - far);

        this.projectionMatrix = new Float32Array([
            f, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far+near)*r, -1,
            0, 0, 2*far*near*r, 0,
        ]);
    }

    /**
     * Sets the uniform value `projectionMat` for the shader.
     * 
     * @param {WebGLRenderingContext} gl The context in which to set the projection matrix.
     */
    updateGPUProjectionMatrix(gl, program) {
        gl.uniformMatrix4fv(
            gl.getUniformLocation(program, 'projectionMat'),
            false,
            this.projectionMatrix
        );
    }

    /**
     * Sets the uniform value `cameraPos` for the shader program.
     * 
     * @param {WebGLRenderingContext} gl The context in which to set the view matrix.
     */
    updateGPUViewMatrix(gl, program) {
        gl.uniformMatrix4fv(
            gl.getUniformLocation(program, 'viewMatrix'),
            false,
            Mat.translation(Vec.scale(this.position, -1)).convertForGPU()
        )
    }
}
