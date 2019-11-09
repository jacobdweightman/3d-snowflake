class Camera {
    constructor(fieldOfView, near, far) {
        let f = Math.tan(Math.PI*0.5 - fieldOfView*0.5);
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
}