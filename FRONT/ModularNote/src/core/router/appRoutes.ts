import { createBrowserRouter } from 'react-router'
import type { DataRouter, RouteObject } from 'react-router'
import { App } from '../../App'
import { NotFoundPage } from '../../presentation/core/view/NotFoundPage'
import { NotesPage } from '../../presentation/notes/view/NotesPage'
import { QuickAddPage } from '../../presentation/notes/view/QuickAddPage'
import { appPaths } from './appPaths'

/**
 * Pages of the application: App is the layout (header + page), every other route is shown inside it.
 * Like Dependencies, this is the only place that knows the pages of every feature.
 */
export const appRoutes: RouteObject[] = [
  {
    path: appPaths.notes,
    Component: App,
    children: [
      { index: true, Component: NotesPage },
      { path: appPaths.quickAdd, Component: QuickAddPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]

/**
 * Create the router of the browser, which reads and changes the URL of the address bar
 * @returns The router to give to RouterProvider
 */
export function createAppRouter(): DataRouter {
  return createBrowserRouter(appRoutes)
}
