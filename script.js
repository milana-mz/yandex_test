document.addEventListener('DOMContentLoaded', function () {
  createCarousel('.carousel');
  createSlideShow('.grid-steps');
  loadFontsAndAnimateRunningLine();
});

// Слайдер карусели участников
function createCarousel(containerSelector) {
  const container = document.querySelector(containerSelector);
  const prevButton = container.querySelector('.participants__prev-btn');
  const nextButton = container.querySelector('.participants__next-btn');
  const participantsList = container.querySelector('.participants__list');
  const participants = container.querySelectorAll('.participant');
  const participantsLength = participants.length;
  const participant = container.querySelector('.participant');
  const currentParticipants = container.querySelector('.participants__current-items');
  const countParticipants = container.querySelector('.participants__count-items');

  let currentIndex = 0;
  let visibleItems = calculateVisibleParticipants(participantsList.offsetWidth, participant.offsetWidth);
  let autoSlideTimeout;

  function autoSlide(initialDelay = 0) {
    clearTimeout(autoSlideTimeout);
    autoSlideTimeout = setTimeout(() => {
      if (currentIndex + visibleItems < participantsLength) {
        currentIndex += visibleItems;
      } else {
        currentIndex = 0;
      }
      updateUI();
      autoSlide(4000);
    }, initialDelay);
  }

  function updateUI() {
    countParticipants.textContent = participantsLength.toString();
    moveParticipantsList();
    updateButtonState();
    updateIndicator();
  }

  function moveParticipantsList() {
    currentIndex = Math.min(currentIndex, participantsLength - visibleItems);
    const offset = currentIndex * (participant.offsetWidth + (window.innerWidth > 1350 ? 20 : 0));
    participantsList.style.transform = `translateX(-${offset}px)`;
  }

  function handleClickNext() {
    clearTimeout(autoSlideTimeout);
    if (currentIndex + visibleItems < participantsLength) {
      currentIndex += visibleItems;
    }
    updateUI();
    autoSlide(4000);
  }

  function handleClickPrev() {
    clearTimeout(autoSlideTimeout);
    currentIndex = Math.max(0, currentIndex - visibleItems);
    updateUI();
    autoSlide(4000);
  }

  function calculateVisibleParticipants(containerWidth, itemWidth) {
    const tolerance = 0.05;
    const exactCount = containerWidth / itemWidth;
    const roundedCount = Math.floor(exactCount);
    const fraction = exactCount - roundedCount;
    return (1 - fraction <= tolerance) ? roundedCount + 1 : roundedCount;
  }

  function updateIndicator() {
    const endIndex = Math.min(currentIndex + visibleItems, participantsLength);
    currentParticipants.textContent = endIndex.toString();
  }

  function updateButtonState() {
    prevButton.disabled = currentIndex <= 0;
    nextButton.disabled = currentIndex >= participantsLength - visibleItems;
  }

  nextButton.addEventListener('click', handleClickNext);
  prevButton.addEventListener('click', handleClickPrev);

  window.addEventListener('resize', debounce(() => {
    visibleItems = calculateVisibleParticipants(participantsList.offsetWidth, participant.offsetWidth);
    if (currentIndex > participantsLength - visibleItems) {
      currentIndex = Math.max(0, participantsLength - visibleItems);
    }
    updateUI();
    autoSlide(4000);
  }, 150));

  updateUI();
  autoSlide(4000);
}

// Слайд-шоу этапов
function createSlideShow(gridStepsSelector) {
  let currentSlideIndex = 0;
  let gridSteps = document.querySelector(gridStepsSelector);
  const steps = gridSteps.querySelectorAll('.grid-steps__step');
  const prevButton = document.querySelector('.slider-controls__button_type_prev');
  const nextButton = document.querySelector('.slider-controls__button_type_next');
  const indicatorsContainer = document.querySelector('.slider-controls__buttons-container');
  let cachedSlides = calculateSlides(steps);

  function showCurrentSlide() {
    steps.forEach((step) => {
      step.style.visibility = 'hidden';
      step.style.position = 'absolute';
      step.style.opacity = '0';
    });

    cachedSlides[currentSlideIndex].forEach((step) => {
      step.style.opacity = '1';
      step.style.visibility = 'visible';
      step.style.position = 'relative';
    });

    updateActiveIndicators();

    prevButton.disabled = currentSlideIndex === 0;
    nextButton.disabled = currentSlideIndex === cachedSlides.length - 1;
  }

  function calculateSlides() {
    const gridStepsStyles = window.getComputedStyle(gridSteps);
    const gridStepsPaddingTop = parseInt(gridStepsStyles.paddingTop, 10);
    const gridStepsPaddingBottom = parseInt(gridStepsStyles.paddingBottom, 10);
    const containerHeight = gridSteps.offsetHeight - gridStepsPaddingBottom - gridStepsPaddingTop;

    const slides = [];
    let currentSlide = [];
    let totalHeight = 0;

    steps.forEach((step) => {
      const stepHeight = step.offsetHeight;
      if (stepHeight > containerHeight / 2) {
        if (totalHeight > 0) {
          slides.push(currentSlide);
          currentSlide = [];
          totalHeight = 0;
        }
        slides.push([step]);
      } else if (totalHeight + stepHeight > containerHeight) {
        slides.push(currentSlide);
        currentSlide = [step];
        totalHeight = stepHeight;
      } else {
        currentSlide.push(step);
        totalHeight += stepHeight;
      }
    });

    if (currentSlide.length > 0) {
      slides.push(currentSlide);
    }

    return slides;
  }

  function addIndicators() {
    const indicatorContainer = document.querySelector('.slider-controls__buttons-container');
    indicatorContainer.innerHTML = '';

    for (let i = 0; i < cachedSlides.length; i++) {
      const indicator = document.createElement('button');
      indicator.classList.add('slider-controls__circle-button');
      indicator.addEventListener('click', () => {
        currentSlideIndex = i;
        showCurrentSlide();
      });

      indicatorContainer.appendChild(indicator);
    }

    updateActiveIndicators();
  }

  function updateActiveIndicators() {
    indicatorsContainer.querySelectorAll('.slider-controls__circle-button').forEach((indicator, index) => {
      indicator.classList.toggle('slider-controls__circle-button_active', index === currentSlideIndex);
    });
  }

  let isSliderInitialized = false;
  let eventListenersAdded = false;

  function initSlider() {
    if (!isSliderInitialized) {
      cachedSlides = calculateSlides();
      currentSlideIndex = Math.min(currentSlideIndex, cachedSlides.length - 1);
      addIndicators();
      showCurrentSlide();

      if (!eventListenersAdded) {
        nextButton.addEventListener('click', nextSlide);
        prevButton.addEventListener('click', prevSlide);
        eventListenersAdded = true;
      }
      isSliderInitialized = true;
    }
  }

  function deinitSlider() {
    if (isSliderInitialized) {
      steps.forEach(step => {
        step.style.visibility = '';
        step.style.position = '';
        step.style.opacity = '';
      });
      if (eventListenersAdded) {
        nextButton.removeEventListener('click', nextSlide);
        prevButton.removeEventListener('click', prevSlide);
        eventListenersAdded = false;
      }
      isSliderInitialized = false;
    }
  }

  function nextSlide() {
    if (currentSlideIndex < cachedSlides.length - 1) {
      currentSlideIndex++;
      showCurrentSlide();
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      showCurrentSlide();
    }
  }

  function checkSlideShow() {
    if (window.matchMedia('(max-width: 680px)').matches) {
      if (!isSliderInitialized) {
        initSlider();
      } else {
        cachedSlides = calculateSlides(steps);
        addIndicators();
        showCurrentSlide();
      }
    } else {
      deinitSlider();
    }
  }

  checkSlideShow();

  const debouncedCheckSlideShow = debounce(checkSlideShow, 150);
  window.addEventListener('resize', debouncedCheckSlideShow);
}

// Анимация бегущей строки
function loadFontsAndAnimateRunningLine() {
  document.fonts.load('1em "Merriweather"').then(function () {
    const runningLineContainers = document.querySelectorAll('.running-line__container');

    runningLineContainers.forEach((container) => {
      const clonedContainer = container.cloneNode(true);
      const parentSection = container.parentElement;
      parentSection.appendChild(clonedContainer);
    });

    document.querySelectorAll('.running-line__container').forEach(container => {
      container.classList.add('running-line__animated');
    });
  });
}

// Импорт функции debounce
function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
