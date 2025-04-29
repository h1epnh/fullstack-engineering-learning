import * as React from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Circle } from 'react-native-svg';

import colors from '../colors';

export const Zalo = ({
  color = colors.neutral[500],
  ...props
}: SvgProps) => (
  <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <Circle
      cx={12}
      cy={12}
      r={9}
      stroke={color}
      strokeWidth={1.219}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 9h8M8 12h4m4 0h-2.5v3"
      stroke={color}
      strokeWidth={1.219}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.5 9v6"
      stroke={color}
      strokeWidth={1.219}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);