class Camera {
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

        let f = Math.tan(0.5*(Math.PI - fieldOfView));
        let r = 1 / (far - near);

        this.projectionMatrix = new Float32Array([
            f, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far+near)*r, -1,
            0, 0, 2*far*near*r, 0,
        ]);
    }

    /**
     * Sets the uniform value `projectionMat` for the shader.
     */
    updateGPUProjectionMatrix() {
        gl.uniformMatrix4fv(
            gl.getUniformLocation(program, 'projectionMat'),
            false,
            this.projectionMatrix
        );
    }

    /**
     * Sets the uniform value `cameraPos` for the shader program.
     */
    updateGPUCamera() {
        gl.uniform4fv(
            gl.getUniformLocation(program, 'cameraPos'),
            this.position
        )
    }
}
