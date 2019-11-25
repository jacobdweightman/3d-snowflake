import meshzoo
import meshio
import numpy as np
import scipy.signal
import triangle


import matplotlib.pyplot as plt

data = np.load("0b3_0g001.npy")

snowflake = (data > 1.0)*1.0

# The laplacian is a kind of second derivative for multivariable functions. The boundary
# of the snowflake is a level curve of our "snowflake function" which is sampled on a
# grid in the data file. Taking the laplacian (by convolution) extracts the boundary.
laplacian = np.array([
    [1,  1, 0],
    [1, -6, 1],
    [0,  1, 1],
])

 # Given a point on the boundary of the snowflake, these masks suggests some neighboring
 # points to consider as possible next vertices.
large_mask = np.array([
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
])

small_mask = np.array([
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
])

def get_candidates(x, y, mask):
    nx, ny = mask.shape
    nx //= 2
    ny //= 2

    masked = boundary[x-nx : x+nx+1, y-ny : y+ny+1] * mask
    candidates = [np.array([x1-nx, y1-ny]) for (x1,y1) in zip(*np.nonzero(masked))]

    return candidates

def choose_candidate(candidates, T):
    #vpindex = np.argmax([np.dot(T, u) for u in candidates])
    vpindex = np.argmax([u[1]*1000000 + np.dot(T,u) for u in candidates])
    vp = candidates[vpindex]
    return vp

# The algorithm:

# 1. Find the boundary of the snowflake.
boundary = scipy.signal.convolve2d(snowflake, laplacian) > 0

vertices = []

# 2. Pick any point on the snowflake to be the first vertex.
# We somewhat arbitrarily choose the top left corner.
start = np.column_stack(np.where(boundary))[0]
vertices.append(start)
T = np.array([-1, 1])

# 3. Until we've gone all the way around the snowflake:
for i in range(185):
    x,y = vertices[-1]

    #print("Loop ", i, ": (T=", T, ", r=", vertices[-1], ")")

    # 4. Find the points that are on both the boundary of the snowflake and the mask.
    # These are represented by their displacement from the previously found vertex.
    candidates = get_candidates(x, y, small_mask)

    # 5. Select the candidate that is most nearly parallel to the tangent vector.
    vp = choose_candidate(candidates, T)
    
    # If this new vertex is not "nearly colinear" with the previous one and the one
    # before that, then the boundary is very curvy here and we should choose a closer
    # set of candidates instead.
    """
    cosTheta = np.dot(T, vp) / (np.linalg.norm(T) * np.linalg.norm(vp))
    if cosTheta < 0.5:
        print("small")
        candidates = get_candidates(x, y, small_mask)
        vpindex = np.argmax([np.dot(T, u) + np.cross(T, u) for u in candidates])
        vp = candidates[vpindex]
    """

    # 6. Select the candidate that is most nearly parallel to the tangent vector.
    vp = choose_candidate(candidates, T)
    
    # 7. Add
    T = vp
    vertices.append(vertices[-1] + vp)
    #print(vertices[-1])

# use symmetry to get other side of arm
reflected = []
for vertex in vertices[::-1]:
    reflected.append(np.array([vertex[1], vertex[0]]))
vertices = reflected + vertices

# shear back to "hex grid"
M = np.linalg.inv(np.array([
    [1, np.cos(np.pi/3)],
    [0, 1]
]))
offset = np.array([500, 500])
for i in range(len(vertices)):
    vertices[i] = np.dot(M, vertices[i] - offset)

final = []
for i in range(6):
    rot = np.array([
        [np.cos(np.pi/3 * i), -np.sin(np.pi/3 * i)],
        [np.sin(np.pi/3 * i), np.cos(np.pi/3 * i)]
    ])

    next_branch = []
    for vertex in vertices:
        next_branch.append(np.dot(rot, vertex))
    final.extend(next_branch)

#cb = plt.imshow((boundary > 0) * 1.0)
#plt.colorbar(cb)
#X,Y = list(zip(*final))
#plt.plot(X, Y, '.')
#plt.show()

segments = [(i, i+1) for i in range(len(vertices) - 1)]
segments.append((len(segments)-1, 0))
segments = np.array(segments)

vertices = np.array(vertices)


A = {"vertices": vertices, "segments": segments, "holes": [[-30,-50]]}
B = triangle.triangulate(A, 'qFs')
triangle.compare(plt, A, B)
plt.show()

#vertices, faces = meshzoo.triangle(1)
#meshio.write_points_cells("foo.obj", vertices, {"triangle": faces})
