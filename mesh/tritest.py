import matplotlib.pyplot as plt
import numpy as np

import triangle as tr


def circle(N, R):
    i = np.arange(N)
    theta = i * 2 * np.pi / N
    pts = np.stack([np.cos(theta), np.sin(theta)], axis=1) * R
    seg = np.stack([i, i + 1], axis=1) % N
    return pts, seg

pts0, seg0 = circle(30, 1.4)
pts1, seg1 = circle(16, 0.6)
pts = np.vstack([pts0, pts1])
seg = np.vstack([seg0, seg1 + seg0.shape[0]])

print(pts.shape)
print(seg.shape)

pts = np.array([
    [0, 0],
    [1, 0],
    [0.1, 0.1],
    [0, 1]
])
seg = np.array([[0, 1], [1, 2], [2, 3], [3,0]])

A = dict(vertices=pts, segments=seg)
B = tr.triangulate(A, 'qpa0.05')
tr.compare(plt, A, B)
plt.show()