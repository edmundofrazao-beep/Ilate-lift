export type RuntimeModuleText = {
  label?: string;
  owner?: string;
  output?: string;
  report?: string;
  next?: string;
};

export type RuntimeTextConfig = {
  meta?: {
    runtimeVersion?: string;
    description?: string;
  };
  app?: {
    title?: string;
    subtitle?: string;
    workspaceElectric?: string;
    workspaceHydraulic?: string;
    footerElectric?: string;
    footerHydraulic?: string;
  };
  modules?: Record<string, RuntimeModuleText>;
};

export const loadRuntimeTextConfig = async (): Promise<RuntimeTextConfig | null> => {
  try {
    const response = await fetch('/runtime/app-text.json', { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as RuntimeTextConfig;
  } catch (error) {
    console.warn('Runtime text config could not be loaded.', error);
    return null;
  }
};
