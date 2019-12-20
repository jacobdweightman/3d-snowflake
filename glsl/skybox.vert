attribute vec4 vertexMeshPos;
attribute vec2 vertexTexCoord;

uniform mat4 projectionMat;
uniform mat4 viewMatrix;

varying vec3 position;
varying vec2 texCoord;

void main() {
    // No model matrix, since the skybox doesn't move
    // Discard translation on view matrix, since the camera doesn't move relative to the skybox
    vec4 vertexCameraPos = projectionMat * mat4(mat3(viewMatrix)) * vertexMeshPos;
    
    // Replace z with w so that anything not clipped is in front of the skybox.
    gl_Position = vertexCameraPos.xyww;

    position = position.xyz;
    texCoord = vertexTexCoord;
}
