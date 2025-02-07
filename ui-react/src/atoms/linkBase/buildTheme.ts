import { RecursivePartial } from '@kibalabs/core';

import { mergeTheme, mergeThemePartial, ThemeMap } from '../../util';
import { IColorGuide, IDimensionGuide, IBoxTheme } from '../../subatoms';
import { ILinkBaseTheme } from './theme';

export const buildLinkBaseThemes = (colors: IColorGuide, dimensions: IDimensionGuide, boxThemes: ThemeMap<IBoxTheme>, base: RecursivePartial<Record<string, ILinkBaseTheme>>): ThemeMap<ILinkBaseTheme> => {
  const defaultLinkBaseTheme = mergeTheme<ILinkBaseTheme>({
    normal: {
      default: {
        background: mergeTheme(boxThemes.default, boxThemes.focusable, {
        }),
        linkBase: {
          opacity: '1',
        },
      },
      hover: {
        background: {
          'background-color': '$colors.brandPrimaryClear80',
        },
      },
      press: {
        background: {
          'background-color': '$colors.brandPrimaryClear60',
        },
      },
      focus: {
        background: boxThemes.focussed,
      },
    },
    disabled: {
      default: {
        background: {
          'background-color': '$colors.disabledText',
        },
      },
    },
  }, base?.default);

  const translucentLinkBaseTheme = mergeThemePartial<ILinkBaseTheme>({
  }, base?.translucent);

  const imageLinkBaseTheme = mergeThemePartial<ILinkBaseTheme>({
    normal: {
      hover: {
        linkBase: {
          opacity: '0.8',
        },
      },
      press: {
        linkBase: {
          opacity: '0.6',
        },
      },
    },
  }, base?.translucent);

  return {
    ...base,
    default: defaultLinkBaseTheme,
    translucent: translucentLinkBaseTheme,
    image: imageLinkBaseTheme,
  };
}
