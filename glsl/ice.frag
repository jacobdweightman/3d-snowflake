precision highp float;

uniform samplerCube environmentMap;

varying vec3 position;
varying vec3 normal;

// environment properties
vec3 lightDirection = vec3(0.0, 0.0, -1.0);

// material properties
float eta = 0.67;
float R0 = 0.4;

float shlickApproximation(float EdotH) {
    return R0 + (1.0 - R0)*pow(1.0-EdotH, 5.0);
}

void main() {
    vec3 N = normalize(normal);
    vec3 L = normalize(lightDirection);
    vec3 E = normalize(-position);
    vec3 H = normalize(L + E);

    float EdotH = clamp(dot(E, H), 0.0, 1.0);
    float NdotL = abs(dot(N, L)); // why not clamp?
    float F = shlickApproximation(NdotL); // why not EdotL?

    vec3 reflectDirection = normalize(reflect(-E, N));
    vec4 reflectedColor = textureCube(environmentMap, reflectDirection);

    vec3 refractDirection = normalize(refract(-E, N, eta));
    vec4 refractedColor = textureCube(environmentMap, refractDirection);

    gl_FragColor.rgb = mix(refractedColor.rgb, reflectedColor.rgb, F);
    gl_FragColor.a = 1.0;
}