"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { AppLoader } from "./app-loader";

type LoadingContextType = {
  loading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
  navigateWithLoader: (href: string) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined
);

export function LoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const showLoader = useCallback(() => {
    setLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setLoading(false);
  }, []);

  const navigateWithLoader = useCallback(
    (href: string) => {
      setLoading(true);

      window.setTimeout(() => {
        router.push(href);

        window.setTimeout(() => {
          setLoading(false);
        }, 300);
      }, 650);
    },
    [router]
  );

  const value = useMemo(
    () => ({
      loading,
      showLoader,
      hideLoader,
      navigateWithLoader,
    }),
    [loading, showLoader, hideLoader, navigateWithLoader]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <AppLoader open={loading} />
    </LoadingContext.Provider>
  );
}

export function useAppLoader() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error(
      "useAppLoader must be used inside LoadingProvider"
    );
  }

  return context;
}