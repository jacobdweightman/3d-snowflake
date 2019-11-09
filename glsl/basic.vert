attribute vec4 aVertexPosition;

uniform mat4 projectionMat;
uniform mat4 modelMatrix;

void main() {
    gl_Position = projectionMat * modelMatrix * aVertexPosition;
}
