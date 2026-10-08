import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type SettingsContext = {
  mapStyle: "light" | "dark";
  units: "metric" | "imperial";
  showMapControls: boolean;
};

const defaultSettingsContext: SettingsContext = {
  mapStyle: "light",
  units: "metric",
  showMapControls: true,
};

type SettingsContextType = {
  context: SettingsContext;
  setContext: (settings: Partial<SettingsContext>) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

type SettingsProviderProps = {children: ReactNode;};

export function SettingsProvider({children}: SettingsProviderProps) {

  const [context, setContextState] = useState<SettingsContext>(() => {
    const stored = localStorage.getItem("settings-context");

    if (!stored) return defaultSettingsContext;

    try {
      return {
        ...defaultSettingsContext,
        ...JSON.parse(stored),
      };
    } catch {
      return defaultSettingsContext;
    }
  });

  function setContext(settings: Partial<SettingsContext>) {
    setContextState((current) => ({
      ...current,
      ...settings,
    }));
  }

  useEffect(() => {
    localStorage.setItem("settings-context", JSON.stringify(context));
  }, [context]);

  return (
    <SettingsContext.Provider value={{ context, setContext }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) throw new Error("useSettings must be used inside SettingsProvider");

  return context;
}