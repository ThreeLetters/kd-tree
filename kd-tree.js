var MAX_NODES = 4,
    MAX_HALF = MAX_NODES >> 1

class KDTree {
    constructor(dims) {
        this.root = {
            left: null,
            right: null,
            split: null,
            nodes: [],
            dim: 0,
            lvl: 0
        }
        this.dims = dims;
    }
    insert(obj) {
        var len = this.dims.length;

        var recurse = function (node) {

            if (node.left) {
                recurse((obj[this.dims[node.dim]] > node.split) ? node.right : node.left);
            } else {
                node.nodes.push(obj);
                obj._TreeNode = node;
                if (node.nodes.length === MAX_NODES) {
                    node.nodes.sort(function (a, b) {
                        return a[this.dims[node.dim]] - b[this.dims[node.dim]];
                    }.bind(this))

                    var median = node.nodes[MAX_HALF - 1][this.dims[node.dim]];
                    node.split = median;
                    node.left = {
                        nodes: [],
                        dim: (node.lvl + 1) % len,
                        lvl: node.lvl + 1,
                        parent: node
                    }
                    for (let i = 0; i < MAX_HALF; ++i) {
                        node.left.nodes.push(node.nodes[i])
                        node.nodes[i]._TreeNode = node.left;
                    }
                    node.right = {
                        nodes: [],
                        dim: (node.lvl + 1) % len,
                        lvl: node.lvl + 1,
                        parent: node
                    }
                    for (let i = MAX_HALF; i < MAX_NODES; ++i) {
                        node.right.nodes.push(node.nodes[i])
                        node.nodes[i]._TreeNode = node.right;
                    }
                    node.nodes = [];
                }
            }
        }.bind(this);
        recurse(this.root);
    }
    delete(obj) {
        if (!obj._TreeNode) throw "Error: Obj does not belong in a node!";
        var node = obj._TreeNode;

        var ind = node.nodes.indexOf(obj);

        node.nodes[ind] = node.nodes[node.nodes.length - 1];
        node.nodes.pop();
        if (node.nodes.length !== 0) return;

        var recurse = function (node) {
            if (node.parent) {

                if (node.parent.left.left || node.parent.right.left) {
                    return;
                }

                if (node.parent.left.nodes.length !== 0 || node.parent.right.nodes.length) {
                    return;
                }

                node.parent.left = node.parent.right = node.parent.split = null;
                recurse(node.parent);
                node.parent = null;
            }
        }
        recurse(node)
    }
    query(obj, call) {
        var recurse = function (node) {
            if (node.left) {
                var val = obj[this.dims[node.dim]];
                if (typeof val !== 'object') {
                    recurse(val > node.split ? node.right : node.left)
                } else {
                    var min = val[0];
                    var max = val[1];

                    if (min > node.split) recurse(node.right);
                    else if (max <= node.split) recurse(node.left);
                    else {
                        recurse(node.left);
                        recurse(node.right);
                    }
                }
            } else {
                node.nodes.forEach(call);
            }
        }.bind(this);
        recurse(this.root)
    }
    get(obj) {
        var out = [];
        this.query(obj, (node) => {
            out.push(node);
        })
        return out;
    }

}
