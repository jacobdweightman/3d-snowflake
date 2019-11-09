class Mesh {
    /**
     * Initialize a 3D object in the world.
     * 
     * @param {number[]} position the location of the object in world space (vec3)
     * @param {number[]} orientation The direction in world space of the +x axis in object
     * space (vec3)
     * @param {Float32Array} vertices the vertices of the mesh, in object space
     */
    constructor(position, orientation, vertices) {
        this.position = new Mat([
            [1, 0, 0, position[0]],
            [0, 1, 0, position[1]],
            [0, 0, 1, position[2]],
            [0, 0, 0, 1],
        ]);

        this.orientation = orientation;
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
        console.log(this.position.convertForGPU());
        gl.uniformMatrix4fv(
            gl.getUniformLocation(program, 'modelMatrix'),
            false,
            this.position.convertForGPU()
        );
        
        gl.bindBuffer(gl.ARRAY_BUFFER, triangle.positionBuffer);
        gl.vertexAttribPointer(
            gl.getAttribLocation(program, 'aVertexPosition'),
            3,
            gl.FLOAT,
            true,
            0,
            0
        );
        gl.enableVertexAttribArray(gl.getAttribLocation(program, 'aVertexPosition'))

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