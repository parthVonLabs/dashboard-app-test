export type SizeKey = "small" | "medium" | "large";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random numeric dataset according to size partition rules
export function generateDataset(size: SizeKey) {
  let len = 0;
  if (size === "small") {
    len = rand(20, 900); // < 1k
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
