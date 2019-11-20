import meshzoo
import meshio
import numpy as np

import matplotlib.pyplot as plt

data = np.loadtxt("0b3_0g001.npy")

plt.imshow(data)
plt.show()

#vertices, faces = meshzoo.triangle(1)
#meshio.write_points_cells("foo.obj", vertices, {"triangle": faces})
