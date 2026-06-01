// Contains design constants for the app. Reference this for future screens.

import { StyleSheet, type TextStyle } from 'react-native';

export const Palette = {
  onTertiary: '#ffffff',
  tertiary: '#000000',
  surfaceContainerHigh: '#e9e8e7',
  onTertiaryFixedVariant: '#474745',
  onSecondaryFixedVariant: '#32408c',
  onPrimaryFixedVariant: '#474746',
  surfaceContainerLow: '#f5f3f3',
  secondary: '#4b58a5',
  surfaceContainerLowest: '#ffffff',
  onPrimary: '#ffffff',
  inverseOnSurface: '#f2f0f0',
  onBackground: '#1b1c1c',
  errorContainer: '#ffdad6',
  surfaceContainer: '#efeded',
  background: '#fbf9f9',
  secondaryFixed: '#dee0ff',
  secondaryContainer: '#9dabfe',
  onError: '#ffffff',
  tertiaryFixedDim: '#c8c6c3',
  secondaryFixedDim: '#bac3ff',
  onErrorContainer: '#93000a',
  onSecondaryFixed: '#00105b',
  outline: '#747878',
  primaryFixedDim: '#c8c6c5',
  surfaceTint: '#5f5e5e',
  surfaceVariant: '#e3e2e2',
  onSecondaryContainer: '#2e3d88',
  inversePrimary: '#c8c6c5',
  surfaceContainerHighest: '#e3e2e2',
  onSurfaceVariant: '#444748',
  onPrimaryContainer: '#858383',
  onSecondary: '#ffffff',
  onTertiaryContainer: '#858481',
  primaryContainer: '#1c1b1b',
  inverseSurface: '#303031',
  onPrimaryFixed: '#1c1b1b',
  onSurface: '#1b1c1c',
  outlineVariant: '#c4c7c7',
  onTertiaryFixed: '#1c1c1a',
  tertiaryContainer: '#1c1c1a',
  surfaceDim: '#dbdad9',
  surface: '#fbf9f9',
  error: '#ba1a1a',
  primaryFixed: '#e5e2e1',
  tertiaryFixed: '#e5e2df',
  primary: '#000000',
  surfaceBright: '#fbf9f9',
} as const;

export const Spacing = {
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
  stackXl: 64,
  containerMargin: 24,
  gutter: 16,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const FontFamilies = {
  body: 'Manrope_400Regular',
  bodySemiBold: 'Manrope_600SemiBold',
  display: 'Newsreader_500Medium',
} as const;

export const Typography = StyleSheet.create({
  displayLg: {
    fontFamily: FontFamilies.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.8,
    fontWeight: '500',
  },
  headlineMd: {
    fontFamily: FontFamilies.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '500',
  },
  titleLg: {
    fontFamily: FontFamilies.bodySemiBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.2,
    fontWeight: '600',
  },
  bodyMd: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  labelSm: {
    fontFamily: FontFamilies.bodySemiBold,
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0.96,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export const textVariants = {
  displayLg: Typography.displayLg as TextStyle,
  headlineMd: Typography.headlineMd as TextStyle,
  titleLg: Typography.titleLg as TextStyle,
  bodyMd: Typography.bodyMd as TextStyle,
  labelSm: Typography.labelSm as TextStyle,
};

export const LandingAssets = {
  backgroundImage:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBk3_CZIp6HpwH6QfgDjuFRRfDWEEBDHUNBrQh8DqxLsBnHW73pG1GXur0lrveraj9BOAQNlwWWwMCEFX8HNeQNZXDWJVfq-UO6mmnC59em4F05xdl12ujjYrzQKtuLU_aK_Zr841-VXChqhrZBKmjectiTh3UdeUsy8zckojqVU6WzW-oiAzcc4cp987SO8ODhjFL_Oj-_h490xMpraQIbfAr4_HxznJSC9_5G_NbEeIfUZVmw_PBCsmIueIJnfLOge9N53fAS-Ts',
} as const;
