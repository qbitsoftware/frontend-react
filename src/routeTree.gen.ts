/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AdminLayoutImport } from './routes/admin/layout'
import { Route as IndexImport } from './routes/index'
import { Route as VoistlusedIndexImport } from './routes/voistlused/index'
import { Route as UudisedIndexImport } from './routes/uudised/index'
import { Route as TereIndexImport } from './routes/tere/index'
import { Route as LoginIndexImport } from './routes/login/index'
import { Route as KontaktIndexImport } from './routes/kontakt/index'
import { Route as VoistlusedTournamentidImport } from './routes/voistlused/$tournamentid'
import { Route as UudisedBlogidImport } from './routes/uudised/$blogid'
import { Route as AdminTournamentsIndexImport } from './routes/admin/tournaments/index'
import { Route as AdminDashboardIndexImport } from './routes/admin/dashboard/index'
import { Route as AdminTournamentsTournamentidIndexImport } from './routes/admin/tournaments/$tournamentid/index'
import { Route as AdminTournamentsTournamentidParticipantsIndexImport } from './routes/admin/tournaments/$tournamentid/participants/index'

// Create Virtual Routes

const AboutLazyImport = createFileRoute('/about')()

// Create/Update Routes

const AboutLazyRoute = AboutLazyImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/about.lazy').then((d) => d.Route))

const AdminLayoutRoute = AdminLayoutImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const VoistlusedIndexRoute = VoistlusedIndexImport.update({
  id: '/voistlused/',
  path: '/voistlused/',
  getParentRoute: () => rootRoute,
} as any)

const UudisedIndexRoute = UudisedIndexImport.update({
  id: '/uudised/',
  path: '/uudised/',
  getParentRoute: () => rootRoute,
} as any)

const TereIndexRoute = TereIndexImport.update({
  id: '/tere/',
  path: '/tere/',
  getParentRoute: () => rootRoute,
} as any)

const LoginIndexRoute = LoginIndexImport.update({
  id: '/login/',
  path: '/login/',
  getParentRoute: () => rootRoute,
} as any)

const KontaktIndexRoute = KontaktIndexImport.update({
  id: '/kontakt/',
  path: '/kontakt/',
  getParentRoute: () => rootRoute,
} as any)

const VoistlusedTournamentidRoute = VoistlusedTournamentidImport.update({
  id: '/voistlused/$tournamentid',
  path: '/voistlused/$tournamentid',
  getParentRoute: () => rootRoute,
} as any)

const UudisedBlogidRoute = UudisedBlogidImport.update({
  id: '/uudised/$blogid',
  path: '/uudised/$blogid',
  getParentRoute: () => rootRoute,
} as any)

const AdminTournamentsIndexRoute = AdminTournamentsIndexImport.update({
  id: '/tournaments/',
  path: '/tournaments/',
  getParentRoute: () => AdminLayoutRoute,
} as any)

const AdminDashboardIndexRoute = AdminDashboardIndexImport.update({
  id: '/dashboard/',
  path: '/dashboard/',
  getParentRoute: () => AdminLayoutRoute,
} as any)

const AdminTournamentsTournamentidIndexRoute =
  AdminTournamentsTournamentidIndexImport.update({
    id: '/tournaments/$tournamentid/',
    path: '/tournaments/$tournamentid/',
    getParentRoute: () => AdminLayoutRoute,
  } as any)

const AdminTournamentsTournamentidParticipantsIndexRoute =
  AdminTournamentsTournamentidParticipantsIndexImport.update({
    id: '/tournaments/$tournamentid/participants/',
    path: '/tournaments/$tournamentid/participants/',
    getParentRoute: () => AdminLayoutRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminLayoutImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutLazyImport
      parentRoute: typeof rootRoute
    }
    '/uudised/$blogid': {
      id: '/uudised/$blogid'
      path: '/uudised/$blogid'
      fullPath: '/uudised/$blogid'
      preLoaderRoute: typeof UudisedBlogidImport
      parentRoute: typeof rootRoute
    }
    '/voistlused/$tournamentid': {
      id: '/voistlused/$tournamentid'
      path: '/voistlused/$tournamentid'
      fullPath: '/voistlused/$tournamentid'
      preLoaderRoute: typeof VoistlusedTournamentidImport
      parentRoute: typeof rootRoute
    }
    '/kontakt/': {
      id: '/kontakt/'
      path: '/kontakt'
      fullPath: '/kontakt'
      preLoaderRoute: typeof KontaktIndexImport
      parentRoute: typeof rootRoute
    }
    '/login/': {
      id: '/login/'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginIndexImport
      parentRoute: typeof rootRoute
    }
    '/tere/': {
      id: '/tere/'
      path: '/tere'
      fullPath: '/tere'
      preLoaderRoute: typeof TereIndexImport
      parentRoute: typeof rootRoute
    }
    '/uudised/': {
      id: '/uudised/'
      path: '/uudised'
      fullPath: '/uudised'
      preLoaderRoute: typeof UudisedIndexImport
      parentRoute: typeof rootRoute
    }
    '/voistlused/': {
      id: '/voistlused/'
      path: '/voistlused'
      fullPath: '/voistlused'
      preLoaderRoute: typeof VoistlusedIndexImport
      parentRoute: typeof rootRoute
    }
    '/admin/dashboard/': {
      id: '/admin/dashboard/'
      path: '/dashboard'
      fullPath: '/admin/dashboard'
      preLoaderRoute: typeof AdminDashboardIndexImport
      parentRoute: typeof AdminLayoutImport
    }
    '/admin/tournaments/': {
      id: '/admin/tournaments/'
      path: '/tournaments'
      fullPath: '/admin/tournaments'
      preLoaderRoute: typeof AdminTournamentsIndexImport
      parentRoute: typeof AdminLayoutImport
    }
    '/admin/tournaments/$tournamentid/': {
      id: '/admin/tournaments/$tournamentid/'
      path: '/tournaments/$tournamentid'
      fullPath: '/admin/tournaments/$tournamentid'
      preLoaderRoute: typeof AdminTournamentsTournamentidIndexImport
      parentRoute: typeof AdminLayoutImport
    }
    '/admin/tournaments/$tournamentid/participants/': {
      id: '/admin/tournaments/$tournamentid/participants/'
      path: '/tournaments/$tournamentid/participants'
      fullPath: '/admin/tournaments/$tournamentid/participants'
      preLoaderRoute: typeof AdminTournamentsTournamentidParticipantsIndexImport
      parentRoute: typeof AdminLayoutImport
    }
  }
}

// Create and export the route tree

interface AdminLayoutRouteChildren {
  AdminDashboardIndexRoute: typeof AdminDashboardIndexRoute
  AdminTournamentsIndexRoute: typeof AdminTournamentsIndexRoute
  AdminTournamentsTournamentidIndexRoute: typeof AdminTournamentsTournamentidIndexRoute
  AdminTournamentsTournamentidParticipantsIndexRoute: typeof AdminTournamentsTournamentidParticipantsIndexRoute
}

const AdminLayoutRouteChildren: AdminLayoutRouteChildren = {
  AdminDashboardIndexRoute: AdminDashboardIndexRoute,
  AdminTournamentsIndexRoute: AdminTournamentsIndexRoute,
  AdminTournamentsTournamentidIndexRoute:
    AdminTournamentsTournamentidIndexRoute,
  AdminTournamentsTournamentidParticipantsIndexRoute:
    AdminTournamentsTournamentidParticipantsIndexRoute,
}

const AdminLayoutRouteWithChildren = AdminLayoutRoute._addFileChildren(
  AdminLayoutRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminLayoutRouteWithChildren
  '/about': typeof AboutLazyRoute
  '/uudised/$blogid': typeof UudisedBlogidRoute
  '/voistlused/$tournamentid': typeof VoistlusedTournamentidRoute
  '/kontakt': typeof KontaktIndexRoute
  '/login': typeof LoginIndexRoute
  '/tere': typeof TereIndexRoute
  '/uudised': typeof UudisedIndexRoute
  '/voistlused': typeof VoistlusedIndexRoute
  '/admin/dashboard': typeof AdminDashboardIndexRoute
  '/admin/tournaments': typeof AdminTournamentsIndexRoute
  '/admin/tournaments/$tournamentid': typeof AdminTournamentsTournamentidIndexRoute
  '/admin/tournaments/$tournamentid/participants': typeof AdminTournamentsTournamentidParticipantsIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminLayoutRouteWithChildren
  '/about': typeof AboutLazyRoute
  '/uudised/$blogid': typeof UudisedBlogidRoute
  '/voistlused/$tournamentid': typeof VoistlusedTournamentidRoute
  '/kontakt': typeof KontaktIndexRoute
  '/login': typeof LoginIndexRoute
  '/tere': typeof TereIndexRoute
  '/uudised': typeof UudisedIndexRoute
  '/voistlused': typeof VoistlusedIndexRoute
  '/admin/dashboard': typeof AdminDashboardIndexRoute
  '/admin/tournaments': typeof AdminTournamentsIndexRoute
  '/admin/tournaments/$tournamentid': typeof AdminTournamentsTournamentidIndexRoute
  '/admin/tournaments/$tournamentid/participants': typeof AdminTournamentsTournamentidParticipantsIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/admin': typeof AdminLayoutRouteWithChildren
  '/about': typeof AboutLazyRoute
  '/uudised/$blogid': typeof UudisedBlogidRoute
  '/voistlused/$tournamentid': typeof VoistlusedTournamentidRoute
  '/kontakt/': typeof KontaktIndexRoute
  '/login/': typeof LoginIndexRoute
  '/tere/': typeof TereIndexRoute
  '/uudised/': typeof UudisedIndexRoute
  '/voistlused/': typeof VoistlusedIndexRoute
  '/admin/dashboard/': typeof AdminDashboardIndexRoute
  '/admin/tournaments/': typeof AdminTournamentsIndexRoute
  '/admin/tournaments/$tournamentid/': typeof AdminTournamentsTournamentidIndexRoute
  '/admin/tournaments/$tournamentid/participants/': typeof AdminTournamentsTournamentidParticipantsIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/admin'
    | '/about'
    | '/uudised/$blogid'
    | '/voistlused/$tournamentid'
    | '/kontakt'
    | '/login'
    | '/tere'
    | '/uudised'
    | '/voistlused'
    | '/admin/dashboard'
    | '/admin/tournaments'
    | '/admin/tournaments/$tournamentid'
    | '/admin/tournaments/$tournamentid/participants'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/admin'
    | '/about'
    | '/uudised/$blogid'
    | '/voistlused/$tournamentid'
    | '/kontakt'
    | '/login'
    | '/tere'
    | '/uudised'
    | '/voistlused'
    | '/admin/dashboard'
    | '/admin/tournaments'
    | '/admin/tournaments/$tournamentid'
    | '/admin/tournaments/$tournamentid/participants'
  id:
    | '__root__'
    | '/'
    | '/admin'
    | '/about'
    | '/uudised/$blogid'
    | '/voistlused/$tournamentid'
    | '/kontakt/'
    | '/login/'
    | '/tere/'
    | '/uudised/'
    | '/voistlused/'
    | '/admin/dashboard/'
    | '/admin/tournaments/'
    | '/admin/tournaments/$tournamentid/'
    | '/admin/tournaments/$tournamentid/participants/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminLayoutRoute: typeof AdminLayoutRouteWithChildren
  AboutLazyRoute: typeof AboutLazyRoute
  UudisedBlogidRoute: typeof UudisedBlogidRoute
  VoistlusedTournamentidRoute: typeof VoistlusedTournamentidRoute
  KontaktIndexRoute: typeof KontaktIndexRoute
  LoginIndexRoute: typeof LoginIndexRoute
  TereIndexRoute: typeof TereIndexRoute
  UudisedIndexRoute: typeof UudisedIndexRoute
  VoistlusedIndexRoute: typeof VoistlusedIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminLayoutRoute: AdminLayoutRouteWithChildren,
  AboutLazyRoute: AboutLazyRoute,
  UudisedBlogidRoute: UudisedBlogidRoute,
  VoistlusedTournamentidRoute: VoistlusedTournamentidRoute,
  KontaktIndexRoute: KontaktIndexRoute,
  LoginIndexRoute: LoginIndexRoute,
  TereIndexRoute: TereIndexRoute,
  UudisedIndexRoute: UudisedIndexRoute,
  VoistlusedIndexRoute: VoistlusedIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/admin",
        "/about",
        "/uudised/$blogid",
        "/voistlused/$tournamentid",
        "/kontakt/",
        "/login/",
        "/tere/",
        "/uudised/",
        "/voistlused/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/admin": {
      "filePath": "admin/layout.tsx",
      "children": [
        "/admin/dashboard/",
        "/admin/tournaments/",
        "/admin/tournaments/$tournamentid/",
        "/admin/tournaments/$tournamentid/participants/"
      ]
    },
    "/about": {
      "filePath": "about.lazy.tsx"
    },
    "/uudised/$blogid": {
      "filePath": "uudised/$blogid.tsx"
    },
    "/voistlused/$tournamentid": {
      "filePath": "voistlused/$tournamentid.tsx"
    },
    "/kontakt/": {
      "filePath": "kontakt/index.tsx"
    },
    "/login/": {
      "filePath": "login/index.tsx"
    },
    "/tere/": {
      "filePath": "tere/index.tsx"
    },
    "/uudised/": {
      "filePath": "uudised/index.tsx"
    },
    "/voistlused/": {
      "filePath": "voistlused/index.tsx"
    },
    "/admin/dashboard/": {
      "filePath": "admin/dashboard/index.tsx",
      "parent": "/admin"
    },
    "/admin/tournaments/": {
      "filePath": "admin/tournaments/index.tsx",
      "parent": "/admin"
    },
    "/admin/tournaments/$tournamentid/": {
      "filePath": "admin/tournaments/$tournamentid/index.tsx",
      "parent": "/admin"
    },
    "/admin/tournaments/$tournamentid/participants/": {
      "filePath": "admin/tournaments/$tournamentid/participants/index.tsx",
      "parent": "/admin"
    }
  }
}
ROUTE_MANIFEST_END */
