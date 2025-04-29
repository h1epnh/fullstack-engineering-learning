import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Rect } from 'react-native-svg';

import colors from '../colors';

export const Instagram = ({
  color = colors.neutral[500],
  ...props
}: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <Rect
      x={2}
      y={2}
      width={20}
      height={20}
      rx={5}
      stroke={color}
      strokeWidth={1.219}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
      stroke={color}
      strokeWidth={1.219}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.5 6.5h.01"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);