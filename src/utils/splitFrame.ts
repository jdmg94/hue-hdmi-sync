import { Size, Rect } from "@u4/opencv4nodejs"

const splitIntoLightstripGradientRegions = (size: Size): Rect[] => {
  const halfHeight = Math.floor(size.height / 2)
  const oneThirdWidth = Math.floor(size.width / 3)
  const firstQuarter = new Rect(0, halfHeight, oneThirdWidth, halfHeight)
  const secondQuarter = new Rect(0, 0, oneThirdWidth, halfHeight)
  const oneThird = new Rect(oneThirdWidth, 0, oneThirdWidth, halfHeight)
  const thirdQuarter = new Rect(oneThirdWidth * 2, 0, oneThirdWidth, halfHeight)
  const fourthQuarter = new Rect(
    oneThirdWidth * 2,
    halfHeight,
    oneThirdWidth,
    halfHeight
  )

  return [
    firstQuarter,
    secondQuarter,
    secondQuarter,
    oneThird,
    thirdQuarter,
    thirdQuarter,
    fourthQuarter,
  ]
}

export default splitIntoLightstripGradientRegions
