import React from 'react';
import styled from 'styled-components';
import { getClassName } from '@kibalabs/core';

import { IComponentProps, defaultComponentProps, useBuiltTheme } from '../..';
import { IVideoTheme } from './theme';

export interface IStyledVideoProps {
  theme: IVideoTheme;
  isFullWidth: boolean;
  isFullHeight: boolean;
  isCenteredHorizontally: boolean;
  fitType: 'crop' | 'scale';
}

const StyledVideo = styled.video<IStyledVideoProps>`
  display: block;
  width: ${(props: IStyledVideoProps): string => (props.isFullWidth ? '100%' : 'auto')};
  height: ${(props: IStyledVideoProps): string => (props.isFullHeight ? '100%' : 'auto')};
  object-fit: ${(props: IStyledVideoProps): string => (props.fitType === 'crop' ? 'cover' : 'fill')};

  &.lazyloaded, &.unlazy {
    max-width: 100%;
    max-height: 100%;
  }

  /* TODO(krish): should all things be like this? */
  &.centered {
    margin-left: auto;
    margin-right: auto;
  }
`;

export interface IVideoProps extends IComponentProps<IVideoTheme> {
  source: string;
  alternativeText: string;
  isFullWidth: boolean;
  isFullHeight: boolean;
  isCenteredHorizontally: boolean;
  fitType: 'crop' | 'scale';
  shouldShowControls: boolean;
  shouldAutoplay: boolean;
  shouldMute: boolean;
  shouldLoop: boolean;
  isLazyLoadable: boolean;
}

export const Video = (props: IVideoProps): React.ReactElement => {
  const theme = useBuiltTheme('videos', props.variant, props.theme);
  return (
    <StyledVideo
      id={props.id}
      className={getClassName(Video.displayName, props.className, props.isLazyLoadable ? 'lazyload' : 'unlazy', props.isCenteredHorizontally && 'centered')}
      theme={theme}
      autoPlay={props.shouldAutoplay}
      muted={props.shouldMute}
      playsInline={true}
      controls={props.shouldShowControls}
      loop={props.shouldLoop}
      fitType={props.fitType}
      isFullWidth={props.isFullWidth}
      isFullHeight={props.isFullHeight}
      isCenteredHorizontally={props.isCenteredHorizontally}
    >
      <source src={props.source} />
      {props.alternativeText}
    </StyledVideo>
  );
};

Video.displayName = 'Video';
Video.defaultProps = {
  ...defaultComponentProps,
  fitType: 'scale',
  isFullWidth: false,
  isFullHeight: false,
  isCenteredHorizontally: false,
  shouldShowControls: true,
  shouldAutoplay: false,
  shouldMute: false,
  shouldLoop: false,
  isLazyLoadable: true,
};
