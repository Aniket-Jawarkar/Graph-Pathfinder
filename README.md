Graph Pathfinder : Dijkstra’s Algorithm (Interactive Visualizer)

Interactive shortest-path visualizer implementing Dijkstra’s Algorithm on a user-built graph.
Place nodes, add weighted edges, edit costs, and watch the algorithm relax edges and reconstruct paths in real time.

Built for people who actually care about DSA correctness, not just pretty UI.

🔎 What this project demonstrates

Single-Source Shortest Path (SSSP) on weighted, non-negative graphs

Correct edge relaxation and parent tracking for path reconstruction

Handles disconnected components (marks nodes as unreachable)

Clean separation of graph modeling and visual rendering

Deterministic behavior suitable for teaching, interviews, and self-study

🧠 Algorithm (Dijkstra)

Given a source 
𝑠
s, maintain:

dist[v] = current best-known distance from 
𝑠
s to 
𝑣
v

parent[v] = predecessor of 
𝑣
v on the shortest path

visited = set of nodes whose shortest distances are finalized

At each step:

Pick unvisited node 
𝑢
u with minimum dist[u]

For each neighbor 
𝑣
v: if dist[v] > dist[u] + w(u,v) ⇒ relax

dist[v] = dist[u] + w(u,v)

parent[v] = u

Mark 
𝑢
u visited

Stop when all nodes are visited or remaining nodes are unreachable (∞)

Correctness sketch:
Dijkstra’s greedy choice is safe because once a node 
𝑢
u is chosen with the globally minimum tentative distance, there is no shorter path to 
𝑢
u through any unvisited node (triangle inequality on non-negative weights).

Complexity:

Current build: O(V²) (array + linear extract-min) — simple & clear
