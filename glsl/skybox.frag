precision highp float;

uniform samplerCube texSampler;

varying vec3 texCoord;

void main() {
    gl_FragColor = textureCube(texSampler, texCoord);
}
