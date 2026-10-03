"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { AppLoader } from "./app-loader";

type LoadingContextType = {
  loading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
  navigateWithLoader: (href: string) => void;
};

const LoadingContext =
  createContext<
    LoadingContextType | undefined
  >(undefined);

export function LoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] =
    useState(false);

  /*
   * Tells us whether the current loader was
   * started specifically for navigation.
   */
  const navigatingRef =
    useRef(false);

  /*
   * Stores the route we were on when
   * navigation began.
   */
  const previousPathRef =
    useRef(pathname);

  const showLoader = useCallback(() => {
    navigatingRef.current = false;
    setLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    navigatingRef.current = false;
    setLoading(false);
  }, []);

  const navigateWithLoader = useCallback(
    (href: string) => {
      /*
       * Prevent repeated clicks while a
       * navigation is already happening.
       */
      if (navigatingRef.current) {
        return;
      }

      /*
       * Don't show the navigation loader when
       * clicking a link to the page we're
       * already viewing.
       */
      const targetPath =
        href.split("?")[0].split("#")[0];

      if (targetPath === pathname) {
        return;
      }

      previousPathRef.current = pathname;
      navigatingRef.current = true;

      /*
       * Show the overlay BEFORE starting the
       * route transition.
       */
      setLoading(true);

      /*
       * Allow React to paint the loader first,
       * then begin navigation.
       */
      requestAnimationFrame(() => {
        router.push(href);
      });
    },
    [pathname, router]
  );

  /*
   * Keep the loader covering the OLD page.
   *
   * Only remove it after Next.js reports that
   * the pathname has actually changed.
   */
  useEffect(() => {
    if (!navigatingRef.current) {
      previousPathRef.current = pathname;
      return;
    }

    if (
      pathname === previousPathRef.current
    ) {
      return;
    }

    /*
     * pathname has changed. Wait for the next
     * browser paint so the destination page is
     * painted underneath the overlay first.
     */
    const frame = requestAnimationFrame(
      () => {
        const secondFrame =
          requestAnimationFrame(() => {
            navigatingRef.current = false;
            previousPathRef.current =
              pathname;

            setLoading(false);
          });

        return () =>
          cancelAnimationFrame(secondFrame);
      }
    );

    return () =>
      cancelAnimationFrame(frame);
  }, [pathname]);

  const value = useMemo(
    () => ({
      loading,
      showLoader,
      hideLoader,
      navigateWithLoader,
    }),
    [
      loading,
      showLoader,
      hideLoader,
      navigateWithLoader,
    ]
  );

  return (
    <LoadingContext.Provider
      value={value}
    >
      {children}

      <AppLoader open={loading} />
    </LoadingContext.Provider>
  );
}

export function useAppLoader() {
  const context =
    useContext(LoadingContext);

  if (!context) {
    throw new Error(
      "useAppLoader must be used inside LoadingProvider"
    );
  }

  return context;
}