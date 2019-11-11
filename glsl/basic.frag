precision highp float;

varying vec3 normal;

const vec3 lightDirection = normalize(vec3(1, -1, -1));

void main() {
    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

    vec3 ambient = 0.2 * color.rgb;
    vec3 diffuse = abs(dot(-lightDirection, normal.xyz)) * color.rgb;
    //vec3 diffuse = max(dot(-lightDirection, normal.xyz), 0.0) * color.rgb;

    gl_FragColor = vec4(ambient + diffuse, color.a);
}
