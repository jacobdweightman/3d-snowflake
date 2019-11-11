class Mat {
    /**
     * Represents a matrix!
     * 
     * @param {number[][]} entries The entries of the matrix, as an array of arrays
     * in row major order
     */
    constructor(entries) {
        this.rows = entries.length;
        this.cols = entries[0].length;
        this.entries = entries
    }

    static translation(v) {
        return new Mat([
            [1, 0, 0, v[0]],
            [0, 1, 0, v[2]],
            [0, 0, 1, v[2]],
            [0, 0, 0, 1],
        ]);
    }

    /**
     * Construct and return a new matrix given by self + B
     * @param {*} B the matrix to add
     */
    add(B) {
        let C = new Array(this.rows);

        for(let i=0; i<this.rows; i++) {
            C[i] = new Array(this.cols);
            for(let j=0; j<B.cols; j++) {
                C[i][j] = this.entries[i][j] + B.entries[i][j];
            }
        }

        return new Mat(C);
    }

    /**
     * Construct and return a new matrix given by self * B
     * @param {*} B the matrix to right-multiply by
     */
    mul(B) {
        let C = new Array(this.rows);

        for(let i=0; i<this.rows; i++) {
            C[i] = new Array(B.cols);
            for(let j=0; j<B.cols; j++) {
                C[i][j] = 0;
                for(let k=0; k<this.cols; k++) {
                    C[i][j] += this.entries[i][k] * B.entries[k][j];
                }
            }
        }

        return new Mat(C);
    }

    convertForGPU() {
        let C = new Float32Array(this.rows * this.cols);

        for(let i=0; i<this.rows; i++) {
            for(let j=0; j<this.cols; j++) {
                C[j*this.rows + i] = this.entries[i][j];
            }
        }

        return C;
    }
}
