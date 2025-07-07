import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useRouter,
  useLocation,
} from "@tanstack/react-router";
import { RouterProvider as AriaRouterProvider } from "react-aria-components";
import type { NavigateOptions, ToOptions } from "@tanstack/react-router";

import { AppContext } from "@/app.tsx";
import { UserProvider } from "@/context/user-context";
import { useUser } from "@/context/use-user";
import { LoginScreen } from "@/components/login-screen";
import { UserProfile } from "@/components/user-profile";
import { ThemeSwitcher } from "@/components/theme-switcher";

declare module "react-aria-components" {
  interface RouterConfig {
    href: ToOptions["to"]; // maps to `to`
    routerOptions: Omit<NavigateOptions, keyof ToOptions>; // maps to extra options
  }
}

export const Route = createRootRouteWithContext<AppContext>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>Route not found</p>
        <Link to="/">Start Over</Link>
      </div>
    );
  },
});

function AuthenticatedRoute() {
  const { isAuthenticated } = useUser();
  const location = useLocation();
  
  // Allow unauthenticated access to config page for initial setup
  const isConfigPage = location.pathname === '/config';
  
  if (!isAuthenticated && !isConfigPage) {
    return <LoginScreen />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="border-b border-gray-800 p-4 px-6 flex justify-between items-center bg-black bg-opacity-80">
        <div className="text-2xl font-bold text-red-600">Cipher Kids</div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher appearance="outline" showDropdown={true} />
          {isAuthenticated && <UserProfile />}
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function RootComponent() {
  const router = useRouter();

  return (
    <AriaRouterProvider
      navigate={(to, options) => router.navigate({ to, ...options })}
      useHref={(to) => router.buildLocation({ to }).href}
    >
      <div className="font-sans antialiased">
        <UserProvider>
          <AuthenticatedRoute />
        </UserProvider>
      </div>
    </AriaRouterProvider>
  );
}
