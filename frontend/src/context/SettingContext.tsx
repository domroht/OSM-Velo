import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type SettingsContext = {
  theme: "light" | "dark";
  lang: "EN" | "DA";
  units: "metric" | "imperial";
  showMapControls: boolean;

  routeColor: string;
  startPinColor: string;
  endPinColor: string;
};

const defaultSettingsContext: SettingsContext = {
  theme: "light",
  lang: "EN",
  units: "metric",
  showMapControls: true,

  routeColor: "#2563eb",
  startPinColor: "#22c55e",
  endPinColor: "#ef4444",
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