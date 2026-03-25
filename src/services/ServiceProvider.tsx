import { createContext, useContext, type ReactNode } from "react";
import type { Services } from "./types";
import { createLocalServices } from "./local";

const ServiceContext = createContext<Services | null>(null);

// デフォルトはローカル実装。将来APIに差し替える場合は
// <ServiceProvider services={createApiServices()}> とするだけ
const defaultServices = createLocalServices();

export function ServiceProvider({
  services = defaultServices,
  children,
}: {
  services?: Services;
  children: ReactNode;
}) {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices(): Services {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useServices must be used within ServiceProvider");
  return ctx;
}
