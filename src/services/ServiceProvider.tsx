import type { ReactNode } from "react";
import type { Services } from "./types";
import { ServiceContext } from "./useServices";
import { createLocalServices } from "./local";

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
