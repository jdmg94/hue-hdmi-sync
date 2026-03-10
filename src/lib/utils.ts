import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface Size {
  width: number
  height: number
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface FrameRegions {
  regions: Rect[]
  indices: number[]
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const splitIntoLightstripGradientRegions = (size: Size): FrameRegions => {
  const halfHeight = Math.floor(size.height / 2)
  const oneThirdWidth = Math.floor(size.width / 3)

  const firstQuarter: Rect = {
    x: 0,
    y: halfHeight,
    width: oneThirdWidth,
    height: halfHeight,
  }

  const secondQuarter: Rect = {
    x: 0,
    y: 0,
    width: oneThirdWidth,
    height: halfHeight,
  }

  const oneThird: Rect = {
    x: oneThirdWidth,
    y: 0,
    width: oneThirdWidth,
    height: halfHeight,
  }

  const thirdQuarter: Rect = {
    x: oneThirdWidth * 2,
    y: 0,
    width: oneThirdWidth,
    height: halfHeight,
  }

  const fourthQuarter: Rect = {
    x: oneThirdWidth * 2,
    y: halfHeight,
    width: oneThirdWidth,
    height: halfHeight,
  }

  // Store unique regions (no duplicates)
  const regions = [
    firstQuarter,
    secondQuarter,
    oneThird,
    thirdQuarter,
    fourthQuarter,
  ]

  // Map indices to lightstrip positions (with duplicates)
  // This allows us to calculate mean() only once per unique region
  const indices = [0, 1, 1, 2, 3, 3, 4]

  return { regions, indices }
}