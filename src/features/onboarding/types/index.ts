export type OnboardingStackParamList = {
  Intro: undefined;
  WorkModelSelection: undefined;
  WorkLocation: { workModel: WorkModel };
};

export type WorkModel = 'onsite' | 'hybrid' | 'remote';
