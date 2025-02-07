import React from 'react';

import { IComponentProps, defaultComponentProps, ThemeType } from '../..';
import { Image } from '../image';
import { Video } from '../video';


export interface IMediaTheme extends ThemeType {
}

export interface IMediaProps extends IComponentProps<IMediaTheme> {
  source: string;
  alternativeText: string;
  isFullWidth: boolean;
  isFullHeight: boolean;
  isCenteredHorizontally: boolean;
  fitType: 'crop' | 'scale';
  isLazyLoadable: boolean;
}

export const Media = (props: IMediaProps): React.ReactElement => {
  const isVideo = (): boolean => {
    const fileExtension = props.source.split('.').pop().toLowerCase();
    return fileExtension === 'mp4' || fileExtension === 'webm' || fileExtension === 'ogg';
  }

  return isVideo() ? (
    <Video shouldShowControls={false} shouldLoop={true} shouldMute={true} shouldAutoplay={true} {...props} />
  ) : (
    <Image {...props} />
  );
};

Media.displayName = 'Media';
Media.defaultProps = {
  ...defaultComponentProps,
  fitType: 'scale',
  isFullWidth: false,
  isFullHeight: false,
  isCenteredHorizontally: false,
  isLazyLoadable: true,
};
