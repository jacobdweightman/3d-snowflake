import { Mat, Vec } from './linalg.js';

export default class Mesh {
    /**
     * Initialize a 3D object in the world.
     * 
     * @param {WebGLRenderingContext} gl The graphics context associated with this mesh's buffers.
     * @param {number[]} position the location of the object in world space (vec3)
     * @param {number[]} orientation The direction in world space of the +x axis in object space (vec3)
     * @param {Float32Array} vertices the vertices of the mesh, in object space
     * @param {Float32Array} normals The vertex normals of the mesh, in object space.
     * @param {Float32Array} indices The vertex indices that define the faces of the mesh.
     */
    constructor(gl, position, orientation, vertices, normals, indices) {
        this.position = Mat.translation(position);

        let axis = Vec.cross([1, 0, 0], Vec.normalize(orientation))
        let angle = Math.asin(Vec.norm(axis));
        this.orientation = (angle == 0) ? Mat.identity() : Mat.rotation(angle, axis);
        this.vertex_count = vertices.length / 3;
        this.face_count = indices.length / 3;

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            vertices,
            gl.STATIC_DRAW
        );

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            normals,
            gl.STATIC_DRAW
        );

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            indices,
            gl.STATIC_DRAW
        );
    }

    draw(gl, program) {
        let modelMatrix = this.orientation.mul(this.position);
        gl.uniformMatrix4fv(
            gl.getUniformLocation(program, 'modelMatrix'),
            false,
            modelMatrix.convertForGPU()
        );
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(
            gl.getAttribLocation(program, 'vertexMeshPos'),
            3,
            gl.FLOAT,
            true,
            0,
            0
        );
        gl.enableVertexAttribArray(gl.getAttribLocation(program, 'vertexMeshPos'));

        gl.uniformMatrix3fv(
            gl.getUniformLocation(program, 'normalMatrix'),
            false,
            normalMatrixFromModelMatrix(modelMatrix).convertForGPU()
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(
            gl.getAttribLocation(program, 'vertexNormal'),
            3,
            gl.FLOAT,
            true,
            0,
            0
        );
        gl.enableVertexAttribArray(gl.getAttribLocation(program, 'vertexNormal'));

        gl.drawElements(gl.TRIANGLES, this.face_count * 3, gl.UNSIGNED_SHORT, 0);
    }

    /**
     * Rotates the mesh by angle about axis.
     * 
     * @param {number[]} axis the axis about which to rotate (vec3)
     * @param {number} angle the angle to rotate by
     */
    rotate(angle, axis) {
        this.orientation = Mat.rotation(angle, axis).mul(this.orientation);
    }

    /**
     * Translates the mesh by the given amount.
     * 
     * @param {number[]} delta the translation vector (vec3)
     */
    translate(delta) {
        this.position.entries[0][3] += delta[0];
        this.position.entries[1][3] += delta[1];
        this.position.entries[2][3] += delta[2];
    }
}


/**
 * Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 model matrix.
 * Adapted from the glMatrix library by Brandon Jones and Colin MacKenzie IV.
 *
 * @param {mat4} a Mat4 to derive the normal matrix from
 */
function normalMatrixFromModelMatrix(A) {
    let a = A.entries;
    var a00 = a[0][0],
        a01 = a[1][0],
        a02 = a[2][0],
        a03 = a[3][0];
    var a10 = a[0][1],
        a11 = a[1][1],
        a12 = a[2][1],
        a13 = a[3][1];
    var a20 = a[0][2],
        a21 = a[1][2],
        a22 = a[2][2],
        a23 = a[3][2];
    var a30 = a[0][3],
        a31 = a[1][3],
        a32 = a[2][3],
        a33 = a[3][3];

    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
    return null;
    }
    det = 1.0 / det;

    return new Mat([
        [
            (a11 * b11 - a12 * b10 + a13 * b09) * det,
            (a02 * b10 - a01 * b11 - a03 * b09) * det,
            (a31 * b05 - a32 * b04 + a33 * b03) * det,
        ],
        [
            (a12 * b08 - a10 * b11 - a13 * b07) * det,
            (a00 * b11 - a02 * b08 + a03 * b07) * det,
            (a32 * b02 - a30 * b05 - a33 * b01) * det,
        ],
        [
            (a10 * b10 - a11 * b08 + a13 * b06) * det,
            (a01 * b08 - a00 * b10 - a03 * b06) * det,
            (a30 * b04 - a31 * b02 + a33 * b00) * det,
        ]
    ]);
}
