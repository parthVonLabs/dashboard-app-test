export type SizeKey = "tiny" | "small" | "medium" | "large";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random numeric dataset according to size partition rules
export function generateDataset(size: SizeKey) {
  let len = 0;
  // tiny: <100, small: <500, medium: 1k-10k, large: >10k
  if (size === "tiny") {
    len = rand(10, 90); // <100
  } else if (size === "small") {
    len = rand(50, 450); // <500
  } else if (size === "medium") {
    len = rand(1000, 9000); // 1k - 10k
  } else {
    len = rand(10000, 20000); // >10k
  }

  const data: number[] = new Array(len).fill(0).map(() => Math.round(Math.random() * 1000));
  const labels = new Array(len).fill(0).map((_, i) => String(i + 1));
  return { labels, data };
}

// Helper to return a sampled dataset for rendering (cap to avoid huge charts)
export function sampleForRender(labels: string[], data: number[], cap = 2000) {
  if (data.length <= cap) return { labels, data };
  const step = Math.ceil(data.length / cap);
  const sampledLabels: string[] = [];
  const sampled: number[] = [];
  for (let i = 0; i < data.length; i += step) {
    sampledLabels.push(labels[i]);
    sampled.push(data[i]);
  }
  return { labels: sampledLabels, data: sampled };
}
