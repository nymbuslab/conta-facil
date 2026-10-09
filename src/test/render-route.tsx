import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'

import { routeTree } from '@/router'

export function renderRoute(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  })

  const utils = render(<RouterProvider router={router} />)
  return { ...utils, router }
}
