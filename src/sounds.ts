// Sound effect utility functions

// Play a completion sound when a task is completed
export const playCompletionSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3';
  audio.volume = 0.5;
  audio.play().catch(error => {
    console.warn('Audio playback was prevented: ', error);
  });
};

// Play an achievement sound when an achievement is unlocked
export const playAchievementSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/active_storage/sfx/1993/1993-preview.mp3';
  audio.volume = 0.5;
  audio.play().catch(error => {
    console.warn('Audio playback was prevented: ', error);
  });
};

// Play a level up sound when the user levels up
export const playLevelUpSound = () => {
  const audio = new Audio();
  audio.src = 'https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3';
  audio.volume = 0.5;
  audio.play().catch(error => {
    console.warn('Audio playback was prevented: ', error);
  });
};
