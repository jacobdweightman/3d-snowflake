import { Vec } from './linalg.js';

/**
 * Fetches a file at the given path, and parses it as an obj.
 * 
 * @param {string} path the path to the obj file
 * @returns {Promise<Mesh>} the mesh constructed from the file
 */
export default function loadObjAtPath(path) {
    return fetch(path)
        .then((response) => { return response.text() })
        .then(parseObj);
}

/**
 * Parses the given string as an obj file into a Mesh object.
 * 
 * @param {string} str the contents of the obj file.
 * @returns {Float32Array[3]} the vertex array, vertex normal array, and index array.
 */
export function parseObj(str) {
    let vertices = [];
    let normals = [];
    let faces = [];

    for(let line of str.split("\n")) {
        // ignore comments
        line = line.trim().split("#")[0];
        if(line === "") continue;

        let [type, ...values] = line.split(" ");

        switch(type) {
            case "v":
                vertices.push(values);
                break;
            case "vn":
                normals.push(values);
                break;
            case "f":
                // Note: OBJ indices start at 1, so we subtract 1.
                values = values.map((value) => value-1);
                faces.push([values[0], values[2], values[1]]);
                break;
            default:
                throw "Unknown line type encountered in obj file: " + type;
        }
    }

    // If the obj file didn't contain normals, then generate them.
    if(normals.length === 0) {
        normals = generateNormals(vertices, faces);
    }

    vertices = new Float32Array(vertices.flat());
    normals = new Float32Array(normals.flat());
    faces = new Uint16Array(faces.flat());

    return [vertices, normals, faces];
}

/**
 * Generates normal vectors for each vertex based on the adjacent faces.
 * 
 * Note: Assumes the mesh is made up of triangular faces.
 * 
 * @param {*} vertices 
 * @param {*} faces 
 */
function generateNormals(vertices, faces) {
    let normals = new Array(vertices.length);
    for(let i=0; i<normals.length; i++) {
        normals[i] = new Array(3).fill(0);
    }

    for(let face of faces) {
        let v1 = vertices[face[0]];
        let v2 = vertices[face[1]];
        let v3 = vertices[face[2]];

        let area = Vec.cross(Vec.sub(v3, v1), Vec.sub(v2, v1));
        normals[face[0]] = Vec.add(normals[face[0]], area);
        normals[face[1]] = Vec.add(normals[face[1]], area);
        normals[face[2]] = Vec.add(normals[face[2]], area);
    }

    /*for(let i=0; i<normals.length; i++) {
        normals[i] = Vec.normalize(normals[i]);
    }*/

    return normals;
}
