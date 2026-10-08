# Visual Design — Drop-It English

Updated 2026-10-08. Internationalization retains the original visual system and interaction geometry.

- Canvas: parchment `#d6d3cb`, without a grid.
- Cards: paper-white backgrounds, ink-black text/borders, existing rectangular geometry.
- Ink: `#1d1d1d`; supporting lines: ash `#a8a7a2`.
- Floating titles retain their two heading levels and existing font scales.
- Origins retain their circular shape and four default color gradients. Groups retain convex outlines and collapsed member lists.
- Tree connections, minimap outlines, selection feedback, LOD and viewport rendering retain existing styles.
- Context commands stay in 72px circles with fixed directions; child circles retain their hit priority, spacing and connecting lines. English labels wrap inside the existing circle without moving commands.
- Settings retain straight-corner white nodes, 13px text and tree links. Existing node/row dimensions remain unchanged. Folder controls stay at 216×84px.
- Language is a small Settings header button. The first-use picker is centered, paper-white, ink-bordered and keyboard navigable, with English selected initially. It does not move or remount the underlying canvas.
- Hovering the top 40px still reveals the draggable title bar. Window controls and canvas positioning remain unchanged.

English sample card text is sized using the existing text measurement rules so translation does not truncate headings. Positions, IDs, relationships and example object counts are preserved. This adjustment applies only to the distributed sample, not to user cards.
