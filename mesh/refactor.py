import matplotlib.pyplot as plt
import meshio
import numpy as np
import scipy.signal
import triangle


class Snowflake:
    def __init__(self, data, path, dendrites=6):
        self.data = (data > 1.0) * 1.0
        self.boundary = self.find_boundary()
        self.make_vertices(dendrites=dendrites)
        self.triangulate()
        self.draw3D()
        meshio.write_points_cells(path, self.vertices, {"triangle": self.faces})


    def find_boundary(self):
        snowflake = self.data
        # The laplacian is a kind of second derivative for multivariable functions. The boundary
        # of the snowflake is a level curve of our "snowflake function" which is sampled on a
        # grid in the data file. Taking the laplacian (by convolution) extracts the boundary.
        laplacian = np.array([
            [1, 1, 0],
            [1, -6, 1],
            [0, 1, 1],
        ])

        return scipy.signal.convolve2d(snowflake, laplacian) > 0

    def make_vertices(self, dendrites):
        arm_vertices = self.make_arm_vertices()

        vertices = []
        angle = -2 * np.pi / dendrites
        for i in range(dendrites):

            rot = np.array([
                [np.cos(angle * i), -np.sin(angle * i)],
                [np.sin(angle * i), np.cos(angle * i)]
            ])

            next_branch = []
            for vertex in arm_vertices:
                next_branch.append(np.dot(rot, vertex))

            vertices.extend(next_branch)

        self.outline = self.remove_duplicate(vertices)


    def triangulate(self):
        segments = [(i, i + 1) for i in range(len(self.outline) - 1)]
        segments.append((len(self.outline) - 1, 0))

        A = {"vertices": self.outline, "segments": segments}
        B = triangle.triangulate(A, 'qp')

        self.vertices = B["vertices"]
        self.triangles = B["triangles"]

        triangle.compare(plt, A, B)


    def draw3D(self):
        vertices = self.vertices
        final = np.array(self.outline)
        triangles = self.triangles

        np.random.seed(12)
        noise = np.random.normal(scale=1.0, size=(vertices.shape[0], 1))

        front_vertices = np.column_stack([vertices * .7, np.full((vertices.shape[0], 1), 10 + noise)])
        back_vertices = np.column_stack([vertices * .7, np.full((vertices.shape[0], 1), -10 - noise)])
        middle_vertices = np.column_stack([final, np.full((final.shape[0], 1), 0)])
        back_triangles = np.column_stack([triangles[:, 1], triangles[:, 0], triangles[:, 2]])

        faces = np.concatenate([triangles, back_triangles + vertices.shape[0]])
        self.vertices = np.concatenate([front_vertices, back_vertices, middle_vertices])

        new_faces = []
        for i in range(len(final) - 1):
            # create triangle 1
            new_faces.append([i, len(front_vertices) * 2 + i + 1, len(front_vertices) * 2 + i])
            # create triangle 2
            new_faces.append([i, i + 1, len(front_vertices) * 2 + i + 1])
            # create triangle 3
            new_faces.append([i + 2 * len(front_vertices), i + len(front_vertices) + 1, i + len(front_vertices)])
            # create triangle 4
            new_faces.append(
                [i + 2 * len(front_vertices), i + len(front_vertices) * 2 + 1, i + len(front_vertices) + 1])

        front_len = len(front_vertices)
        final_len = len(final)

        new_faces.append([0, 2 * front_len + final_len - 1,  final_len - 1])
        new_faces.append([0, 2 * front_len, 2 * front_len + final_len - 1])
        new_faces.append([2 * front_len, front_len, 2 * front_len + final_len - 1])
        new_faces.append([2 * front_len + final_len - 1, front_len, front_len + final_len - 1])
        self.faces = np.concatenate([faces, np.array(new_faces)])


    def remove_duplicate(self, vertices):
        vertex_set = set()
        i = 0
        while i < len(vertices):
            v = tuple(vertices[i])
            if v in vertex_set:
                del vertices[i]
            else:
                vertex_set.add(v)
                i += 1
        return vertices

    def make_arm_vertices(self):
        vertices = []

        start = np.column_stack(np.where(self.boundary))[0]
        vertices.append(start)
        T = np.array([-1, 1])

        mask = np.array([
            [0, 1, 1, 1, 0],
            [1, 1, 0, 1, 1],
            [1, 0, 0, 0, 1],
            [1, 1, 0, 1, 1],
            [0, 1, 1, 1, 0],
        ])

        # 3. Until we've gone all the way around the snowflake:
        for i in range(184):
            x, y = vertices[-1]

            # print("Loop ", i, ": (T=", T, ", r=", vertices[-1], ")")

            # 4. Find the points that are on both the boundary of the snowflake and the mask.
            # These are represented by their displacement from the previously found vertex.
            candidates = self.get_candidates(x, y, mask)

            # 5. Select the candidate that is most nearly parallel to the tangent vector.
            vp = self.choose_candidate(candidates, T)

            # 7. Add
            T = vp
            vertices.append(vertices[-1] + vp)
        # use symmetry to get other side of arm
        reflected = []
        for vertex in vertices[::-1]:
            reflected.append(np.array([vertex[1], vertex[0]]))
        vertices = reflected + vertices
        vertices = vertices[:-5:2]

        # shear back to "hex grid"
        M = np.linalg.inv(np.array([
            [1, np.cos(np.pi / 3)],
            [0, 1]
        ]))
        offset = np.array([500, 500])
        for i in range(len(vertices)):
            vertices[i] = np.dot(M, vertices[i] - offset)

        return vertices

    def get_candidates(self, x, y, mask):
        nx, ny = mask.shape
        nx //= 2
        ny //= 2

        masked = self.boundary[x - nx: x + nx + 1, y - ny: y + ny + 1] * mask
        candidates = [np.array([x1 - nx, y1 - ny]) for (x1, y1) in zip(*np.nonzero(masked))]

        return candidates

    def choose_candidate(self, candidates, T):
        # vpindex = np.argmax([np.dot(T, u) for u in candidates])
        vpindex = np.argmax([u[1] * 1000000 + np.dot(T, u) for u in candidates])
        vp = candidates[vpindex]
        return vp


for i in range(1, 12):
    name = str(i) + "-snowflake.obj"
    Snowflake(np.load("0b3_0g001.npy"), name, i)
