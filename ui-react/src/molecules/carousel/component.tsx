import React from 'react';
import styled from 'styled-components';
import { getClassName } from '@kibalabs/core';
import { IMultiAnyChildProps, flattenChildren, useScrollListener, useInterval, useRenderedRef } from '@kibalabs/core-react';

import { IMoleculeProps, defaultMoleculeProps } from '../moleculeProps';
import { Stack } from '../../layouts';
import { Direction, Alignment } from '../../model';
import { IconButton, IIconButtonTheme } from '../../atoms';
import { KibaIcon, IDimensionGuide, getScreenSize, ScreenSize } from '../../subatoms';
import { useDimensions } from '../../theming';
import { ResponsiveField, CssConverter, fieldToResponsiveCss } from '../../util';

const getSlidesPerPageCss: CssConverter<number> = (field: number): string => {
  return `width: calc(100% / ${field});`;
}

export interface ICarouselTheme {
  indexButtonTheme: IIconButtonTheme;
}

const StyledSlider = styled.div`
  display: flex;
  align-items: center;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;


  &::-webkit-scrollbar {
    width: 0px;
    height: 0px;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  /* Hide scrollbar on ie 11 */
  -ms-overflow-style: none;
  overflow: auto;
`;
StyledSlider.displayName = 'carousel-slider';

interface IStyledSlideProps {
  theme: IDimensionGuide;
  slidesPerPage: ResponsiveField<number>;
}

const StyledSlide = styled.div<IStyledSlideProps>`
  scroll-snap-align: start;
  flex-shrink: 0;
  height: 100%;
  transform-origin: center center;
  transform: scale(1);
  transition: transform 0.5s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  ${(props: IStyledSlideProps): string => fieldToResponsiveCss(props.slidesPerPage, props.theme, getSlidesPerPageCss)};
`;
StyledSlide.displayName = 'carousel-slide';

export interface ICarouselProps extends IMoleculeProps<ICarouselTheme>, IMultiAnyChildProps {
  shouldShowButtons?: boolean;
  autoplaySeconds?: number;
  initialIndex?: number;
  indexButtonVariant?: string;
  slidesPerPage: number;
  slidesPerPageResponsive?: ResponsiveField<number>;
  onIndexProgressed?: (slideIndexProgress: number) => void;
  onIndexChanged?: (slideIndex: number) => void;
}

// NOTE(krish): the slider could potentially be its own component here!
export const Carousel = (props: ICarouselProps): React.ReactElement => {
  const dimensions = useDimensions();
  const [sliderRef] = useRenderedRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = React.useRef<number | null>(null);
  const children = flattenChildren(props.children);
  const [slideIndex, setSlideIndex] = React.useState<number>(props.initialIndex);

  const onPreviousClicked = (): void => {
    if (sliderRef.current && !sliderRef.current.scrollTo) {
      // ie 11 doesn't support scrollTo (this doesn't animate nicely)
      sliderRef.current.scrollLeft = (slideIndex - 1) * sliderRef.current?.clientWidth;
    } else {
      sliderRef.current?.scrollTo((slideIndex - 1) * sliderRef.current?.clientWidth, 0);
    }
  }

  const onNextClicked = (): void => {
    goToNext();
  }

  const goToNext = (): void => {
    if (sliderRef.current && !sliderRef.current.scrollTo) {
      // ie 11 doesn't support scrollTo (this doesn't animate nicely)
      sliderRef.current.scrollLeft = (slideIndex + 1) * sliderRef.current?.clientWidth;
    } else {
      sliderRef.current?.scrollTo((slideIndex + 1) * sliderRef.current?.clientWidth, 0);
    }
  }

  useInterval(props.autoplaySeconds || 10000000, (): void => {
    if (props.autoplaySeconds) {
      goToNext();
    }
  }, false, [slideIndex]);

  React.useEffect((): void => {
    setTimeout((): void => {
      if (sliderRef.current && !sliderRef.current.scrollTo) {
        // ie 11 doesn't support scrollTo (this doesn't animate nicely)
        sliderRef.current.scrollLeft = sliderRef.current?.clientWidth * props.initialIndex;
      } else {
        sliderRef.current?.scrollTo(sliderRef.current?.clientWidth * props.initialIndex, 0);
      }
    }, 50);
  }, [props.initialIndex, sliderRef.current]);

  const slidesPerPage = props.slidesPerPageResponsive?.base || props.slidesPerPage;
  const slidesPerPageSmall = props.slidesPerPageResponsive?.small || slidesPerPage;
  const slidesPerPageMedium = props.slidesPerPageResponsive?.medium || slidesPerPageSmall;
  const slidesPerPageLarge = props.slidesPerPageResponsive?.large || slidesPerPageMedium;
  const slidesPerPageExtraLarge = props.slidesPerPageResponsive?.extraLarge || slidesPerPageLarge;

  const getScreenSizeValue = (size: ScreenSize, theme: IDimensionGuide): number => {
    return Number(getScreenSize(size, theme).replace('px', ''));
  }

  useScrollListener(sliderRef.current, (): void => {
    const position = Math.ceil(sliderRef.current?.scrollLeft);
    // TODO(krish): this doesn't work in console because it refers to the global document, not the local (inside iframe) one
    const screenWidth = Math.ceil(document.body.clientWidth);
    let slideCount = slidesPerPage;
    if (screenWidth > getScreenSizeValue(ScreenSize.Small, dimensions)) {
      slideCount = slidesPerPageSmall;
    }
    if (screenWidth > getScreenSizeValue(ScreenSize.Medium, dimensions)) {
      slideCount = slidesPerPageMedium;
    }
    if (screenWidth > getScreenSizeValue(ScreenSize.Large, dimensions)) {
      slideCount = slidesPerPageLarge;
    }
    if (screenWidth > getScreenSizeValue(ScreenSize.ExtraLarge, dimensions)) {
      slideCount = slidesPerPageExtraLarge;
    }
    const width = Math.ceil(sliderRef.current?.scrollWidth);
    const progress = (children.length / slideCount) * (position / width);
    const progressRounded = Math.round(progress * 100.0) / 100;
    const slideIndex = Math.round(progress);
    props.onIndexProgressed && props.onIndexProgressed(progressRounded);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout((): void => {
      setSlideIndex(slideIndex);
      scrollTimeoutRef.current = null;
    }, 50);
  });

  React.useEffect((): void => {
    props.onIndexChanged && props.onIndexChanged(slideIndex);
  }, [slideIndex]);

  return (
    <Stack
      id={props.id}
      className={getClassName(Carousel.displayName, props.className)}
      direction={Direction.Horizontal}
      childAlignment={Alignment.Center}
    >
      {props.shouldShowButtons && (
        <IconButton
          theme={props.theme?.indexButtonTheme}
          variant={props.indexButtonVariant}
          icon={<KibaIcon iconId='mui-chevron-left' />}
          label={'Previous'}
          onClicked={onPreviousClicked}
        />
      )}
      <Stack.Item growthFactor={1} shrinkFactor={1}>
        <StyledSlider
          ref={sliderRef}
          className={getClassName(StyledSlider.displayName)}
        >
          {children.map((child: React.ReactElement, index: number): React.ReactElement => {
            return (
              <StyledSlide
                key={index}
                className={getClassName(StyledSlide.displayName)}
                theme={dimensions}
                slidesPerPage={{base: props.slidesPerPage, ...props.slidesPerPageResponsive}}
              >
                {child}
              </StyledSlide>
            );
          })}
        </StyledSlider>
      </Stack.Item>
      {props.shouldShowButtons && (
        <IconButton
          theme={props.theme?.indexButtonTheme}
          variant={props.indexButtonVariant}
          icon={<KibaIcon iconId='mui-chevron-right'/>}
          label={'Next'}
          onClicked={onNextClicked}
        />
      )}
    </Stack>
  );
};

Carousel.displayName = 'Carousel';
Carousel.defaultProps = {
  ...defaultMoleculeProps,
  shouldShowButtons: true,
  autoplaySeconds: 7,
  initialIndex: 0,
  slidesPerPage: 1,
};
