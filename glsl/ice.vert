attribute vec4 vertexMeshPos;
attribute vec3 vertexNormal;

uniform mat4 projectionMat;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat3 normalMatrix;

varying vec3 position;
varying vec3 normal;

void main() {
    vec4 vertexCameraPos = viewMatrix * modelMatrix * vertexMeshPos;
    gl_Position = projectionMat * vertexCameraPos;
    position = vertexCameraPos.xyz;
    normal = normalize(normalMatrix * vertexNormal);
}
