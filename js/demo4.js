/**
 * demo2.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2019, Codrops
 * http://www.codrops.com
 */
{
    class TextFX {
        constructor(el) {
            this.DOM = {el: el};
            this.DOM.texts = [...this.DOM.el.querySelectorAll('.content__text')];
            this.DOM.textsTotal = this.DOM.texts.length;
            this.middleIdx = Math.floor(this.DOM.textsTotal/2);
            this.loopInterval = {show: 80, hide: 80};
            this.loopEndIddleTime = this.loopInterval.show;
        }
        show({dir = 'both', halfwayCallback = null} = {}) {
            return new Promise((resolve, reject) => {
                const loopHide = (pos) => {
                    if ( this.middleIdx-pos === this.middleIdx ) {
                        setTimeout(resolve, this.loopEndIddleTime);
                        return;
                    }
                    this.hideText(pos, dir);
                    setTimeout(() => loopHide(pos-1), this.loopInterval.hide);
                };
                const loopShow = (pos) => {
                    if ( this.middleIdx-pos > this.middleIdx ) {
                        if ( halfwayCallback && typeof halfwayCallback === 'function') {
                            halfwayCallback();
                        }
                        loopHide(this.middleIdx);
                        return;
                    }
                    this.showText(pos, dir);
                    setTimeout(() => loopShow(pos-1), this.loopInterval.show);
                };
                loopShow(this.middleIdx);
            });
        }
        hide({dir = 'both', halfwayCallback = null} = {}) {
            return new Promise((resolve, reject) => {
                const loopHide = (pos) => {
                    if ( this.middleIdx-pos < 0 ) {
                        setTimeout(resolve, this.loopEndIddleTime);
                        return;
                    }
                    this.hideText(pos, dir);
                    setTimeout(() => loopHide(pos+1), this.loopInterval.hide);
                };
                const loopShow = (pos) => {
                    if ( this.middleIdx-pos < 0 ) {
                        if ( halfwayCallback && typeof halfwayCallback === 'function') {
                            halfwayCallback();
                        }
                        loopHide(0);
                        return;
                    }
                    this.showText(pos, dir);
                    setTimeout(() => loopShow(pos+1), this.loopInterval.show);
                };
                loopShow(1);
            });
        }
        hideText(pos, dir) {
            this.toggleText('hide', pos, dir);
        }
        showText(pos, dir) {
            this.toggleText('show', pos, dir);
        }
        toggleText(action, pos, dir) {
            const changeStyle = {
                up: _ => {
                    this.DOM.texts[this.middleIdx-pos].style.opacity = action === 'show' ? 1 : 0;
                    this.DOM.texts[this.middleIdx-pos].style.transform = `translateX(${pos === 0 && action === 'show' ? 0 : -pos*40}px)`;
                },
                down: _ => {
                    this.DOM.texts[this.middleIdx+pos].style.opacity = action === 'show' ? 1 : 0;
                    this.DOM.texts[this.middleIdx+pos].style.transform = `translateX(${pos === 0 && action === 'show' ? 0 : pos*40}px)`;
                }
            };
            if ( dir === 'both' ) {
                changeStyle['up']();
                changeStyle['down']();
            }
            else {
                changeStyle[dir]();
            }
        }
    }

    class Slide {
        constructor(el) {
            this.DOM = {el: el};
            this.DOM.img = {
                wrap: this.DOM.el.querySelector('.content__img'),
                inner: this.DOM.el.querySelector('.content__img-inner')
            };
            this.textFX = new TextFX(this.DOM.el.querySelector('.content__text-wrap'));
        }
        hideImage(dir) {
            this.toggleImage('hide', dir);
        }
        showImage(dir) {
            this.toggleImage('show', dir);
        }
        toggleImage(action, dir) {
            new TimelineMax().add('begin')
            .to(this.DOM.img.wrap, action === 'hide' ? 0.6 : 1.2, { 
                ease: action === 'hide' ? Sine.easeInOut : Expo.easeOut,
                startAt: action === 'hide' ? {} : {x: dir === 'next' ? '50%' : '-50%', y: dir === 'next' ? '110%' : '-110%', opacity: 0, skewX: 20},
                x: action === 'hide' ? dir === 'next' ? '-50%' : '50%' : '0%',
                y: action === 'hide' ? dir === 'next' ? '-110%' : '110%' : '0%',
                skewX: action === 'hide' ? 20 : 0,
                opacity: action === 'hide' ? 0 : 1
            }, 'begin');
        }
    }

    class Slideshow {
        constructor(el) {
            this.DOM = {el: el};
            this.DOM.nav = {
                prev: this.DOM.el.querySelector('.content__nav-button--prev'),
                next: this.DOM.el.querySelector('.content__nav-button--next')
            };
            this.slides = [];
            [...this.DOM.el.querySelectorAll('.content__slide')].forEach(slide => this.slides.push(new Slide(slide)));
            this.slidesTotal = this.slides.length;
            this.current = 0;
            this.slides[this.current].DOM.el.classList.add('content__slide--current');
            this.initEvents();
        }
        initEvents() {
            this.onClickPrevFn = _ => this.navigate('prev');
            this.onClickNextFn = _ => this.navigate('next');
            this.DOM.nav.prev.addEventListener('click', this.onClickPrevFn);
            this.DOM.nav.next.addEventListener('click', this.onClickNextFn);
        }
        navigate(dir) {
            if ( this.isAnimating ) {
                return false;
            }
            this.isAnimating = true;
            // Current slide
            const currentSlide = this.slides[this.current];
            
            // Update current
            this.current = dir === 'next' ? 
                this.current < this.slidesTotal - 1 ? this.current + 1 : 0 :
                this.current > 0 ? this.current - 1 : this.slidesTotal - 1;
                
            // Upcoming slide
            const upcomingSlide = this.slides[this.current];

            const onCurrentEndCallback = () => {
                currentSlide.DOM.el.classList.remove('content__slide--current');

                upcomingSlide.textFX.DOM.texts[upcomingSlide.textFX.middleIdx].style.opacity = 0;
                upcomingSlide.textFX.show().then(() => this.isAnimating = false);
                upcomingSlide.DOM.el.classList.add('content__slide--current');
                upcomingSlide.showImage(dir)
            };
            currentSlide.hideImage(dir);
            currentSlide.textFX.hide().then(onCurrentEndCallback);
        }
    }

    new Slideshow(document.querySelector('.content'));

    // Preload all the images in the page.
    imagesLoaded(document.querySelectorAll('.content__img-inner'), {background: true}, () => document.body.classList.remove('loading'));
}