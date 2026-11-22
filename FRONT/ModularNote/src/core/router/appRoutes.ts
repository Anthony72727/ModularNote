import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import type { DataRouter, RouteObject } from 'react-router'
import { App } from '../../App'
import { NotFoundPage } from '../../presentation/core/view/NotFoundPage'
import { NewNotePage } from '../../presentation/notes/view/NewNotePage'
import { NotesPage } from '../../presentation/notes/view/NotesPage'
import { QuickAddPage } from '../../presentation/notes/view/QuickAddPage'
import { appPaths } from './appPaths'

/**
 * Nothing to show during the short loading of a page opened directly by its URL
 */
function PageLoading(): null {
  return null
}

/**
 * Load the canvas page only when it is opened: its graph library is by far the heaviest part of the application
 */
async function loadCanvasPage(): Promise<{ Component: ComponentType }> {
  const { CanvasPage } = await import('../../presentation/canvas/view/CanvasPage')
  return { Component: CanvasPage }
}

/**
 * Pages of the application: App is the layout (header + page), every other route is shown inside it.
 * Like Dependencies, this is the only place that knows the pages of every feature.
 */
export const appRoutes: RouteObject[] = [
  {
    path: appPaths.notes,
    Component: App,
    HydrateFallback: PageLoading,
    children: [
      { index: true, Component: NotesPage },
      { path: appPaths.canvas, lazy: loadCanvasPage },
      { path: appPaths.newNote, Component: NewNotePage },
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
