import React from "react"
import { Box, Static } from "ink"
import Gradient from "ink-gradient"
import BigText from "ink-big-text"

const Header = () => (
  <Static items={["Hue HDMI sync"]}>
    {(label) => (
      <Box key={label} borderStyle="round" justifyContent="center">
        <Gradient name="rainbow">
          <BigText text={label} />
        </Gradient>
      </Box>
    )}
  </Static>
)

export default Header
