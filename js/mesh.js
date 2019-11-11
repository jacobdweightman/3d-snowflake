class Mesh {
    /**
     * Initialize a 3D object in the world.
     * 
     * @param {number[]} position the location of the object in world space (vec3)
     * @param {number[]} orientation The direction in world space of the +x axis in object space (vec3)
     * @param {Float32Array} vertices the vertices of the mesh, in object space
     */
    constructor(position, orientation, vertices) {
        this.position = Mat.translation(position);

        let axis = Vec.cross([1, 0, 0], Vec.normalize(orientation))
        let angle = Math.asin(Vec.norm(axis));
        this.orientation = (angle == 0) ? Mat.identity() : Mat.rotation(angle, axis);

        this.vertices = vertices;

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            vertices,
            gl.STATIC_DRAW
        );
    }

    draw() {
        gl.uniformMatrix4fv(
            gl.getUniformLocation(program, 'modelMatrix'),
            false,
            this.orientation.mul(this.position).convertForGPU()
        );
        
        gl.bindBuffer(gl.ARRAY_BUFFER, triangle.positionBuffer);
        gl.vertexAttribPointer(
            gl.getAttribLocation(program, 'vertexMeshPos'),
            3,
            gl.FLOAT,
            true,
            0,
            0
        );
        gl.enableVertexAttribArray(gl.getAttribLocation(program, 'vertexMeshPos'))

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    }

    /**
     * Rotates the mesh by angle about axis.
     * 
     * @param {number[]} axis the axis about which to rotate (vec3)
     * @param {number} angle the angle to rotate by
     */
    rotate(axis, angle) {

    }

    /**
     * Translates the mesh by the given amount.
     * 
     * @param {number[]} delta the translation vector (vec3)
     */
    translate(delta) {
        this.position[1] += delta[1];
        this.position[2] += delta[2];
        this.position[3] += delta[3];
    }
}