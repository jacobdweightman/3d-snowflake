precision highp float;

varying vec3 normal;

const vec3 lightDirection = normalize(vec3(1, -1, -1));

void main() {
    vec3 N = normalize(normal);
    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

    // Use a simple lighting model with Lambertian reflectance.
    vec3 ambient = 0.2 * color.rgb;
    vec3 diffuse = clamp(dot(-lightDirection, N), 0.0, 1.0) * color.rgb;

    gl_FragColor = vec4(ambient + diffuse, color.a);
}
