import meshzoo
import meshio
import numpy as np
import scipy.signal
import scipy.ndimage

import matplotlib.pyplot as plt

data = np.load("0b3_0g001.npy")

snowflake = (data > 1.0)*1.0

laplacian = np.array([
    [0,  1, 0],
    [1, -4, 1],
    [0,  1, 0],
])

boundary = (scipy.signal.convolve2d(snowflake, laplacian, mode="same") > 0) * 1.0

potential = scipy.ndimage.gaussian_filter(boundary, sigma=25)
force = np.gradient(potential)
force = np.stack(force, axis=2)

def F(r):
    x,y = r
    return force[int(x), int(y)]

# initialize n "particles" in random locations uniformly distributed over the image.
n = 1
R = 1000 * np.random.rand(n, 2)
print(R[0])
print(F(R[0]))

cb = plt.imshow(potential)
plt.colorbar(cb)
plt.show()
