
const blocks = document.getElementsByClassName("drawing-area")[0];
let addEdge = false;
let cnt = 0;
let dist = null;         
let arr = [];               
const MAX_NODES = 12;


const showTooltip = (message) => {
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    z-index: 1000;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  `;
  tooltip.textContent = message;
  document.body.appendChild(tooltip);

  gsap.from(tooltip, { y: -50, opacity: 0, duration: 0.5, ease: "power2.out" });
  setTimeout(() => {
    gsap.to(tooltip, {
      y: -50, opacity: 0, duration: 0.5, ease: "power2.in",
      onComplete: () => tooltip.remove()
    });
  }, 3000);
};

// First-visit hint
let alerted = localStorage.getItem("alerted") || "";
if (alerted !== "yes") {
  showTooltip("Click the info icon in the top-right corner for instructions");
  localStorage.setItem("alerted", "yes");
}

// ======= Utilities =======
const setAddEdgeLabel = (text) => {
  const btn = document.getElementById("add-edge-enable");
  let label = btn.querySelector(".btn-label");
  if (!label) {
    label = document.createElement("span");
    label.className = "btn-label";
    label.style.marginLeft = "8px";
    btn.appendChild(label);
  }
  label.textContent = text;
};

const buildDistMatrix = (n) => {
  const m = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity))
  );
  return m;
};

// ======= Edge-adding mode toggle (fixed) =======
const addEdges = () => {
  if (cnt < 2) {
    showTooltip("Create at least two nodes to add edges");
    return;
  }

  if (addEdge) {
    // turn OFF edge mode
    addEdge = false;
    setAddEdgeLabel("Add Edges");
    arr = [];
    gsap.to(".block", {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      borderColor: "rgba(255, 255, 255, 0.3)",
      duration: 0.3
    });
    return;
  }

  // turn ON edge mode
  addEdge = true;
  arr = [];
  setAddEdgeLabel("Stop adding edges");
  document.getElementsByClassName("run-btn")[0].disabled = false;

  // ensure dist sized to current nodes
  if (!dist || dist.length !== cnt) {
    dist = buildDistMatrix(cnt);
  }

  showTooltip("Click two nodes to create an edge. Repeat to add more edges.");
};

// ======= Node creation =======
const appendBlock = (x, y) => {
  document.querySelector(".reset-btn").disabled = false;

  // hide instruction smoothly
  const instr = document.querySelector(".click-instruction");
  if (instr) {
    gsap.to(instr, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => { instr.style.display = "none"; }
    });
  }

  const block = document.createElement("div");
  block.classList.add("block");

  // place node relative to drawing-area
  const rect = blocks.getBoundingClientRect();
  const relX = x - rect.left;
  const relY = y - rect.top;

  block.id = `node-${cnt}`;
  block.dataset.nodeId = String(cnt);
  block.style.top = `${relY}px`;
  block.style.left = `${relX}px`;
  block.style.transform = `translate(-50%,-50%) scale(0)`;
  block.innerText = String(cnt);
  cnt++;

  // node click in edge mode
  block.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!addEdge) return;

    // ripple fx
    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      pointer-events: none;
    `;
    block.appendChild(ripple);
    gsap.to(ripple, {
      scale: 1.5, opacity: 0, duration: 0.6, ease: "power2.out",
      onComplete: () => ripple.remove()
    });

    gsap.to(block, {
      backgroundColor: "rgba(255, 127, 80, 0.8)",
      borderColor: "rgba(255, 255, 255, 0.8)",
      duration: 0.25
    });

    arr.push(block.dataset.nodeId);

    if (arr.length === 2) {
      drawUsingId(arr.slice());
      arr = [];
      showTooltip("Click two more nodes to add another edge");
    } else {
      showTooltip("Select the second node to create an edge");
    }
  });

  blocks.appendChild(block);
  gsap.to(block, { scale: 1, duration: 0.5, ease: "back.out(1.7)" });
};

// click to create nodes (disabled during edge mode)
blocks.addEventListener("click", (e) => {
  if (addEdge) return;
  if (cnt >= MAX_NODES) {
    showTooltip(`Cannot add more than ${MAX_NODES} vertices`);
    return;
  }
  appendBlock(e.clientX, e.clientY);
});

// ======= Edge drawing =======
const drawLine = (x1, y1, x2, y2, ar) => {
  const node1 = Number(ar[0]);
  const node2 = Number(ar[1]);

  // matrix safety
  if (!dist || !Array.isArray(dist[node1]) || !Array.isArray(dist[node2])) {
    dist = buildDistMatrix(cnt);
  }

  // block duplicates
  if (dist[node1][node2] !== Infinity) {
    const node1El = document.getElementById(`node-${ar[0]}`);
    const node2El = document.getElementById(`node-${ar[1]}`);
    if (node1El && node2El) {
      gsap.to([node1El, node2El], {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderColor: "rgba(255, 255, 255, 0.3)",
        duration: 0.3
      });
    }
    showTooltip("Edge already exists between these nodes");
    return;
  }

  const len = Math.hypot(x1 - x2, y1 - y2);
  const slope = x2 - x1 ? (y2 - y1) / (x2 - x1) : (y2 > y1 ? 90 : -90);
  const weight = Math.round(len / 10);

  // set distance
  dist[node1][node2] = weight;
  dist[node2][node1] = weight;

  // draw line
  const line = document.createElement("div");
  line.id = node1 < node2 ? `line-${node1}-${node2}` : `line-${node2}-${node1}`;
  line.classList.add("line");
  line.style.width = "0px";
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;
  line.style.transform = `rotate(${x1 > x2 ? Math.PI + Math.atan(slope) : Math.atan(slope)}rad)`;

  // weight bubble
  const p = document.createElement("p");
  p.classList.add("edge-weight");
  p.innerText = String(weight);
  p.contentEditable = "true";
  p.inputMode = "numeric";
  p.style.opacity = "0";
  p.addEventListener("blur", (e) => {
    const raw = String(e.target.innerText || "").trim();
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) {
      showTooltip("Please enter a valid non-negative number");
      e.target.innerText = String(dist[node1][node2]);
      return;
    }
    const [_, a, b] = line.id.split("-");
    const n1 = Number(a), n2 = Number(b);
    dist[n1][n2] = num;
    dist[n2][n1] = num;
    gsap.from(p, { scale: 1.1, duration: 0.25, ease: "power2.out" });
  });

  p.style.transform = `rotate(${x1 > x2 ? (Math.PI + Math.atan(slope)) * -1 : Math.atan(slope) * -1}rad)`;
  line.appendChild(p);
  blocks.appendChild(line);

  // animate
  gsap.to(line, { width: len, duration: 0.6, ease: "power2.out" });
  gsap.to(p, { opacity: 1, duration: 0.3, delay: 0.3 });

  // reset node colors after edge drawn
  const node1El = document.getElementById(`node-${ar[0]}`);
  const node2El = document.getElementById(`node-${ar[1]}`);
  gsap.to([node1El, node2El], {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    duration: 0.3, delay: 0.6
  });
};

// coordinates from ids
const drawUsingId = (ar) => {
  if (ar[0] === ar[1]) {
    const el = document.getElementById(`node-${ar[0]}`);
    if (el) el.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
    arr = [];
    return;
  }
  const el1 = document.getElementById(`node-${ar[0]}`);
  const el2 = document.getElementById(`node-${ar[1]}`);
  if (!el1 || !el2) {
    showTooltip("One of the nodes doesn't exist");
    arr = [];
    return;
  }
  const x1 = Number(el1.style.left.replace("px", ""));
  const y1 = Number(el1.style.top.replace("px", ""));
  const x2 = Number(el2.style.left.replace("px", ""));
  const y2 = Number(el2.style.top.replace("px", ""));
  drawLine(x1, y1, x2, y2, ar);

  // keep button enabled
  document.getElementById("add-edge-enable").disabled = false;
};

// ======= Dijkstra (fixed for unreachable nodes) =======
const findShortestPath = (el) => {
  clearScreen();

  const source = Number(el.previousElementSibling.value);
  if (source >= cnt || isNaN(source)) {
    showTooltip("Invalid source node");
    return;
  }

  // highlight source
  const srcEl = document.getElementById(`node-${source}`);
  if (srcEl) srcEl.style.backgroundColor = "rgba(128, 128, 128, 0.8)";

  const visited = [];
  const unvisited = [];
  for (let i = 0; i < cnt; i++) unvisited.push(i);

  const cost = Array(cnt).fill(Infinity);
  const parent = Array(cnt).fill(null);
  cost[source] = 0;
  parent[source] = -1;

  while (unvisited.length) {
    const best = Math.min(...unvisited.map(i => cost[i]));
    if (!isFinite(best)) break; // remaining nodes not reachable

    const mini = unvisited.find(i => cost[i] === best);
    visited.push(mini);
    unvisited.splice(unvisited.indexOf(mini), 1);

    for (const j of unvisited) {
      if (dist && dist[mini] && isFinite(dist[mini][j])) {
        const alt = cost[mini] + dist[mini][j];
        if (alt < cost[j]) {
          cost[j] = alt;
          parent[j] = mini;
        }
      }
    }
  }

  indicatePath(parent, source);
};

const indicatePath = async (parentArr, src) => {
  const pathBox = document.getElementsByClassName("path")[0];
  pathBox.innerHTML = "";
  pathBox.style.padding = "1rem";

  for (let i = 0; i < cnt; i++) {
    const p = document.createElement("p");
    if (i === src) {
      p.innerText = `Node ${i} --> ${src}`;
      pathBox.appendChild(p);
      continue;
    }

    if (parentArr[i] === null) {
      p.innerText = `Node ${i} --> unreachable`;
      pathBox.appendChild(p);
      continue;
    }

    p.innerText = `Node ${i} --> ${src}`;
    await printPath(parentArr, i, p);
  }
};

const printPath = async (parent, j, el_p) => {
  if (parent[j] === -1) return;
  await printPath(parent, parent[j], el_p);
  el_p.innerText = `${el_p.innerText} ${j}`;

  const box = document.getElementsByClassName("path")[0];
  box.appendChild(el_p);

  const a = Math.min(j, parent[j]);
  const b = Math.max(j, parent[j]);
  const id = `line-${a}-${b}`;
  const edge = document.getElementById(id);
  if (edge) await colorEdge(edge);
};

const colorEdge = async (el) => {
  if (el.style.backgroundColor !== "rgba(64, 224, 208, 0.8)") {
    await wait(600);
    gsap.to(el, {
      backgroundColor: "rgba(64, 224, 208, 0.8)",
      height: "8px",
      duration: 0.4,
      ease: "power2.out",
      boxShadow: "0 0 15px rgba(64, 224, 208, 0.5)"
    });
  }
};

const clearScreen = () => {
  gsap.to(".path", {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      document.getElementsByClassName("path")[0].innerHTML = "";
      gsap.to(".path", { opacity: 1, duration: 0.3 });
    }
  });

  const lines = document.getElementsByClassName("line");
  gsap.to(lines, {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    height: "3px",
    boxShadow: "none",
    duration: 0.5,
    stagger: { each: 0.05, from: "random" }
  });
};

const resetDrawingArea = () => {
  gsap.to([".block", ".line"], {
    opacity: 0, scale: 0.8, duration: 0.5,
    stagger: { each: 0.02, from: "random" },
    onComplete: () => {
      blocks.innerHTML = "";

      const p = document.createElement("p");
      p.classList.add("click-instruction");
      p.innerHTML = "Click anywhere to create a node";
      blocks.appendChild(p);
      gsap.from(p, { opacity: 0, y: 20, duration: 0.5 });
    }
  });

  document.getElementById("add-edge-enable").disabled = false;
  document.querySelector(".reset-btn").disabled = true;
  document.getElementsByClassName("path")[0].innerHTML = "";

  cnt = 0;
  dist = null;          // IMPORTANT: null so we rebuild correctly
  addEdge = false;
  arr = [];
};

const wait = (t) => new Promise(resolve => setTimeout(resolve, t));

// ======= IMPORTANT: make lines click-through but keep weights editable (no CSS file change) =======
(() => {
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .line { pointer-events: none; }
    .line .edge-weight { pointer-events: auto; }
  `;
  document.head.appendChild(styleEl);
})();
