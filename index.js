let canvas;
let ctx;
let imageData;
let animationRunning = false;
let animationFrame = 0;

function initGraphics(canvasId) {
  canvas = document.getElementById(canvasId);
  ctx = canvas.getContext("2d");
  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";
}

class AVLNode {
  constructor(info) {
    this.info = info;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  // operasi AVL Tree
  getHeight(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  // rotasi kanan
  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    // rotasi
    x.right = y;
    y.left = T2;

    // update tinggi node
    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));

    return x; // root baru
  }

  // Rotasi Kiri
  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    // rotasi
    y.left = x;
    x.right = T2;

    // update tinggi node
    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));

    return y; // root baru
  }

  //  insert Node AVL
  insert(root, info) {
    if (!root) return new AVLNode(info);

    if (info < root.info) root.left = this.insert(root.left, info);
    else if (info > root.info) root.right = this.insert(root.right, info);
    else return root; // tidak boleh duplikat

    // update tinggi node
    root.height =
      1 + Math.max(this.getHeight(root.left), this.getHeight(root.right));

    // hitung balance
    const balance = this.getBalance(root);

    // kasus rotasi
    if (balance > 1 && info < root.left.info) return this.rotateRight(root); // Left Left
    if (balance < -1 && info > root.right.info) return this.rotateLeft(root); // Right Right
    if (balance > 1 && info > root.left.info) {
      // Left Right
      root.left = this.rotateLeft(root.left);
      return this.rotateRight(root);
    }
    if (balance < -1 && info < root.right.info) {
      // Right Left
      root.right = this.rotateRight(root.right);
      return this.rotateLeft(root);
    }

    return root;
  }

  //  delete Node AVL
  delete(root, info) {
    if (!root) return root;

    if (info < root.info) root.left = this.delete(root.left, info);
    else if (info > root.info) root.right = this.delete(root.right, info);
    else {
      if (!root.left) return root.right;
      else if (!root.right) return root.left;

      const temp = this.getMinValueNode(root.right);
      root.info = temp.info;
      root.right = this.delete(root.right, temp.info);
    }

    if (!root) return root;

    root.height =
      1 + Math.max(this.getHeight(root.left), this.getHeight(root.right));
    const balance = this.getBalance(root);

    if (balance > 1 && this.getBalance(root.left) >= 0)
      return this.rotateRight(root);
    if (balance > 1 && this.getBalance(root.left) < 0) {
      root.left = this.rotateLeft(root.left);
      return this.rotateRight(root);
    }
    if (balance < -1 && this.getBalance(root.right) <= 0)
      return this.rotateLeft(root);
    if (balance < -1 && this.getBalance(root.right) > 0) {
      root.right = this.rotateRight(root.right);
      return this.rotateLeft(root);
    }

    return root;
  }

  // ambil node terkecil (paling kiri)
  getMinValueNode(node) {
    let current = node;
    while (current.left) current = current.left;
    return current;
  }

  // traversal inorder (debug console)
  printInorder(root) {
    if (root) {
      this.printInorder(root.left);
      console.log(root.info);
      this.printInorder(root.right);
    }
  }

  // hitung tinggi pohon
  treeHeight() {
    return this.getHeight(this.root) - 1;
  }
  search(node, value) {
    if (node == null) return false;

    if (value === node.info) return true;

    if (value < node.info) {
      return this.search(node.left, value);
    }

    return this.search(node.right, value);
  }
}

const avl = new AVLTree();
const insertBtn = document.getElementById("insertBtn");
const deleteBtn = document.getElementById("deleteBtn");
const resetBtn = document.getElementById("resetBtn");
const nodeValue = document.getElementById("nodeValue");

function showNotification(message, type = "info") {
  const oldNotif = document.querySelector(".notif");

  if (oldNotif) {
    oldNotif.remove();
  }

  const notif = document.createElement("div");

  notif.className = `notif ${type}`;

  notif.innerText = message;

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.classList.add("show");
  }, 10);

  setTimeout(() => {
    notif.classList.remove("show");

    setTimeout(() => {
      notif.remove();
    }, 300);
  }, 2500);
}

function draw_dot(x, y) {
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let index = 4 * (Math.round(x) + Math.round(y) * canvas.width);
  imageData.data[index] = 0;
  imageData.data[index + 1] = 0;
  imageData.data[index + 2] = 0;
  imageData.data[index + 3] = 255;
  ctx.putImageData(imageData, 0, 0);
}

function dda_line(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;

  let steps = Math.max(Math.abs(dx), Math.abs(dy));
  let Xinc = dx / steps;
  let Yinc = dy / steps;

  let X = x1;
  let Y = y1;

  for (let i = 0; i <= steps; i++) {
    draw_dot(X, Y);
    X += Xinc;
    Y += Yinc;
  }
}

function garisPenghubung(x1, y1, x2, y2, radius) {
  const angle = Math.atan2(y2 - y1, x2 - x1);

  const startX = x1 + Math.cos(angle) * radius;
  const startY = y1 + Math.sin(angle) * radius;

  const endX = x2 - Math.cos(angle) * radius;
  const endY = y2 - Math.sin(angle) * radius;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);

  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawCircleNode(x, y, radius, number) {
  // shadow
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  // lingkaran
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  // gradient modern
  const gradient = ctx.createLinearGradient(
    x - radius,
    y - radius,
    x + radius,
    y + radius,
  );

  gradient.addColorStop(0, "#4facfe");
  gradient.addColorStop(1, "#00c6fb");

  ctx.fillStyle = gradient;
  ctx.fill();

  // border
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // reset shadow
  ctx.shadowColor = "transparent";

  // text
  ctx.fillStyle = "white";
  ctx.font = "bold 16px Poppins";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(number, x, y);
}

function drawText(x, y, text) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function refreshCanvas() {
  animateTree();
}

function animateTree() {
  clearCanvas();
  drawTreeAnimated(avl.root, canvas.width / 2, 70, 1, 280, 90, 25);
}

function drawTreeAnimated(node, x, y, level, jarakX, jarakY, radius) {
  if (node == null) return;

  let offset = jarakX / level;

  let leftX = x - offset;
  let rightX = x + offset;

  let nextY = y + jarakY;

  // garis kiri
  if (node.left != null) {
    garisPenghubung(x, y, leftX, nextY, radius);
  }

  // garis kanan
  if (node.right != null) {
    garisPenghubung(x, y, rightX, nextY, radius);
  }

  // node
  drawCircleNode(x, y, radius, node.info);

  // subtree
  drawTreeAnimated(node.left, leftX, nextY, level + 1, jarakX, jarakY, radius);

  drawTreeAnimated(
    node.right,
    rightX,
    nextY,
    level + 1,
    jarakX,
    jarakY,
    radius,
  );
}

insertBtn.addEventListener("click", () => {
  const val = parseInt(nodeValue.value);

  // validasi input kosong
  if (isNaN(val)) {
    showNotification("Masukkan angka terlebih dahulu!", "warning");
    return;
  }

  // cek duplikat
  if (avl.search(avl.root, val)) {
    showNotification(`Angka ${val} sudah ada di AVL Tree`, "error");

    return;
  }

  avl.root = avl.insert(avl.root, val);

  refreshCanvas();

  showNotification(`Angka ${val} berhasil ditambahkan`, "success");

  nodeValue.value = "";
});

deleteBtn.addEventListener("click", () => {
  const val = parseInt(nodeValue.value);

  // validasi kosong
  if (isNaN(val)) {
    showNotification("Masukkan angka terlebih dahulu!", "warning");
    return;
  }

  // cek apakah ada
  if (!avl.search(avl.root, val)) {
    showNotification(`Angka ${val} tidak ditemukan`, "error");

    return;
  }

  avl.root = avl.delete(avl.root, val);

  refreshCanvas();

  showNotification(`Angka ${val} berhasil dihapus`, "success");

  nodeValue.value = "";
});

resetBtn.addEventListener("click", () => {
  // cek apakah tree kosong
  if (avl.root == null) {
    showNotification("AVL Tree sudah kosong", "warning");

    return;
  }

  // reset tree
  avl.root = null;

  clearCanvas();

  nodeValue.value = "";

  showNotification("AVL Tree berhasil direset", "success");
});

window.onload = function () {
  initGraphics("mycanvas");
};
