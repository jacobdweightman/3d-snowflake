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
        this.orientation = [0, 0, -1];

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
     * Rotates the camera by the given angle about the given axis.
     * 
     * @param {number} angle The angle to rotate by, measured counterclockwise in radians.
     * @param {number[]} axis The axis to rotate about.
     */
    rotate(angle, axis) {
        this.orientation = Mat.rotation(angle, axis).operateOn(this.orientation);
    }

    /**
     * Rotate the camera to point towards a specified point.
     * 
     * @param {*} target the point to look at.
     */
    lookAt(target) {
        this.orientation = Vec.sub(target, this.position);
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
        let viewMatrix = Mat.identity();
        viewMatrix = Mat.translation(Vec.scale(this.position, -1)).mul(viewMatrix);
        viewMatrix = Mat.rotateTo(this.orientation, [0,0,-1]).mul(viewMatrix);

        gl.uniformMatrix4fv(
            gl.getUniformLocation(program, 'viewMatrix'),
            false,
            viewMatrix.convertForGPU()
        )
    }
}
