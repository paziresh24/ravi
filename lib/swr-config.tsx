"use client";

import { SWRConfig as SWRConfigComponent } from "swr";

export const SWRConfig = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfigComponent
      value={{
        errorRetryCount: 0,
        initFocus: () => undefined,
        revalidateOnFocus: false,
        fetcher: (resource, init) =>
          fetch(resource, { ...init, credentials: "include" }).then((res) => res.json()),
      }}
    >
      {children}
    </SWRConfigComponent>
  );
};
