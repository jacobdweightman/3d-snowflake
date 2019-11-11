attribute vec4 vertexMeshPos;

uniform mat4 projectionMat;
uniform vec4 cameraPos;
uniform mat4 modelMatrix;

void main() {
    vec4 vertexCameraPos = modelMatrix * vertexMeshPos - cameraPos;
    gl_Position = projectionMat * vertexCameraPos;
}
