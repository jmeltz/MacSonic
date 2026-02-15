export function extractPeaks(
  channelData: Float32Array,
  numPeaks: number
): number[] {
  const peaks: number[] = new Array(numPeaks);
  const samplesPerPeak = Math.floor(channelData.length / numPeaks);

  for (let i = 0; i < numPeaks; i++) {
    let max = 0;
    const start = i * samplesPerPeak;
    const end = Math.min(start + samplesPerPeak, channelData.length);

    for (let j = start; j < end; j++) {
      const abs = Math.abs(channelData[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }

  return peaks;
}

export function downsamplePeaks(
  peaks: number[],
  targetWidth: number
): number[] {
  if (peaks.length <= targetWidth) return peaks;

  const result: number[] = new Array(targetWidth);
  const ratio = peaks.length / targetWidth;

  for (let i = 0; i < targetWidth; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    let max = 0;
    for (let j = start; j < end; j++) {
      if (peaks[j] > max) max = peaks[j];
    }
    result[i] = max;
  }

  return result;
}

export async function decodeAndExtractPeaks(
  arrayBuffer: ArrayBuffer,
  numPeaks: number = 4000
): Promise<number[]> {
  const audioContext = new AudioContext();
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    return extractPeaks(channelData, numPeaks);
  } finally {
    await audioContext.close();
  }
}
