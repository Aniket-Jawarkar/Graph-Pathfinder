const header = document.querySelector("header");
const canvas = document.querySelector(".drawing-area");
const instruction = document.querySelector(".click-instruction");

const tl = gsap.timeline({
  defaults: { ease: "power3.out", duration: 1 }
});

tl.fromTo(
  canvas,
  { opacity: 0, scale: 0.95 },
  { opacity: 1, scale: 1, duration: 1.2 }
).fromTo(
  header,
  { y: -100, opacity: 0 },
  { y: 0, opacity: 1, duration: 1 },
  "-=0.8"
).fromTo(
  instruction || {}, // guard if it was removed already
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.8 },
  "-=0.5"
);

// optional exported helpers (you had these)
function animateNodeCreation(node) {
  gsap.from(node, { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.7)" });
}
function animateEdgeCreation(edge) {
  gsap.from(edge, { scaleX: 0, opacity: 0, duration: 0.6, ease: "power2.out" });
}
function highlightPath(pathNodes) {
  gsap.to(pathNodes, {
    scale: 1.15,
    boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
    border: "2px solid rgba(255, 255, 255, 0.8)",
    stagger: { each: 0.2, from: "start" },
    duration: 0.4,
    ease: "power2.out"
  });
}

window.animateNodeCreation = animateNodeCreation;
window.animateEdgeCreation = animateEdgeCreation;
window.highlightPath = highlightPath;
